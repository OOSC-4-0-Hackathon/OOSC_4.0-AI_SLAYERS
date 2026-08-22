import React, { useState, useEffect } from 'react';
import { Navigation, ActiveTab } from './components/Navigation';
import { LandingPage } from './components/LandingPage';
import { CivicNavigator } from './components/CivicNavigator';
import { SchemeEligibilityReader } from './components/SchemeEligibilityReader';
import { ConversationalFormFiller } from './components/ConversationalFormFiller';
import { EvidenceChecklist } from './components/EvidenceChecklist';
import { ActionPlanStepper } from './components/ActionPlanStepper';
import { DocumentDraftingTool } from './components/DocumentDraftingTool';
import { BareActsBrowser } from './components/BareActsBrowser';
import { AuthModal } from './components/AuthModal';
import { SavedDocketsModal } from './components/SavedDocketsModal';
import { UnbrokenDemoFlowController } from './components/UnbrokenDemoFlowController';
import { FivePartCaseDossier, SavedCaseRecord, EvidenceItem, ActionPlanStep, BareAct } from './types';
import { generateFivePartDossier } from './data/caseEngine';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('landing');
  const [activeDossier, setActiveDossier] = useState<FivePartCaseDossier | null>(null);
  const [presetQueryText, setPresetQueryText] = useState<string>('');
  
  // Modals & Flow Controller
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [isSavedModalOpen, setIsSavedModalOpen] = useState<boolean>(false);
  const [isDemoFlowOpen, setIsDemoFlowOpen] = useState<boolean>(false);
  const [userEmail, setUserEmail] = useState<string | null>('citizen.advocate@nyaay.in');

  // Saved Case Dockets State
  const [savedCases, setSavedCases] = useState<SavedCaseRecord[]>(() => {
    try {
      const stored = localStorage.getItem('nyaay_saved_dockets');
      if (stored) return JSON.parse(stored);
    } catch {
      // fallback
    }

    // Default Seed Saved Docket
    const initialSeed = generateFivePartDossier('RTI Application filed 38 days ago with Municipal Corporation regarding road repair tender not answered');
    return [
      {
        id: 'seed-rti-docket',
        docketNumber: initialSeed.problemAndRights.docketId,
        title: 'Municipal Road Repair Tender RTI (Deemed Refusal)',
        domain: 'RTI',
        createdAt: new Date().toISOString(),
        status: 'ACTIVE',
        dossier: initialSeed
      }
    ];
  });

  // Initialize with seed dossier so tools are instantly working
  useEffect(() => {
    if (!activeDossier && savedCases.length > 0) {
      setActiveDossier(savedCases[0].dossier);
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('nyaay_saved_dockets', JSON.stringify(savedCases));
    } catch {
      // ignore
    }
  }, [savedCases]);

  const handleStartQuery = (text?: string) => {
    if (text) {
      setPresetQueryText(text);
      const generated = generateFivePartDossier(text);
      setActiveDossier(generated);
    }
    setActiveTab('navigator');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSaveDossier = (dossierToSave: FivePartCaseDossier, title: string) => {
    const existingIndex = savedCases.findIndex(c => c.docketNumber === dossierToSave.problemAndRights.docketId);
    if (existingIndex >= 0) {
      // already saved
      return;
    }

    const newRecord: SavedCaseRecord = {
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

  const handleDeleteCase = (id: string) => {
    setSavedCases(prev => prev.filter(c => c.id !== id));
  };

  const handleOpenSavedCase = (record: SavedCaseRecord) => {
    setActiveDossier(record.dossier);
    setActiveTab('navigator');
  };

  const handleUpdateEvidence = (updatedItems: EvidenceItem[]) => {
    if (!activeDossier) return;
    const updated = {
      ...activeDossier,
      evidenceRequired: {
        ...activeDossier.evidenceRequired,
        items: updatedItems
      }
    };
    setActiveDossier(updated);
  };

  const handleUpdateSteps = (updatedSteps: ActionPlanStep[]) => {
    if (!activeDossier) return;
    const updated = {
      ...activeDossier,
      actionPlan: {
        ...activeDossier.actionPlan,
        steps: updatedSteps
      }
    };
    setActiveDossier(updated);
  };

  const handleSelectActForQuery = (act: BareAct) => {
    const query = `Under ${act.title} (${act.actCode}), what are my citizen remedies and procedural steps for compliance failure regarding ${act.keySections[0]}?`;
    setPresetQueryText(query);
    const generated = generateFivePartDossier(query);
    setActiveDossier(generated);
    setActiveTab('navigator');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F9F8F5] text-[#121820]">
      {/* Navigation Header */}
      <Navigation
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        activeDocketId={activeDossier?.problemAndRights.docketId}
        activeDomain={activeDossier?.problemAndRights.domain}
        savedCasesCount={savedCases.length}
        onOpenSavedModal={() => setIsSavedModalOpen(true)}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
        onStartDemoFlow={() => setIsDemoFlowOpen(true)}
        userEmail={userEmail}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {activeTab === 'landing' && (
          <LandingPage
            onStartQuery={handleStartQuery}
            onExploreActs={() => {
              setActiveTab('bare_acts');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onStartDemoFlow={() => setIsDemoFlowOpen(true)}
            onNavigateToTab={(tab) => {
              setActiveTab(tab as ActiveTab);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        )}

        {activeTab === 'navigator' && (
          <CivicNavigator
            initialQuery={presetQueryText}
            onNavigateToTab={(tab) => {
              setActiveTab(tab);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onSaveDossier={handleSaveDossier}
            savedDocketIds={savedCases.map(c => c.docketNumber)}
            activeDossier={activeDossier}
            setActiveDossier={setActiveDossier}
          />
        )}

        {activeTab === 'scheme_reader' && (
          <SchemeEligibilityReader
            onGoToNavigator={() => {
              setActiveTab('navigator');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onGoToFormFiller={(schemeCode) => {
              setActiveTab('form_filler');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
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
            onGoToDrafter={() => setActiveTab('drafter')}
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
            onSelectActForQuery={handleSelectActForQuery}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-[#121820] text-[#FAF7F2] border-t border-[#242F3E] py-8 text-xs font-mono">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <span className="font-serif font-black text-lg text-white">NYAAY AI</span>
            <span className="text-[#556377]">|</span>
            <span className="text-[#A2B1C6]">OOSC 4.0 CIVIC & LEGAL EMPOWERMENT TRACK</span>
          </div>

          <div className="flex items-center space-x-4 text-[#8997AB]">
            <span>93 BARE ACTS GROUNDED</span>
            <span>•</span>
            <span>CHROMA + BM25 RRF PIPELINE</span>
            <span>•</span>
            <span className="text-[#C84B31] font-bold">THE CASE FILE, MADE LEGIBLE</span>
          </div>
        </div>
      </footer>

      {/* Modals & Flow Controllers */}
      <UnbrokenDemoFlowController
        isOpen={isDemoFlowOpen}
        onClose={() => setIsDemoFlowOpen(false)}
        onLoadScenario={(query) => {
          handleStartQuery(query);
        }}
        onSelectTab={(tab) => {
          setActiveTab(tab);
        }}
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onLogin={(email) => setUserEmail(email)}
        userEmail={userEmail}
        onLogout={() => setUserEmail(null)}
      />

      <SavedDocketsModal
        isOpen={isSavedModalOpen}
        onClose={() => setIsSavedModalOpen(false)}
        savedCases={savedCases}
        onOpenCase={handleOpenSavedCase}
        onDeleteCase={handleDeleteCase}
      />
    </div>
  );
}
