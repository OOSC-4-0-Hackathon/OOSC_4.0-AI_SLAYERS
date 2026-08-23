import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import { useAuth } from '../contexts/AuthContext';

// Import all studio components
import { CivicNavigator as StudioCivicNavigator } from '../studio_components/CivicNavigator';
import { EvidenceChecklist } from '../studio_components/EvidenceChecklist';
import { ActionPlanStepper } from '../studio_components/ActionPlanStepper';
import { DocumentDraftingTool } from '../studio_components/DocumentDraftingTool';
import { SchemeEligibilityReader } from '../studio_components/SchemeEligibilityReader';
import { ConversationalFormFiller } from '../studio_components/ConversationalFormFiller';
import { BareActsBrowser } from '../studio_components/BareActsBrowser';

const CIVIC_TABS = [
  { id: 'navigator',    label: 'Case Dossier' },
  { id: 'evidence',     label: 'Evidence Checklist' },
  { id: 'action_plan',  label: 'Action Plan' },
  { id: 'drafter',      label: 'Drafter' },
  { id: 'scheme_reader',label: 'Schemes' },
  { id: 'bare_acts',    label: 'Bare Acts' },
];

export default function CivicNavigatorPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  
  const [activeTab, setActiveTab] = useState('navigator');
  const [activeDossier, setActiveDossier] = useState(null);
  
  const presetQueryText = location.state?.presetQuery || '';

  const [savedCases, setSavedCases] = useState(() => {
    try {
      const stored = localStorage.getItem('nyaay_saved_dockets');
      if (stored) return JSON.parse(stored);
    } catch {
      // ignore
    }
    return [];
  });

  useEffect(() => {
    try {
      localStorage.setItem('nyaay_saved_dockets', JSON.stringify(savedCases));
    } catch {
      // ignore
    }
  }, [savedCases]);

  const handleSaveDossier = (dossierToSave, title) => {
    const existingIndex = savedCases.findIndex(c => c.docketNumber === dossierToSave.problemAndRights.docketId);
    if (existingIndex >= 0) return;

    const newRecord = {
      id: `case-${Date.now()}`,
      docketNumber: dossierToSave.problemAndRights.docketId,
      title: title.slice(0, 60),
      domain: dossierToSave.problemAndRights.domain,
      createdAt: new Date().toISOString(),
      status: 'ACTIVE',
      dossier: dossierToSave
    };

    setSavedCases(prev => [newRecord, ...prev]);
  };

  const handleUpdateEvidence = (itemId, isChecked) => {
    if (!activeDossier) return;
    setActiveDossier(prev => {
      const copy = { ...prev };
      const item = copy.evidenceRequired.items.find(i => i.id === itemId);
      if (item) item.checked = isChecked;
      return copy;
    });
  };

  const handleUpdateSteps = (stepNum, newStatus) => {
    if (!activeDossier) return;
    setActiveDossier(prev => {
      const copy = { ...prev };
      const step = copy.actionPlan.steps.find(s => s.stepNumber === stepNum);
      if (step) step.status = newStatus;
      return copy;
    });
  };

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Navbar tabs strip height: 40px → pt-[104px] total (64px navbar + 40px tab strip)
  return (
    <div className="min-h-screen flex flex-col bg-[#F9F8F5] ledger-grid text-[#121820] font-sans">
      <Navbar
        tabs={CIVIC_TABS}
        activeTab={activeTab}
        onTabChange={handleTabChange}
      />

      <main className="flex-1 bg-[#F9F8F5] pt-[104px] min-h-[calc(100vh-104px)] flex flex-col justify-between">
        {activeTab === 'navigator' && (
          <StudioCivicNavigator
            initialQuery={presetQueryText}
            onNavigateToTab={(tab) => {
              if (tab === 'drafter') {
                navigate('/dochub');
              } else {
                setActiveTab(tab);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }
            }}
            onSaveDossier={handleSaveDossier}
            savedDocketIds={savedCases.map(c => c.docketNumber)}
            activeDossier={activeDossier}
            setActiveDossier={setActiveDossier}
          />
        )}

        {activeTab === 'scheme_reader' && (
          <SchemeEligibilityReader
            onGoToNavigator={() => setActiveTab('navigator')}
            onGoToFormFiller={() => setActiveTab('form_filler')}
          />
        )}

        {activeTab === 'form_filler' && (
          <ConversationalFormFiller />
        )}

        {activeTab === 'evidence' && (
          <EvidenceChecklist
            dossier={activeDossier}
            onUpdateEvidence={handleUpdateEvidence}
            onGoToNavigator={() => setActiveTab('navigator')}
          />
        )}

        {activeTab === 'action_plan' && (
          <ActionPlanStepper
            dossier={activeDossier}
            onUpdateSteps={handleUpdateSteps}
            onGoToNavigator={() => setActiveTab('navigator')}
            onGoToDrafter={() => navigate('/dochub')}
          />
        )}

        {activeTab === 'drafter' && (
          <DocumentDraftingTool
            dossier={activeDossier}
            onGoToNavigator={() => setActiveTab('navigator')}
          />
        )}

        {activeTab === 'bare_acts' && (
          <BareActsBrowser
            onSelectActForQuery={(act) => {
              navigate('/know-your-kanoon', {
                state: { presetQuery: `I have a question about the ${act.title}. ` }
              });
            }}
          />
        )}
      </main>

      <Footer />
    </div>
  );
}
