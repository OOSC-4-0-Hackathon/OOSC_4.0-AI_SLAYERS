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

// We import the Navigation from studio_components to use its tab bar, 
// but we will render it without the top header since we have Navbar.
import { Navigation } from '../studio_components/Navigation';

export default function CivicNavigatorPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  
  // State for tabs and dossier
  const [activeTab, setActiveTab] = useState('navigator');
  const [activeDossier, setActiveDossier] = useState(null);
  
  // Preset query if redirected from Landing page
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

  // We wrap the workspace to give it a similar look to the studio
  return (
    <div className="min-h-screen flex flex-col bg-[#F9F8F5] ledger-grid text-[#121820] font-sans">
      <Navbar />

      {/* Render the studio tab navigation right below our main navbar */}
      <div className="mt-16">
        <div className="bg-[#121820] text-white overflow-x-auto border-b border-[#242F3E]">
           <div className="max-w-7xl mx-auto px-4 sm:px-6 flex space-x-6">
              {[
                { id: 'navigator', label: 'CASE DOSSIER' },
                { id: 'evidence', label: 'EVIDENCE CHECKLIST' },
                { id: 'action_plan', label: 'ACTION PLAN' },
                { id: 'drafter', label: 'DRAFTER' },
                { id: 'scheme_reader', label: 'SCHEMES' },
                { id: 'bare_acts', label: 'BARE ACTS' }
              ].map(tab => (
                 <button
                   key={tab.id}
                   onClick={() => {
                     if (tab.id === 'drafter') {
                       navigate('/dochub');
                     } else {
                       setActiveTab(tab.id);
                     }
                   }}
                   className={`whitespace-nowrap py-3 text-xs font-mono font-bold tracking-wider border-b-2 transition-colors ${
                     activeTab === tab.id 
                       ? 'border-[#C84B31] text-[#C84B31]' 
                       : 'border-transparent text-[#7A8699] hover:text-[#FAF7F2]'
                   }`}
                 >
                   {tab.label}
                 </button>
              ))}
           </div>
        </div>
      </div>

      <main className="flex-1 bg-[#F9F8F5]">
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
