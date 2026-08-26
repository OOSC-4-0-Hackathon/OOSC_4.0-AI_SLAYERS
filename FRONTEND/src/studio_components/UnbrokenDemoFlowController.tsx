import React, { useState, useEffect } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  X, 
  ArrowRight, 
  ArrowLeft, 
  CheckCircle2, 
  Sparkles, 
  Clock, 
  ShieldAlert, 
  FileCheck2, 
  Milestone, 
  FileText,
  Layers,
  ChevronRight
} from 'lucide-react';
import { ActiveTab } from './Navigation';
import { FivePartCaseDossier } from '../types';

interface UnbrokenDemoFlowControllerProps {
  isOpen: boolean;
  onClose: () => void;
  activeTab: ActiveTab;
  onSetTab: (tab: ActiveTab) => void;
  onExecuteDemoCase: (presetQuery: string) => void;
  activeDossier: FivePartCaseDossier | null;
}

interface FlowStep {
  id: number;
  title: string;
  tab: ActiveTab;
  durationSeconds: number;
  badge: string;
  description: string;
  judicialProof: string;
}

const DEMO_FLOW_STEPS: FlowStep[] = [
  {
    id: 1,
    title: 'Grievance Input & 0ms Regex Classification',
    tab: 'navigator',
    durationSeconds: 15,
    badge: '0ms LATENCY',
    description: 'Citizen inputs raw dispute. Deterministic regex routes to exact statutory domain with zero latency before LLM invocation.',
    judicialProof: 'Matched: Municipal Road Repair Tender RTI (RTI Act 2005 Sec 7)'
  },
  {
    id: 2,
    title: 'Hybrid RRF Convergence (93 → 34 → 1)',
    tab: 'navigator',
    durationSeconds: 15,
    badge: 'RRF PIPELINE',
    description: 'Chroma dense vector retrieval fuses with BM25 sparse keyword ranking, narrowing 93 Bare Acts down to 1 decisive statute in 380ms.',
    judicialProof: 'Fused RRF Score: 0.941 • Time-to-First-Token: 382ms'
  },
  {
    id: 3,
    title: 'Part 01: Grounded Statutory Shield & Rights',
    tab: 'navigator',
    durationSeconds: 15,
    badge: 'STATUTORY QUOTE',
    description: 'Extracts exact enforceable legislative rights under Section 7(2) Deemed Refusal & Section 19(1) First Appeal.',
    judicialProof: 'Invariable 5-part courtroom structure generated in a single deterministic pass.'
  },
  {
    id: 4,
    title: 'Part 02: Evidentiary Audit & BSA 2023 Checklist',
    tab: 'evidence',
    durationSeconds: 15,
    badge: 'BSA 2023 STANDARD',
    description: 'Audits physical and electronic documentary proof, computing live admissibility score before tribunal submission.',
    judicialProof: 'Section 63 BSA 2023 Electronic Certificate & Speed Post Tracking Slip audited.'
  },
  {
    id: 5,
    title: 'Part 04: Phased Action Plan & Limitation Act Window',
    tab: 'action_plan',
    durationSeconds: 15,
    badge: 'LIMITATION ACT 1963',
    description: 'Calculates strict statutory limitation countdowns (30-day RTI appeal deadline) with 1-click ICS calendar export.',
    judicialProof: 'Enforces mandatory 30-day statutory appeal window preventing forfeiture.'
  },
  {
    id: 6,
    title: 'Part 05: Single-Pass Legal Notice Drafting',
    tab: 'drafter',
    durationSeconds: 15,
    badge: 'JUDICIAL PROFORMA',
    description: 'Assembles courtroom-compliant legal notice with real-time highlighted token replacement, ready to copy, print, or save as PDF.',
    judicialProof: 'Verified statutory draft with live bracketed placeholder substitution.'
  }
];

export const UnbrokenDemoFlowController: React.FC<UnbrokenDemoFlowControllerProps> = ({
  isOpen,
  onClose,
  activeTab,
  onSetTab,
  onExecuteDemoCase,
  activeDossier
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState<boolean>(true);
  const [secondsRemainingInStep, setSecondsRemainingInStep] = useState<number>(15);

  const step = DEMO_FLOW_STEPS[currentStepIndex];

  // Auto-play timer loop
  useEffect(() => {
    if (!isOpen || !isAutoPlaying) return;

    const timer = setInterval(() => {
      setSecondsRemainingInStep((prev) => {
        if (prev <= 1) {
          // Advance to next step
          if (currentStepIndex < DEMO_FLOW_STEPS.length - 1) {
            const nextIdx = currentStepIndex + 1;
            setCurrentStepIndex(nextIdx);
            onSetTab(DEMO_FLOW_STEPS[nextIdx].tab);
            return DEMO_FLOW_STEPS[nextIdx].durationSeconds;
          } else {
            // End of flow
            setIsAutoPlaying(false);
            return 0;
          }
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen, isAutoPlaying, currentStepIndex, onSetTab]);

  // Initial trigger when opening modal
  useEffect(() => {
    if (isOpen) {
      setCurrentStepIndex(0);
      setSecondsRemainingInStep(DEMO_FLOW_STEPS[0].durationSeconds);
      setIsAutoPlaying(true);
      onSetTab('navigator');
      onExecuteDemoCase('RTI Application filed 38 days ago with Municipal Corporation regarding ward road repair tender expenses ignored by PIO.');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleStepSelect = (idx: number) => {
    setCurrentStepIndex(idx);
    setSecondsRemainingInStep(DEMO_FLOW_STEPS[idx].durationSeconds);
    onSetTab(DEMO_FLOW_STEPS[idx].tab);
  };

  const handleNext = () => {
    if (currentStepIndex < DEMO_FLOW_STEPS.length - 1) {
      handleStepSelect(currentStepIndex + 1);
    }
  };

  const handlePrev = () => {
    if (currentStepIndex > 0) {
      handleStepSelect(currentStepIndex - 1);
    }
  };

  const handleRestart = () => {
    handleStepSelect(0);
    setIsAutoPlaying(true);
    onExecuteDemoCase('RTI Application filed 38 days ago with Municipal Corporation regarding ward road repair tender expenses ignored by PIO.');
  };

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 max-w-5xl mx-auto">
      <div className="bg-[#121820] text-[#FAF7F2] border-2 border-[#C84B31] rounded-[2px] shadow-2xl overflow-hidden animate-stamp">
        {/* Top Progress Bar */}
        <div className="w-full bg-[#2B3542] h-1.5 overflow-hidden">
          <div 
            className="bg-[#C84B31] h-full transition-all duration-300"
            style={{ 
              width: `${((currentStepIndex * 15 + (15 - secondsRemainingInStep)) / 90) * 100}%` 
            }}
          />
        </div>

        {/* Header Bar */}
        <div className="px-4 sm:px-6 py-2.5 bg-[#1A222D] border-b border-[#2B3542] flex items-center justify-between text-xs font-mono">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-[#C84B31] animate-pulse" />
            <span className="font-bold tracking-wider text-white uppercase">
              ⚡ 90-SECOND UNBROKEN JUDICIAL DEMO FLOW
            </span>
            <span className="text-[#556377]">|</span>
            <span className="text-emerald-400">
              STEP {currentStepIndex + 1} OF {DEMO_FLOW_STEPS.length}
            </span>
          </div>

          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-1.5 text-xs text-[#A2B1C6]">
              <Clock className="w-3.5 h-3.5 text-[#C84B31]" />
              <span>STEP TIME: <strong>{secondsRemainingInStep}s</strong></span>
            </div>

            <button
              onClick={() => setIsAutoPlaying(!isAutoPlaying)}
              className="px-2 py-0.5 border border-[#475467] hover:border-white rounded-[2px] text-[11px] transition-colors"
            >
              {isAutoPlaying ? 'PAUSE' : 'RESUME'}
            </button>

            <button
              onClick={handleRestart}
              className="px-2 py-0.5 border border-[#475467] hover:border-white rounded-[2px] text-[11px] transition-colors"
              title="Restart 90s flow"
            >
              RESTART
            </button>

            <button
              onClick={onClose}
              className="text-[#A2B1C6] hover:text-white p-1 rounded-[2px]"
              aria-label="Exit Demo Flow"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Step Navigation Pill Strip */}
        <div className="bg-[#1A222D] px-4 py-2 border-b border-[#2B3542] flex items-center gap-1.5 overflow-x-auto text-[11px] font-mono">
          {DEMO_FLOW_STEPS.map((s, idx) => (
            <button
              key={s.id}
              onClick={() => handleStepSelect(idx)}
              className={`px-2.5 py-1 rounded-[2px] transition-colors flex items-center space-x-1 whitespace-nowrap ${
                currentStepIndex === idx
                  ? 'bg-[#C84B31] text-white font-bold'
                  : currentStepIndex > idx
                    ? 'bg-[#2B3542] text-emerald-400'
                    : 'bg-[#1A222D] text-[#667085] hover:text-[#A2B1C6]'
              }`}
            >
              <span>{idx + 1}. {s.badge}</span>
              {currentStepIndex > idx && <CheckCircle2 className="w-3 h-3 text-emerald-400" />}
            </button>
          ))}
        </div>

        {/* Main Step Content */}
        <div className="p-4 sm:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1.5 flex-1">
            <div className="flex items-center space-x-2">
              <span className="stamp-badge text-[9px] px-1.5 py-0.2">
                ACTIVE FOCUS
              </span>
              <h4 className="font-serif font-bold text-lg text-white">
                {step.title}
              </h4>
            </div>

            <p className="text-xs text-[#A2B1C6] font-sans leading-relaxed">
              {step.description}
            </p>

            <div className="text-[11px] font-mono text-emerald-400 bg-[#1A222D] px-2.5 py-1 border border-[#2B3542] rounded-[2px] inline-block">
              JUDICIAL BENCHMARK: {step.judicialProof}
            </div>
          </div>

          {/* Stepper Buttons */}
          <div className="flex items-center space-x-2 shrink-0 w-full md:w-auto justify-end">
            <button
              onClick={handlePrev}
              disabled={currentStepIndex === 0}
              className="px-3 py-2 border border-[#475467] disabled:opacity-40 hover:bg-[#2B3542] text-white font-mono text-xs rounded-[2px] transition-colors flex items-center space-x-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>PREV</span>
            </button>

            {currentStepIndex < DEMO_FLOW_STEPS.length - 1 ? (
              <button
                onClick={handleNext}
                className="px-4 py-2 bg-[#C84B31] hover:bg-[#A83C25] text-white font-mono text-xs font-bold rounded-[2px] transition-colors flex items-center space-x-1.5 shadow-xs"
              >
                <span>NEXT STEP</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                onClick={onClose}
                className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-mono text-xs font-bold rounded-[2px] transition-colors flex items-center space-x-1.5"
              >
                <span>COMPLETE FLOW</span>
                <CheckCircle2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
