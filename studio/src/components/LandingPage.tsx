import React, { useState, useEffect, useRef } from 'react';
import { 
  ArrowRight, 
  ShieldAlert, 
  FileCheck2, 
  Building2, 
  Milestone, 
  FileText, 
  Layers, 
  Cpu, 
  Hash, 
  CheckCircle2,
  BookOpen,
  Sparkles,
  Search,
  Zap,
  Eye,
  ShieldCheck,
  Bot,
  FileCheck
} from 'lucide-react';
import { ThreeDocumentPlanes } from './ThreeDocumentPlanes';
import { LiveStreamingDemoHero } from './LiveStreamingDemoHero';
import { StatuteInspectionModal } from './StatuteInspectionModal';
import { BARE_ACTS_CATALOG } from '../data/bareActsData';
import { BareAct } from '../types';

interface LandingPageProps {
  onStartQuery: (presetText?: string) => void;
  onExploreActs: () => void;
  onStartDemoFlow: () => void;
  onNavigateToTab?: (tab: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ 
  onStartQuery, 
  onExploreActs,
  onStartDemoFlow,
  onNavigateToTab
}) => {
  const [activeStepPinned, setActiveStepPinned] = useState<number>(0);
  const [selectedDemoAct, setSelectedDemoAct] = useState<string>('rti-2005');
  const [inspectingAct, setInspectingAct] = useState<BareAct | null>(null);
  const scrollSectionRef = useRef<HTMLDivElement>(null);

  // Line by line reveal state tracking
  const [scrollProgress, setScrollProgress] = useState<number>(0);

  useEffect(() => {
    const handleScroll = () => {
      if (!scrollSectionRef.current) return;
      const rect = scrollSectionRef.current.getBoundingClientRect();
      const windowH = window.innerHeight;
      const progress = Math.min(1, Math.max(0, (windowH - rect.top) / (rect.height + windowH)));
      setScrollProgress(progress);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const sampleCivicDisputes = [
    {
      domain: 'RTI',
      title: 'Municipal Road Tender RTI Delayed 38 Days',
      query: 'I filed an RTI application 38 days ago with the Municipal Corporation requesting road repair tender details and contractor payment logs. No response received.',
      statute: 'RTI Act 2005 (Sec 7 & 19)',
      badge: 'DEEMED REFUSAL'
    },
    {
      domain: 'CONSUMER',
      title: 'Authorized Dealer Refused Laptop Warranty',
      query: 'Authorized service center rejected warranty repair on my 4-month-old laptop claiming customer fault without technical diagnostic inspection.',
      statute: 'Consumer Protection Act 2019 (Sec 2(11) & 84)',
      badge: 'UNFAIR PRACTICE'
    },
    {
      domain: 'WORKPLACE',
      title: 'Company Withholding Statutory Gratuity & Relieving Letter',
      query: 'I resigned after 6 years of continuous service. Company HR is refusing to disburse my statutory gratuity and withholding my relieving letter.',
      statute: 'Payment of Gratuity Act 1972 (Sec 4 & 7)',
      badge: 'STATUTORY GRATUITY'
    },
    {
      domain: 'TENANT',
      title: 'Landlord Issued 7-Day WhatsApp Eviction Notice',
      query: 'Landlord sent a WhatsApp message giving me 7 days to vacate apartment despite full rent paid on time and active lease agreement in force.',
      statute: 'TPA 1882 (Sec 106) & SRA (Sec 6)',
      badge: 'UNLAWFUL EVICTION'
    },
    {
      domain: 'RERA',
      title: 'Builder Delayed Apartment Possession 18 Months',
      query: 'Promoter delayed handover of apartment by 18 months beyond RERA registered completion date and refuses to pay statutory monthly interest.',
      statute: 'RERA 2016 (Sec 18)',
      badge: 'STATUTORY COMPENSATION'
    }
  ];

  const fivePartArchitecture = [
    {
      index: 1,
      name: 'Problem & Rights',
      badge: 'GROUNDED STATUTE',
      icon: ShieldAlert,
      title: 'Statutory Shield & Rights Identification',
      description: 'Zero-hallucination extraction of enforceable citizen rights directly mapped to exact legislative Sections from the 93 Indian Bare Acts.',
      dossierHighlight: 'Section 7(2) RTI Act: Deemed Refusal invokes immediate First Appellate Authority jurisdiction without fresh fees.'
    },
    {
      index: 2,
      name: 'Evidence Required',
      badge: 'AUDIT CHECKLIST',
      icon: FileCheck2,
      title: 'Evidentiary Threshold & Verification (BSA 2023)',
      description: 'Defines mandatory vs supporting documentation required before any tribunal or magistrate, calculating audit readiness before filing.',
      dossierHighlight: 'Mandatory: Speed Post Tracking Acknowledgment Slip proving delivery + Section 63 BSA Electronic Certificate.'
    },
    {
      index: 3,
      name: 'Relevant Authority',
      badge: 'JURISDICTION MAP',
      icon: Building2,
      title: 'Specific Officer & Multi-Tier Escalation',
      description: 'Pinpoints the precise designated officer, appellate forum, official e-filing portal (e-Daakhil / RTI Online / Rent Court), and fee schedule.',
      dossierHighlight: 'Tier 2: First Appellate Authority (FAA) — Mandatory 30-day speaking order timeline.'
    },
    {
      index: 4,
      name: 'Action Plan',
      badge: 'LIMITATION TIMELINE',
      icon: Milestone,
      title: 'Day 1 → Day 30 Phased Milestone Stepper',
      description: 'Chronological execution steps tied strictly to statutory limitation deadlines under the Limitation Act 1963 and respective procedural codes.',
      dossierHighlight: 'Day 31 Expiry: File Memorandum of First Appeal within 30 days of statutory default.'
    },
    {
      index: 5,
      name: 'Document Generation',
      badge: 'SINGLE-PASS ENGINE',
      icon: FileText,
      title: 'Dynamic Legal Draft with Placeholder Tokens',
      description: 'Instant production of actionable legal notices, affidavits, RTI appeals, and tenant replies formatted to judicial standards with highlighted editable tags.',
      dossierHighlight: 'Memorandum of Appeal under Sec 19(1) with bracketed placeholders ready to print, copy, and post.'
    }
  ];

  return (
    <div className="min-h-screen bg-[#F9F8F5] ledger-grid text-[#121820]">
      {/* 1. EDITORIAL CASE FILE HERO */}
      <section className="relative pt-10 pb-16 sm:pt-14 sm:pb-20 border-b border-[#E4DFD5]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          {/* Documentary Docket Sub-Header */}
          <div className="flex flex-wrap items-center justify-between gap-2 pb-4 mb-8 border-b border-[#E4DFD5]">
            <div className="flex items-center space-x-2">
              <span className="stamp-badge px-2 py-0.5 text-[10px]">
                DOSSIER // CIVIC EMPOWERMENT
              </span>
              <span className="font-mono text-xs text-[#7A8699]">
                CASE FILE REFERENCE: NYAAY-RAG-2026
              </span>
            </div>
            <div className="font-mono text-xs text-[#7A8699] flex items-center space-x-4">
              <span>93 INDIAN BARE ACTS GROUNDED</span>
              <span>•</span>
              <span className="text-emerald-700 font-bold">SUB-500MS TIME-TO-FIRST-TOKEN</span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            {/* Left: Asymmetric Editorial Typography */}
            <div className="lg:col-span-7 space-y-6">
              <div className="space-y-3">
                <div className="inline-flex items-center space-x-2 bg-[#EFEBE4] px-2.5 py-1 rounded-[2px] border border-[#DDD6C9]">
                  <Cpu className="w-3.5 h-3.5 text-[#C84B31]" />
                  <span className="font-mono text-xs text-[#121820] font-semibold">
                    HYBRID DENSE + SPARSE RETRIEVAL (CHROMA + BM25)
                  </span>
                </div>

                <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl text-[#121820] leading-[1.08] tracking-tight font-black">
                  The case file, <br className="hidden sm:inline" />
                  made <span className="text-[#C84B31] italic font-normal">legible.</span>
                </h1>
              </div>

              <p className="text-lg sm:text-xl text-[#475467] leading-relaxed max-w-2xl font-sans">
                Raw statutory chaos goes in. A clean, grounded actionable dossier comes out. 
                NYAAY AI transforms citizen grievances into structured, evidence-backed 
                legal paths across 93 Indian Bare Acts.
              </p>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-wrap gap-3">
                <button
                  onClick={() => onStartQuery()}
                  className="px-6 py-3.5 bg-[#121820] hover:bg-[#222C3A] text-[#FAF7F2] font-mono text-sm font-bold rounded-[2px] transition-all flex items-center space-x-2.5 shadow-sm group active:translate-y-0.5 focus-visible:ring-2 focus-visible:ring-[#C84B31] focus-visible:outline-none"
                >
                  <Search className="w-4 h-4 text-[#C84B31]" />
                  <span>OPEN CIVIC NAVIGATOR</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>

                <button
                  onClick={onStartDemoFlow}
                  className="px-5 py-3.5 bg-[#C84B31] hover:bg-[#B33D24] text-white font-mono text-sm font-bold rounded-[2px] transition-all flex items-center space-x-2 shadow-xs active:translate-y-0.5 focus-visible:ring-2 focus-visible:ring-[#121820] focus-visible:outline-none"
                >
                  <Zap className="w-4 h-4 text-amber-200 fill-amber-200" />
                  <span>⚡ 90S UNBROKEN DEMO</span>
                </button>

                <button
                  onClick={onExploreActs}
                  className="px-5 py-3.5 border border-[#121820] bg-white hover:bg-[#F2EFE9] text-[#121820] font-mono text-sm font-semibold rounded-[2px] transition-colors focus-visible:ring-2 focus-visible:ring-[#C84B31] focus-visible:outline-none"
                >
                  BROWSE 93 BARE ACTS
                </button>
              </div>

              {/* Technical Pipeline Badges */}
              <div className="pt-6 border-t border-[#E4DFD5] grid grid-cols-3 gap-3">
                <div className="p-3 bg-[#FFFFFF] border border-[#E4DFD5] rounded-[2px]">
                  <div className="font-mono text-[10px] text-[#7A8699] uppercase">CLASSIFIER</div>
                  <div className="font-serif font-bold text-base text-[#121820] mt-0.5">0ms Latency</div>
                  <div className="text-[11px] text-[#475467] mt-0.5 font-mono">Deterministic Regex</div>
                </div>

                <div className="p-3 bg-[#FFFFFF] border border-[#E4DFD5] rounded-[2px]">
                  <div className="font-mono text-[10px] text-[#7A8699] uppercase">RETRIEVAL</div>
                  <div className="font-serif font-bold text-base text-[#121820] mt-0.5">RRF Fusion</div>
                  <div className="text-[11px] text-[#475467] mt-0.5 font-mono">Chroma + BM25</div>
                </div>

                <div className="p-3 bg-[#FFFFFF] border border-[#E4DFD5] rounded-[2px]">
                  <div className="font-mono text-[10px] text-[#7A8699] uppercase">OUTPUT SHAPE</div>
                  <div className="font-serif font-bold text-base text-[#121820] mt-0.5">5-Part Dossier</div>
                  <div className="text-[11px] text-[#475467] mt-0.5 font-mono">Single-Pass Draft</div>
                </div>
              </div>
            </div>

            {/* Right: Interactive 3D Document Planes Visual */}
            <div className="lg:col-span-5 space-y-3">
              <div className="border border-[#E4DFD5] bg-white p-2 rounded-[2px] shadow-sm">
                <ThreeDocumentPlanes
                  activeActId={selectedDemoAct}
                  isConverging={true}
                  onSelectAct={(actId) => setSelectedDemoAct(actId)}
                  onInspectAct={(act) => setInspectingAct(act)}
                  className="w-full h-[400px]"
                />
              </div>
              <div className="flex items-center justify-between text-xs font-mono text-[#7A8699] px-1">
                <span>RRF CONVERGENCE SCENE</span>
                <span className="text-[#C84B31] font-semibold">CLICK ANY PLANE TO INSPECT</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. LIVE AUTO-PLAYING STREAMING PROOF TERMINAL (P1 HIGHEST LEVERAGE DIFFERENTIATOR) */}
      <section className="py-14 sm:py-20 border-b border-[#E4DFD5] bg-[#F2EFE9]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-6">
          <div className="max-w-3xl space-y-2">
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#C84B31] animate-pulse"></span>
              <span className="font-mono text-xs text-[#C84B31] font-bold tracking-widest uppercase">
                LIVE PROOF // REAL-TIME EVALUATION
              </span>
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl text-[#121820] font-black">
              Sub-500ms Time-to-First-Token in Action
            </h2>
            <p className="text-base text-[#5A687D] font-sans">
              Watch real citizen grievances type in, trigger deterministic 0ms regex routing, fuse Chroma dense + BM25 sparse vectors, and stream into the 5-part invariant dossier.
            </p>
          </div>

          {/* Live Streaming Proof Engine */}
          <LiveStreamingDemoHero 
            onOpenDossierInNavigator={(query) => onStartQuery(query)}
          />
        </div>
      </section>

      {/* 3. FOUR CORE PILLARS OF CIVIC EMPOWERMENT */}
      <section className="py-16 sm:py-20 border-b border-[#E4DFD5] bg-[#FAF7F2]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
            <div>
              <div className="inline-flex items-center space-x-2 px-2.5 py-1 rounded bg-[#EFECE6] text-xs font-mono text-[#8C271E] font-bold mb-2">
                <Sparkles className="w-3.5 h-3.5 text-[#C84B31]" />
                <span>PROBLEM STATEMENT ARCHITECTURE</span>
              </div>
              <h2 className="font-serif text-3xl font-bold text-[#121820] tracking-tight">
                Empowering Citizens Across 4 Civic Dimensions
              </h2>
              <p className="text-sm text-[#556377] mt-1 font-sans max-w-2xl">
                Turning opaque bureaucracy, scattered legislation, and legal intimidation into accessible, grounded, and automated citizen action.
              </p>
            </div>

            <button
              onClick={() => onStartDemoFlow()}
              className="px-4 py-2 bg-[#121820] text-white text-xs font-mono font-medium rounded-lg hover:bg-[#242F3E] transition-colors flex items-center space-x-2 self-start sm:self-auto shadow-xs"
            >
              <span>Launch 5-Step Demo Tour</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Pillar 1: RTI Drafting Agent */}
            <div className="bg-white border border-[#E4DFD5] rounded-xl p-5 hover:border-[#121820] transition-all flex flex-col justify-between shadow-xs">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 flex items-center justify-center">
                  <FileText className="w-5 h-5 text-amber-700" />
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-mono uppercase text-[#718096] font-bold">DIRECTION 1</span>
                  <h3 className="font-serif font-bold text-base text-[#121820]">RTI Drafting Agent</h3>
                </div>
                <p className="text-xs text-[#556377] leading-relaxed">
                  Converts plain-language citizen questions into legally formatted RTI Form A applications and Sec 19 First Appeals directed to the exact Public Information Officer.
                </p>
              </div>

              <button
                onClick={() => onStartQuery('I filed an RTI application 38 days ago with the Municipal Corporation requesting road repair tender details. No response received.')}
                className="mt-4 pt-3 border-t border-[#EFECE6] text-xs font-mono text-[#C84B31] font-bold flex items-center justify-between hover:translate-x-0.5 transition-transform"
              >
                <span>Draft RTI Application</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Pillar 2: Rights Navigator */}
            <div className="bg-white border border-[#E4DFD5] rounded-xl p-5 hover:border-[#121820] transition-all flex flex-col justify-between shadow-xs">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-lg bg-blue-50 border border-blue-200 text-blue-800 flex items-center justify-center">
                  <Search className="w-5 h-5 text-blue-700" />
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-mono uppercase text-[#718096] font-bold">DIRECTION 2</span>
                  <h3 className="font-serif font-bold text-base text-[#121820]">Rights Navigator</h3>
                </div>
                <p className="text-xs text-[#556377] leading-relaxed">
                  Translates messy disputes (tenant evictions, consumer defects, unpaid wages) into simple terms backed by citations from 93 Bare Acts and evidence checklists.
                </p>
              </div>

              <button
                onClick={() => onStartQuery('Authorized service center rejected warranty repair on my 4-month-old laptop claiming customer fault without technical diagnostic inspection.')}
                className="mt-4 pt-3 border-t border-[#EFECE6] text-xs font-mono text-[#C84B31] font-bold flex items-center justify-between hover:translate-x-0.5 transition-transform"
              >
                <span>Explore Rights Dossier</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Pillar 3: Scheme Eligibility Reader */}
            <div className="bg-white border border-[#E4DFD5] rounded-xl p-5 hover:border-[#121820] transition-all flex flex-col justify-between shadow-xs">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5 text-emerald-700" />
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-mono uppercase text-[#718096] font-bold">DIRECTION 3</span>
                  <h3 className="font-serif font-bold text-base text-[#121820]">Scheme Eligibility Reader</h3>
                </div>
                <p className="text-xs text-[#556377] leading-relaxed">
                  Answers eligibility questions in plain language across healthcare, housing, pensions, and gig worker funds with benefit calculators and document lists.
                </p>
              </div>

              <button
                onClick={() => onNavigateToTab ? onNavigateToTab('scheme_reader') : onStartQuery('Ayushman Bharat PMJAY scheme eligibility criteria')}
                className="mt-4 pt-3 border-t border-[#EFECE6] text-xs font-mono text-[#C84B31] font-bold flex items-center justify-between hover:translate-x-0.5 transition-transform"
              >
                <span>Check Welfare Schemes</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Pillar 4: Conversational Form-Filler */}
            <div className="bg-white border border-[#E4DFD5] rounded-xl p-5 hover:border-[#121820] transition-all flex flex-col justify-between shadow-xs">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-lg bg-purple-50 border border-purple-200 text-purple-800 flex items-center justify-center">
                  <Bot className="w-5 h-5 text-purple-700" />
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-mono uppercase text-[#718096] font-bold">DIRECTION 4</span>
                  <h3 className="font-serif font-bold text-base text-[#121820]">Conversational Form-Filler</h3>
                </div>
                <p className="text-xs text-[#556377] leading-relaxed">
                  Interviews the user in plain English or Hinglish and auto-populates the official legal/civic form in real-time side-by-side ready for filing.
                </p>
              </div>

              <button
                onClick={() => onNavigateToTab ? onNavigateToTab('form_filler') : onStartQuery('File RTI Form A')}
                className="mt-4 pt-3 border-t border-[#EFECE6] text-xs font-mono text-[#C84B31] font-bold flex items-center justify-between hover:translate-x-0.5 transition-transform"
              >
                <span>Live Interactive Intake</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 4. SEQUENTIAL LINE-BY-LINE TEXT REVEAL ON SCROLL */}
      <section 
        ref={scrollSectionRef} 
        className="py-24 sm:py-32 bg-[#121820] text-[#FAF7F2] border-b border-[#242F3E] relative overflow-hidden"
      >
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#FAF7F2_1px,transparent_1px)] [background-size:24px_24px]" />

        <div className="max-w-4xl mx-auto px-4 sm:px-6 relative z-10 space-y-12">
          <div className="font-mono text-xs text-[#C84B31] tracking-widest uppercase font-bold flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-[#C84B31] inline-block"></span>
            <span>// CIVIC REALITY & PROBLEM STATEMENT</span>
          </div>

          <div className="space-y-6 font-serif text-2xl sm:text-4xl lg:text-5xl leading-[1.3] font-medium tracking-tight">
            {/* Line 1 */}
            <p 
              className={`transition-all duration-300 ${
                scrollProgress > 0.15 ? 'text-[#FAF7F2] opacity-100' : 'text-[#48566A] opacity-40'
              }`}
            >
              A citizen enters with raw real-world distress.
            </p>

            {/* Line 2 */}
            <p 
              className={`transition-all duration-300 ${
                scrollProgress > 0.35 ? 'text-[#FAF7F2] opacity-100' : 'text-[#48566A] opacity-40'
              }`}
            >
              Bureaucracy buries rights under ninety-three disconnected statutes.
            </p>

            {/* Line 3 */}
            <p 
              className={`transition-all duration-300 ${
                scrollProgress > 0.55 ? 'text-[#C84B31] opacity-100 font-bold italic' : 'text-[#48566A] opacity-40'
              }`}
            >
              The law already protects you — most people just cannot find the path through it.
            </p>
          </div>

          {/* Documentary Annotation Footer */}
          <div className="pt-8 border-t border-[#2B3542] flex flex-wrap items-center justify-between gap-4 font-mono text-xs text-[#8997AB]">
            <div>NYAAY ENGINE: RETRIEVAL-AUGMENTED STATUTORY DOSSIER</div>
            <div className="text-[#C84B31] font-semibold">DETERMINISTIC JURISDICTION ROUTING</div>
          </div>
        </div>
      </section>

      {/* 4. PINNED 5-PART CASE FILE ARCHITECTURE SHOWCASE */}
      <section className="py-20 sm:py-28 border-b border-[#E4DFD5] bg-[#FAF7F2]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="max-w-3xl mb-12 space-y-2">
            <span className="font-mono text-xs text-[#C84B31] font-bold tracking-widest uppercase">
              STRUCTURED OUTPUT STANDARD
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl text-[#121820] font-black">
              The Five-Part Case Dossier
            </h2>
            <p className="text-base text-[#5A687D] font-sans">
              Unlike generic chatbots that hallucinate citations, NYAAY AI structures every legal solution into an invariant, courtroom-tested shape.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Tabs */}
            <div className="lg:col-span-5 space-y-2.5">
              {fivePartArchitecture.map((item, idx) => {
                const IconComponent = item.icon;
                const isActive = activeStepPinned === idx;
                return (
                  <button
                    key={item.index}
                    onClick={() => setActiveStepPinned(idx)}
                    className={`w-full text-left p-4 border transition-all rounded-[2px] flex items-start space-x-3.5 focus-visible:ring-2 focus-visible:ring-[#C84B31] focus-visible:outline-none ${
                      isActive
                        ? 'border-[#121820] bg-white shadow-xs ring-1 ring-[#121820]/10'
                        : 'border-[#E4DFD5] bg-[#F2EFE9]/60 hover:bg-[#F2EFE9] text-[#5A687D]'
                    }`}
                  >
                    <div className={`p-2 rounded-[2px] ${isActive ? 'bg-[#121820] text-white' : 'bg-[#E4DFD5] text-[#5A687D]'}`}>
                      <IconComponent className="w-4 h-4" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-[11px] font-bold text-[#C84B31] uppercase">
                          PART 0{item.index} // {item.badge}
                        </span>
                        <span className="font-mono text-[10px] text-[#7A8699]">STEP {item.index} OF 5</span>
                      </div>
                      <div className="font-serif font-bold text-base text-[#121820] mt-0.5">
                        {item.name}
                      </div>
                      <p className="text-xs text-[#5A687D] mt-1 line-clamp-1 font-sans">
                        {item.title}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Right: Pinned Dossier Preview Card */}
            <div className="lg:col-span-7">
              <div className="sticky top-24 border border-[#121820] bg-white rounded-[2px] shadow-sm overflow-hidden">
                {/* Dossier Header */}
                <div className="bg-[#121820] text-[#FAF7F2] px-6 py-3.5 flex items-center justify-between border-b border-[#242F3E]">
                  <div className="flex items-center space-x-3">
                    <span className="font-mono text-xs text-[#C84B31] font-bold">
                      SECTION 0{fivePartArchitecture[activeStepPinned].index}
                    </span>
                    <span className="font-mono text-xs text-[#A2B1C6]">
                      {fivePartArchitecture[activeStepPinned].badge}
                    </span>
                  </div>
                  <div className="font-mono text-[11px] text-[#7A8699]">
                    GROUNDED DOSSIER VIEW
                  </div>
                </div>

                {/* Dossier Body */}
                <div className="p-6 sm:p-8 space-y-6">
                  <div>
                    <h3 className="font-serif text-2xl text-[#121820] font-black">
                      {fivePartArchitecture[activeStepPinned].title}
                    </h3>
                    <p className="text-sm text-[#475467] mt-2 font-sans leading-relaxed">
                      {fivePartArchitecture[activeStepPinned].description}
                    </p>
                  </div>

                  {/* Highlighted Statutory Box */}
                  <div className="p-4 bg-[#FAF7F2] border-l-3 border-[#C84B31] border-y border-r border-[#E4DFD5] space-y-2">
                    <div className="font-mono text-[11px] text-[#C84B31] font-bold uppercase tracking-wider">
                      // REAL-TIME RETRIEVAL ANNOTATION
                    </div>
                    <p className="font-serif text-base text-[#121820] italic">
                      "{fivePartArchitecture[activeStepPinned].dossierHighlight}"
                    </p>
                  </div>

                  {/* Actions inside dossier preview */}
                  <div className="pt-4 border-t border-[#E4DFD5] flex items-center justify-between">
                    <span className="text-xs font-mono text-[#7A8699]">
                      SECTORS: RTI • CONSUMER • TENANT • RERA
                    </span>
                    <button
                      onClick={() => onStartQuery()}
                      className="px-4 py-2 bg-[#121820] hover:bg-[#2B3542] text-[#FAF7F2] text-xs font-mono rounded-[2px] transition-colors flex items-center space-x-1.5 focus-visible:ring-2 focus-visible:ring-[#C84B31] focus-visible:outline-none"
                    >
                      <span>TEST THIS MODULE</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. COMMON CIVIC SCENARIOS */}
      <section className="py-16 sm:py-24 border-b border-[#E4DFD5] bg-[#F9F8F5]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
            <div>
              <span className="font-mono text-xs text-[#C84B31] font-bold tracking-widest uppercase">
                TEST GROUNDED DISPUTES
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl text-[#121820] font-black mt-1">
                Common Civic Scenarios
              </h2>
            </div>
            <p className="text-xs font-mono text-[#7A8699] max-w-md">
              Select any benchmark scenario to trigger the 0ms regex classifier and live RAG retrieval pipeline.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {sampleCivicDisputes.map((scenario, idx) => (
              <div
                key={idx}
                onClick={() => onStartQuery(scenario.query)}
                className="group cursor-pointer p-5 border border-[#E4DFD5] bg-white hover:border-[#121820] hover:shadow-sm transition-all rounded-[2px] flex flex-col justify-between space-y-4 focus-visible:ring-2 focus-visible:ring-[#C84B31] focus-visible:outline-none"
                tabIndex={0}
                role="button"
                onKeyDown={(e) => { if (e.key === 'Enter') onStartQuery(scenario.query); }}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-[#C84B31] uppercase">
                      {scenario.domain} // {scenario.badge}
                    </span>
                    <span className="text-[11px] font-mono text-[#7A8699] group-hover:text-[#121820] flex items-center space-x-1">
                      <span>LAUNCH</span>
                      <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                    </span>
                  </div>

                  <h4 className="font-serif font-bold text-lg text-[#121820] group-hover:text-[#C84B31] transition-colors">
                    {scenario.title}
                  </h4>

                  <p className="text-xs text-[#475467] font-sans leading-relaxed line-clamp-2">
                    "{scenario.query}"
                  </p>
                </div>

                <div className="pt-3 border-t border-[#F2EFE9] flex items-center justify-between text-[11px] font-mono text-[#7A8699]">
                  <span className="truncate max-w-[280px]">GROUNDED: {scenario.statute}</span>
                  <span className="text-emerald-700 font-bold">READY</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. STATUTORY REPOSITORY BANNER */}
      <section className="py-16 bg-[#121820] text-[#FAF7F2]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2">
            <span className="font-mono text-xs text-[#C84B31] tracking-widest uppercase font-bold">
              KNOWLEDGE BASE // 93 ACTS
            </span>
            <h3 className="font-serif text-2xl sm:text-3xl font-black text-white">
              Explore the 93 Indian Bare Acts Catalog
            </h3>
            <p className="text-sm text-[#A2B1C6] max-w-xl font-sans">
              From the Constitution of India to the Consumer Protection Act 2019, Transfer of Property Act 1882, and modern procedural enactments.
            </p>
          </div>

          <button
            onClick={onExploreActs}
            className="px-6 py-3 bg-[#FAF7F2] hover:bg-white text-[#121820] font-mono text-xs font-bold rounded-[2px] transition-colors shrink-0 flex items-center space-x-2 focus-visible:ring-2 focus-visible:ring-[#C84B31] focus-visible:outline-none"
          >
            <BookOpen className="w-4 h-4 text-[#C84B31]" />
            <span>OPEN 93 ACTS REPOSITORY</span>
          </button>
        </div>
      </section>

      {/* Statute Inspection Modal */}
      <StatuteInspectionModal
        act={inspectingAct}
        isOpen={!!inspectingAct}
        onClose={() => setInspectingAct(null)}
        onQueryThisAct={(act) => {
          onStartQuery(`Citizen dispute involving rights and remedies under ${act.title} (${act.actCode})`);
        }}
      />
    </div>
  );
};
