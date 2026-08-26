import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  ArrowRight, 
  Zap, 
  Sparkles, 
  ShieldCheck, 
  FileCheck2, 
  Building2, 
  Milestone, 
  FileText,
  Clock,
  Terminal,
  CheckCircle2
} from 'lucide-react';

interface LiveStreamingDemoHeroProps {
  onOpenDossierInNavigator: (queryText: string) => void;
}

interface DemoScenario {
  id: string;
  label: string;
  domain: string;
  query: string;
  statute: string;
  section: string;
  ttftMs: number;
  rightsQuote: string;
  evidenceMandatory: string;
  authority: string;
  actionTimeline: string;
  documentType: string;
}

const DEMO_SCENARIOS: DemoScenario[] = [
  {
    id: 'tenancy-deposit',
    label: 'Tenancy Deposit Withheld',
    domain: 'PROPERTY & TENANCY',
    query: 'Landlord withholding ₹45,000 security deposit for 75 days post-moveout claiming standard wall repainting despite clean handover.',
    statute: 'Transfer of Property Act 1882 & Model Tenancy Act',
    section: 'Sec 106 & Sec 108(m)',
    ttftMs: 382,
    rightsQuote: 'Sec 108(m) strictly exempts normal wear & tear. Arbitrary withholding past 30 days is unlawful detention of money with 18% p.a. statutory interest claim.',
    evidenceMandatory: 'Bank transaction transfer receipt + Move-out video with date timestamp + Move-out keys handover written receipt.',
    authority: 'Rent Control Court / Rent Authority & District Consumer Commission (Deficiency of Housing Service).',
    actionTimeline: 'Day 1: Formal Demand Notice (15 days) → Day 16: File Application before Rent Authority.',
    documentType: 'Statutory Demand Notice for Full Security Deposit Refund'
  },
  {
    id: 'rti-delay',
    label: 'RTI 38-Day Deemed Refusal',
    domain: 'CIVIC & RTI',
    query: 'RTI application filed 38 days ago with Municipal Corporation regarding ward road repair tender fund disbursement ignored.',
    statute: 'Right to Information Act, 2005',
    section: 'Sec 7(2) & Sec 19(1)',
    ttftMs: 365,
    rightsQuote: 'Failure to reply within 30 days legally constitutes Deemed Refusal under Sec 7(2). Unlocks right to First Appeal without fresh fees.',
    evidenceMandatory: 'Speed Post Tracking Consignment Slip + Original RTI Application with ₹10 Court Fee Receipt.',
    authority: 'First Appellate Authority (FAA), Municipal Corporation Headquarters.',
    actionTimeline: 'Day 31: Deemed Refusal triggered → Day 35: File First Appeal under Sec 19(1) (30-day window).',
    documentType: 'Memorandum of First Appeal under Section 19(1) RTI Act'
  },
  {
    id: 'warranty-rejection',
    label: 'Defective Laptop Warranty',
    domain: 'CONSUMER PROTECTION',
    query: 'Authorized service center rejected motherboard warranty repair on 4-month-old laptop claiming customer fault without technical proof.',
    statute: 'Consumer Protection Act, 2019',
    section: 'Sec 2(11) & Sec 84',
    ttftMs: 395,
    rightsQuote: 'Under Sec 84, manufacturer is strictly liable for defects within warranty period. Blanket denial without diagnostic log is unfair trade practice.',
    evidenceMandatory: 'Original tax invoice + Service center job-sheet stating rejection + Warranty certificate card.',
    authority: 'District Consumer Disputes Redressal Commission (DCDRC) via e-Daakhil portal.',
    actionTimeline: 'Day 1: Legal Notice via Registered Post (15 days) → Day 16: File Consumer Complaint on e-Daakhil.',
    documentType: 'Legal Notice for Immediate Warranty Replacement & Compensation'
  },
  {
    id: 'rera-delay',
    label: 'Delayed Apartment Handover',
    domain: 'RERA REAL ESTATE',
    query: 'Builder delayed flat handover by 18 months past RERA agreement date and refuses to pay statutory monthly delay interest.',
    statute: 'Real Estate (Regulation and Development) Act, 2016',
    section: 'Sec 18(1) & Sec 31',
    ttftMs: 410,
    rightsQuote: 'Under Sec 18(1), allottee is entitled to monthly interest at SBI MCLR + 2% for every month of delay until actual physical possession.',
    evidenceMandatory: 'Registered Agreement for Sale + All installment payment receipts + RERA Registration Certificate copy.',
    authority: 'State Real Estate Regulatory Authority (RERA) Adjudicating Officer.',
    actionTimeline: 'Day 1: Form ‘M’ Complaint submission on State RERA web portal → Day 45: First Conciliation Hearing.',
    documentType: 'Statutory Notice for Interest on Delayed Possession under Sec 18 RERA'
  }
];

export const LiveStreamingDemoHero: React.FC<LiveStreamingDemoHeroProps> = ({
  onOpenDossierInNavigator
}) => {
  const [activeScenarioIndex, setActiveScenarioIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [elapsedMs, setElapsedMs] = useState<number>(0);
  const [typedChars, setTypedChars] = useState<number>(0);
  const [activeNarrowStage, setActiveNarrowStage] = useState<number>(1); // 1: 93, 2: 34, 3: 1
  const [streamedPartIndex, setStreamedPartIndex] = useState<number>(0);

  const scenario = DEMO_SCENARIOS[activeScenarioIndex];

  // Simulation timer loop
  useEffect(() => {
    if (!isPlaying) return;

    const startTime = Date.now() - elapsedMs;
    const interval = setInterval(() => {
      const current = Date.now() - startTime;
      setElapsedMs(current);

      // Typing phase (0ms to 1200ms)
      const queryLen = scenario.query.length;
      if (current < 1200) {
        const chars = Math.min(queryLen, Math.floor((current / 1200) * queryLen));
        setTypedChars(chars);
        setActiveNarrowStage(1);
        setStreamedPartIndex(0);
      } 
      // Narrowing phase 1 -> 2 (1200ms to 1600ms)
      else if (current < 1600) {
        setTypedChars(queryLen);
        setActiveNarrowStage(2);
        setStreamedPartIndex(0);
      }
      // Narrowing phase 2 -> 3 (1600ms to 2000ms - TTFT reached!)
      else if (current < 2000) {
        setTypedChars(queryLen);
        setActiveNarrowStage(3);
        setStreamedPartIndex(1);
      }
      // Streaming 5-part structure (2000ms to 3800ms)
      else if (current < 3800) {
        setTypedChars(queryLen);
        setActiveNarrowStage(3);
        const part = Math.min(5, Math.floor(((current - 2000) / 1800) * 5) + 1);
        setStreamedPartIndex(part);
      }
      // Complete & loop after 7 seconds
      else if (current > 7000) {
        // Next scenario
        setActiveScenarioIndex((prev) => (prev + 1) % DEMO_SCENARIOS.length);
        setElapsedMs(0);
        setTypedChars(0);
        setActiveNarrowStage(1);
        setStreamedPartIndex(0);
      }
    }, 30);

    return () => clearInterval(interval);
  }, [isPlaying, activeScenarioIndex, elapsedMs, scenario.query]);

  const handleSelectScenario = (idx: number) => {
    setActiveScenarioIndex(idx);
    setElapsedMs(0);
    setTypedChars(0);
    setActiveNarrowStage(1);
    setStreamedPartIndex(0);
    setIsPlaying(true);
  };

  const handleRestart = () => {
    setElapsedMs(0);
    setTypedChars(0);
    setActiveNarrowStage(1);
    setStreamedPartIndex(0);
    setIsPlaying(true);
  };

  return (
    <div className="border border-[#121820] bg-white rounded-[2px] shadow-md overflow-hidden space-y-0">
      {/* Top Telemetry & Control Bar */}
      <div className="bg-[#121820] text-[#FAF7F2] px-4 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs font-mono border-b border-[#2B3542]">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-1.5 text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="font-bold tracking-wider uppercase">LIVE STREAMING BENCHMARK</span>
          </div>
          <span className="text-[#556377] hidden sm:inline">|</span>
          <span className="text-[#A2B1C6] hidden sm:inline font-mono">
            SUB-500MS TTFT PROOF ENGINE
          </span>
        </div>

        {/* Live Millisecond Counter & Controls */}
        <div className="flex items-center space-x-3">
          <div className="bg-[#1A222D] px-2.5 py-1 rounded-[2px] border border-[#2B3542] flex items-center space-x-1.5 font-mono text-[11px]">
            <Clock className="w-3.5 h-3.5 text-[#C84B31]" />
            <span className="text-[#A2B1C6]">LATENCY:</span>
            <span className="font-bold text-emerald-400 w-12 text-right">
              {Math.min(elapsedMs, scenario.ttftMs)}ms
            </span>
          </div>

          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="p-1 text-[#A2B1C6] hover:text-white rounded-[2px] transition-colors focus-visible:ring-2 focus-visible:ring-[#C84B31] focus-visible:outline-none"
            title={isPlaying ? "Pause Live Demo" : "Play Live Demo"}
            aria-label={isPlaying ? "Pause Live Demo" : "Play Live Demo"}
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
          </button>

          <button
            onClick={handleRestart}
            className="p-1 text-[#A2B1C6] hover:text-white rounded-[2px] transition-colors focus-visible:ring-2 focus-visible:ring-[#C84B31] focus-visible:outline-none"
            title="Restart Benchmark Simulation"
            aria-label="Restart Benchmark Simulation"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Scenario Selector Pills */}
      <div className="bg-[#F2EFE9] px-4 py-2 border-b border-[#E4DFD5] flex items-center gap-2 overflow-x-auto">
        <span className="text-[10px] font-mono text-[#667085] uppercase font-bold shrink-0">
          SELECT DISPUTE BENCHMARK:
        </span>
        {DEMO_SCENARIOS.map((sc, idx) => (
          <button
            key={sc.id}
            onClick={() => handleSelectScenario(idx)}
            className={`px-2.5 py-1 rounded-[2px] font-mono text-xs transition-all whitespace-nowrap ${
              activeScenarioIndex === idx
                ? 'bg-[#121820] text-white font-bold shadow-xs'
                : 'bg-white text-[#556377] hover:text-[#121820] border border-[#E4DFD5]'
            }`}
          >
            {sc.label}
          </button>
        ))}
      </div>

      {/* Main Terminal & Live Stream Output Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-[#E4DFD5]">
        {/* Left: Query Typing Input & RRF Narrowing Telemetry */}
        <div className="lg:col-span-5 p-5 space-y-4 bg-[#FAF7F2]">
          {/* Simulated Input Window */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-[11px] font-mono">
              <span className="font-bold text-[#121820] uppercase">// CITIZEN GRIEVANCE INPUT</span>
              <span className="text-emerald-700 font-bold">0ms DETERMINISTIC REGEX</span>
            </div>

            <div className="p-3 bg-white border border-[#121820] rounded-[2px] font-mono text-xs text-[#121820] min-h-[90px] shadow-xs relative">
              <span>{scenario.query.slice(0, typedChars)}</span>
              {typedChars < scenario.query.length && (
                <span className="inline-block w-1.5 h-3.5 bg-[#C84B31] ml-0.5 animate-pulse align-middle" />
              )}
            </div>
          </div>

          {/* RRF Narrowing Convergence Visualizer ("93 -> 34 -> 1") */}
          <div className="border border-[#E4DFD5] bg-white p-3.5 rounded-[2px] space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-bold text-[#C84B31] uppercase">
                // RRF NARROWING PIPELINE
              </span>
              <span className="font-mono text-[11px] font-bold bg-[#121820] text-[#FAF7F2] px-2 py-0.5 rounded-[2px]">
                {activeNarrowStage === 1 ? '93 BARE ACTS' : activeNarrowStage === 2 ? '34 CANDIDATES' : '1 GROUNDED STATUTE'}
              </span>
            </div>

            {/* Visual Step Pipeline Bar */}
            <div className="grid grid-cols-3 gap-1.5 text-center font-mono text-[10px]">
              <div className={`p-1.5 rounded-[2px] border transition-all ${
                activeNarrowStage >= 1 ? 'bg-[#121820] text-white border-[#121820] font-bold' : 'bg-[#FAF7F2] text-[#667085] border-[#E4DFD5]'
              }`}>
                <span>1. TOTAL CORPUS</span>
                <div className="text-xs">93 ACTS</div>
              </div>

              <div className={`p-1.5 rounded-[2px] border transition-all ${
                activeNarrowStage >= 2 ? 'bg-[#121820] text-white border-[#121820] font-bold' : 'bg-[#FAF7F2] text-[#667085] border-[#E4DFD5]'
              }`}>
                <span>2. BM25 FILTER</span>
                <div className="text-xs">34 CHUNKS</div>
              </div>

              <div className={`p-1.5 rounded-[2px] border transition-all ${
                activeNarrowStage >= 3 ? 'bg-[#C84B31] text-white border-[#C84B31] font-bold' : 'bg-[#FAF7F2] text-[#667085] border-[#E4DFD5]'
              }`}>
                <span>3. CHROMA RRF</span>
                <div className="text-xs">1 TOP MATCH</div>
              </div>
            </div>

            {/* Matched Act Callout */}
            <div className="p-2 bg-[#FAF7F2] border border-[#E4DFD5] rounded-[2px] text-xs font-mono flex items-center justify-between">
              <span className="text-[#667085]">GROUNDED:</span>
              <span className="text-[#121820] font-bold truncate max-w-[220px]">
                {scenario.statute} ({scenario.section})
              </span>
            </div>
          </div>
        </div>

        {/* Right: Live Streamed 5-Part Dossier Output */}
        <div className="lg:col-span-7 p-5 space-y-4 bg-white flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-[#E4DFD5] pb-2">
              <div className="flex items-center space-x-2">
                <span className="stamp-badge text-[10px] px-2 py-0.5">
                  5-PART INVARIANT DOSSIER
                </span>
                <span className="font-mono text-xs text-[#667085]">
                  TIME TO FIRST TOKEN: <strong className="text-emerald-700">{scenario.ttftMs}ms</strong>
                </span>
              </div>
              <span className="font-mono text-[11px] text-[#C84B31] font-bold">
                STREAMING {streamedPartIndex}/5 PARTS
              </span>
            </div>

            {/* 5 Streaming Output Blocks */}
            <div className="space-y-2 text-xs font-sans">
              {/* Part 1 */}
              <div className={`p-2.5 border rounded-[2px] transition-all ${
                streamedPartIndex >= 1 ? 'border-[#121820] bg-white opacity-100' : 'border-[#E4DFD5] bg-[#FAF7F2] opacity-40'
              }`}>
                <div className="flex items-center space-x-2 font-mono text-[10px] text-[#C84B31] font-bold uppercase">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>PART 01 // PROBLEM & GROUNDED STATUTORY RIGHTS</span>
                </div>
                <p className="mt-1 text-[#121820] font-medium leading-relaxed">
                  {streamedPartIndex >= 1 ? scenario.rightsQuote : 'Computing statutory sections...'}
                </p>
              </div>

              {/* Part 2 */}
              <div className={`p-2.5 border rounded-[2px] transition-all ${
                streamedPartIndex >= 2 ? 'border-[#121820] bg-white opacity-100' : 'border-[#E4DFD5] bg-[#FAF7F2] opacity-40'
              }`}>
                <div className="flex items-center space-x-2 font-mono text-[10px] text-[#C84B31] font-bold uppercase">
                  <FileCheck2 className="w-3.5 h-3.5" />
                  <span>PART 02 // BSA 2023 EVIDENTIARY THRESHOLD</span>
                </div>
                <p className="mt-1 text-[#475467] leading-relaxed">
                  {streamedPartIndex >= 2 ? scenario.evidenceMandatory : 'Auditing admissible documents...'}
                </p>
              </div>

              {/* Part 3 & 4 Mini Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div className={`p-2.5 border rounded-[2px] transition-all ${
                  streamedPartIndex >= 3 ? 'border-[#121820] bg-white opacity-100' : 'border-[#E4DFD5] bg-[#FAF7F2] opacity-40'
                }`}>
                  <div className="font-mono text-[10px] text-[#C84B31] font-bold uppercase flex items-center space-x-1">
                    <Building2 className="w-3 h-3" />
                    <span>PART 03 // AUTHORITY</span>
                  </div>
                  <p className="mt-1 text-[#475467] line-clamp-2">
                    {streamedPartIndex >= 3 ? scenario.authority : 'Mapping jurisdiction...'}
                  </p>
                </div>

                <div className={`p-2.5 border rounded-[2px] transition-all ${
                  streamedPartIndex >= 4 ? 'border-[#121820] bg-white opacity-100' : 'border-[#E4DFD5] bg-[#FAF7F2] opacity-40'
                }`}>
                  <div className="font-mono text-[10px] text-[#C84B31] font-bold uppercase flex items-center space-x-1">
                    <Milestone className="w-3 h-3" />
                    <span>PART 04 // ACTION PLAN</span>
                  </div>
                  <p className="mt-1 text-[#475467] line-clamp-2">
                    {streamedPartIndex >= 4 ? scenario.actionTimeline : 'Calculating limitations...'}
                  </p>
                </div>
              </div>

              {/* Part 5 */}
              <div className={`p-2.5 border rounded-[2px] transition-all ${
                streamedPartIndex >= 5 ? 'border-[#C84B31] bg-[#FAF7F2] opacity-100 font-medium' : 'border-[#E4DFD5] bg-[#FAF7F2] opacity-40'
              }`}>
                <div className="flex items-center space-x-2 font-mono text-[10px] text-[#C84B31] font-bold uppercase">
                  <FileText className="w-3.5 h-3.5" />
                  <span>PART 05 // SINGLE-PASS LEGAL DRAFT READY</span>
                </div>
                <div className="mt-1 text-[#121820] font-mono text-[11px] flex items-center justify-between">
                  <span>PROFORMA: {scenario.documentType}</span>
                  {streamedPartIndex >= 5 && <span className="text-emerald-700 font-bold">READY TO PRINT</span>}
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Launch Button into Civic Navigator */}
          <div className="pt-3 border-t border-[#E4DFD5] flex items-center justify-between">
            <span className="text-[11px] font-mono text-[#667085]">
              GROUNDED ACROSS 93 BARE ACTS
            </span>
            <button
              onClick={() => onOpenDossierInNavigator(scenario.query)}
              className="px-4 py-2 bg-[#121820] hover:bg-[#2B3542] text-[#FAF7F2] font-mono text-xs font-bold rounded-[2px] transition-colors flex items-center space-x-2 shadow-xs group focus-visible:ring-2 focus-visible:ring-[#C84B31] focus-visible:outline-none"
            >
              <span>OPEN FULL DOSSIER IN NAVIGATOR</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#C84B31] group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
