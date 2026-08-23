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
  { id: 'form_filler',  label: 'Form Filler' },
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

  // Sync activeDossier updates (like evidence checks) back to savedCases
  useEffect(() => {
    if (activeDossier) {
      setSavedCases(prev => prev.map(c => 
        c.docketNumber === activeDossier?.problemAndRights?.docketId 
          ? { ...c, dossier: activeDossier } 
          : c
      ));
    }
  }, [activeDossier]);

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
    if (tabId === 'drafter') {
      navigate('/dochub');
    } else {
      setActiveTab(tabId);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Navbar tabs strip height: 40px → pt-[104px] total (64px navbar + 40px tab strip)
  return (
    <div className="min-h-screen flex flex-col bg-[#F9F8F5] ledger-grid text-[#121820] font-sans">
      <Navbar
        tabs={CIVIC_TABS}
        activeTab={activeTab}
        onTabChange={handleTabChange}
      />

      <main className="flex-1 bg-[#F9F8F5] pt-[104px] min-h-[calc(100vh-104px)] flex overflow-hidden">
        {/* SIDEBAR FOR SAVED DOSSIERS */}
        <div className="w-80 bg-[#FAF7F2] border-r border-[#E5E7EB] flex flex-col h-full hidden md:flex shrink-0">
          <div className="p-4 border-b border-[#E5E7EB] flex items-center justify-between bg-white">
            <h2 className="font-serif font-bold text-[#121820]">Saved Dossiers</h2>
            <button 
              onClick={() => {
                setActiveDossier(null);
                setActiveTab('navigator');
              }} 
              className="text-[10px] bg-[#121820] text-white px-3 py-1.5 rounded-[2px] font-bold font-mono tracking-wider hover:bg-[#C84B31] transition-colors"
            >
              + NEW CASE
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {savedCases.length === 0 ? (
              <p className="text-xs text-[#7A8699] text-center mt-10 font-mono">No cases saved yet.</p>
            ) : (
              savedCases.map(c => (
                <div 
                  key={c.id} 
                  onClick={() => {
                    if (!c.dossier || !c.dossier.problemAndRights || !c.dossier.evidenceRequired || !c.dossier.actionPlan) {
                      alert('This case dossier uses an outdated structure and cannot be opened. Please run a new query.');
                      return;
                    }
                    setActiveDossier(c.dossier);
                    setActiveTab('navigator');
                  }}
                  className={`p-3 rounded-[2px] cursor-pointer border transition-all ${
                    activeDossier?.problemAndRights?.docketId === c.docketNumber 
                    ? 'bg-white border-[#C84B31] shadow-sm ring-1 ring-[#C84B31]/10' 
                    : 'bg-white/50 border-[#E5E7EB] hover:bg-white hover:border-[#C84B31]/50'
                  }`}
                >
                  <div className="text-[9px] font-mono font-bold text-[#C84B31] mb-1.5 tracking-wider">{c.docketNumber}</div>
                  <div className="text-sm font-bold text-[#121820] line-clamp-2 leading-snug">{c.title}</div>
                  <div className="text-[10px] font-mono text-[#7A8699] mt-3 flex justify-between items-center border-t border-dashed border-[#E5E7EB] pt-2">
                    <span className="truncate pr-2">{c.domain}</span>
                    <span className="shrink-0">{new Date(c.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* MAIN AREA */}
        <div className="flex-1 overflow-y-auto bg-[#F9F8F5]">
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
        </div>
      </main>

      <Footer />
    </div>
  );
}
