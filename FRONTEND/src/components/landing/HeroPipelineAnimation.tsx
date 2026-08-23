import React, { useState, useEffect, useRef, useCallback } from 'react';
import { CheckCircle2, Zap } from 'lucide-react';

const SCENARIOS = [
  {
    id: 'rti',
    domain: 'CIVIC · RTI',
    query: 'I filed an RTI application 38 days ago with Municipal Corporation regarding road repair tender. No response received.',
    statute: 'RTI Act 2005 · Sec 7(2) & 19(1)',
    ttft: 365,
    verdict: 'DEEMED REFUSAL',
    parts: [
      { label: 'RIGHTS', text: 'Sec 7(2) — Deemed Refusal after 30 days. First Appeal unlocked.' },
      { label: 'EVIDENCE', text: 'Speed Post tracking slip + Original RTI + ₹10 fee receipt.' },
      { label: 'AUTHORITY', text: 'First Appellate Authority (FAA), Municipal HQ.' },
      { label: 'ACTION', text: 'Day 31: File Memorandum of First Appeal under Sec 19(1).' },
      { label: 'DOCUMENT', text: 'Memorandum of First Appeal — RTI Act 2005.' },
    ],
  },
  {
    id: 'warranty',
    domain: 'CONSUMER',
    query: 'Authorized service center rejected warranty repair on my 4-month-old laptop claiming customer fault without technical proof.',
    statute: 'Consumer Protection Act 2019 · Sec 2(11) & 84',
    ttft: 382,
    verdict: 'UNFAIR TRADE PRACTICE',
    parts: [
      { label: 'RIGHTS', text: 'Sec 84 — Strict manufacturer liability for defects within warranty.' },
      { label: 'EVIDENCE', text: 'Tax invoice + Service rejection job-sheet + Warranty card.' },
      { label: 'AUTHORITY', text: 'District Consumer Commission (DCDRC) via e-Daakhil portal.' },
      { label: 'ACTION', text: 'Day 1: Legal Notice (15 days) → Day 16: File on e-Daakhil.' },
      { label: 'DOCUMENT', text: 'Legal Notice for Warranty Replacement & Compensation.' },
    ],
  },
  {
    id: 'tenant',
    domain: 'TENANT',
    query: 'Landlord sent a WhatsApp message giving me 7 days to vacate despite full rent paid and active lease agreement.',
    statute: 'TPA 1882 · Sec 106 & SRA Sec 6',
    ttft: 391,
    verdict: 'UNLAWFUL EVICTION',
    parts: [
      { label: 'RIGHTS', text: 'Sec 106 TPA — 15-day written notice mandatory for month-to-month tenancies.' },
      { label: 'EVIDENCE', text: 'Rent receipts + Lease agreement + WhatsApp screenshot.' },
      { label: 'AUTHORITY', text: 'Rent Control Court / Civil Court (Specific Relief).' },
      { label: 'ACTION', text: 'Day 1: Reply Notice → Day 8: Apply for injunction if threatened.' },
      { label: 'DOCUMENT', text: 'Reply Notice — Unlawful Eviction under TPA 1882.' },
    ],
  },
];

const TYPING_SPEED = 28;       // ms per char
const PAUSE_AFTER_TYPING = 900; // ms
const FUNNEL_STAGGER = 420;    // ms per funnel step
const TTFT_DURATION = 800;     // ms
const HOLD_AFTER_COMPLETE = 2600; // ms

type Phase = 'typing' | 'funnel' | 'ttft' | 'parts' | 'done';

interface Props {
  onOpenDossierInNavigator?: (query: string) => void;
}

function HeroPipelineAnimationComponent({ onOpenDossierInNavigator }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(true);
  const [scenarioIdx, setScenarioIdx] = useState(0);
  const [phase, setPhase] = useState<Phase>('typing');
  const [typed, setTyped] = useState('');
  const [funnelStep, setFunnelStep] = useState(-1); // 0=acts 1=chunks 2=match
  const [ttftCount, setTtftCount] = useState(0);
  const [activePart, setActivePart] = useState(-1);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const cardRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => setIsVisible(entry.isIntersecting));
      },
      { threshold: 0.1 }
    );
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  const scenario = SCENARIOS[scenarioIdx];

  const clearTimers = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
  }, []);

  // Advance to next scenario
  const nextScenario = useCallback(() => {
    clearTimers();
    setScenarioIdx(i => (i + 1) % SCENARIOS.length);
    setPhase('typing');
    setTyped('');
    setFunnelStep(-1);
    setTtftCount(0);
    setActivePart(-1);
  }, [clearTimers]);

  useEffect(() => {
    clearTimers();
    if (!isVisible) return;

    if (phase === 'typing') {
      let i = typed.length;
      const typeNext = () => {
        if (i < scenario.query.length) {
          setTyped(scenario.query.slice(0, i + 1));
          i++;
          timerRef.current = setTimeout(typeNext, TYPING_SPEED);
        } else {
          timerRef.current = setTimeout(() => setPhase('funnel'), PAUSE_AFTER_TYPING);
        }
      };
      timerRef.current = setTimeout(typeNext, 60);

    } else if (phase === 'funnel') {
      const steps = [0, 1, 2];
      steps.forEach((s, si) => {
        timerRef.current = setTimeout(() => {
          setFunnelStep(s);
          if (si === steps.length - 1) {
            timerRef.current = setTimeout(() => setPhase('ttft'), FUNNEL_STAGGER * 1.5);
          }
        }, FUNNEL_STAGGER * si);
      });

    } else if (phase === 'ttft') {
      const target = scenario.ttft;
      const start = performance.now();
      const tick = (now: number) => {
        const elapsed = now - start;
        const progress = Math.min(elapsed / TTFT_DURATION, 1);
        setTtftCount(Math.round(progress * target));
        if (progress < 1) {
          rafRef.current = requestAnimationFrame(tick);
        } else {
          timerRef.current = setTimeout(() => setPhase('parts'), 300);
        }
      };
      rafRef.current = requestAnimationFrame(tick);

    } else if (phase === 'parts') {
      scenario.parts.forEach((_, i) => {
        timerRef.current = setTimeout(() => {
          setActivePart(i);
          if (i === scenario.parts.length - 1) {
            timerRef.current = setTimeout(() => setPhase('done'), 400);
          }
        }, 280 * i);
      });

    } else if (phase === 'done') {
      timerRef.current = setTimeout(nextScenario, HOLD_AFTER_COMPLETE);
    }

    return clearTimers;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, scenarioIdx]);

  // Parallax tilt
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = (e.clientX - cx) / (rect.width / 2);
    const dy = (e.clientY - cy) / (rect.height / 2);
    setTilt({ x: dy * -6, y: dx * 6 });
  };

  const handleMouseLeave = () => setTilt({ x: 0, y: 0 });

  const isComplete = phase === 'done';

  // Compute active pipeline stage index (0..4) for progress rail
  const currentStageIndex = 
    phase === 'done' || phase === 'parts' || phase === 'ttft' ? 4 :
    phase === 'funnel' ? (funnelStep >= 2 ? 3 : 2) :
    typed.length > 20 ? 1 : 0;

  const STAGES = [
    { num: '01', name: 'Query', sub: 'Input Intake' },
    { num: '02', name: 'Classify', sub: '0ms Regex Route' },
    { num: '03', name: 'Retrieve', sub: 'Chroma Dense' },
    { num: '04', name: 'Rank', sub: 'BM25 + RRF' },
    { num: '05', name: 'Stream', sub: '5-Part Dossier' },
  ];

  return (
    <div ref={containerRef} className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start w-full">

      {/* ZONE 1: Vertical Progress Rail */}
      <div className="hidden lg:flex lg:col-span-2 flex-col space-y-3 p-4 bg-white border border-[#E4DFD5] rounded-[4px] shadow-2xs">
        <div className="font-mono text-[10px] font-bold text-[#7A8699] uppercase tracking-wider pb-2 border-b border-[#E4DFD5]">
          PIPELINE STAGE
        </div>
        <div className="relative space-y-4 pt-1">
          {STAGES.map((stg, idx) => {
            const isCurrent = currentStageIndex === idx;
            const isPassed = currentStageIndex > idx;
            return (
              <div key={stg.num} className="flex items-start space-x-3 relative group">
                {/* Status Dot */}
                <div className={`w-5 h-5 rounded-full flex items-center justify-center font-mono text-[9px] font-bold border transition-all shrink-0 mt-0.5 ${
                  isCurrent
                    ? 'bg-[#C84B31] text-white border-[#C84B31] shadow-xs'
                    : isPassed
                    ? 'bg-[#121820] text-white border-[#121820]'
                    : 'bg-[#F2EFE9] text-[#7A8699] border-[#DDD6C9]'
                }`}>
                  {isPassed ? '✓' : stg.num}
                </div>
                {/* Stage Text */}
                <div className="space-y-0.5">
                  <div className={`font-mono text-xs font-bold transition-colors ${
                    isCurrent ? 'text-[#C84B31]' : isPassed ? 'text-[#121820]' : 'text-[#7A8699]'
                  }`}>
                    {stg.name}
                  </div>
                  <div className="font-mono text-[9px] text-[#7A8699] leading-tight">
                    {stg.sub}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ZONE 2: Input + Funnel */}
      <div className="lg:col-span-4 space-y-4">
        {/* Faux terminal input */}
        <div className="bg-[#F9F8F5] border border-[#E4DFD5] rounded-[4px] p-4">
          <div className="font-mono text-[10px] text-[#7A8699] uppercase tracking-widest mb-2 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#C84B31] animate-pulse" />
            CITIZEN QUERY INPUT
          </div>
          <p className="font-sans text-[14px] text-[#121820] leading-relaxed min-h-[60px]">
            {typed}
            {phase === 'typing' && (
              <span className="inline-block w-0.5 h-[1.1em] bg-[#C84B31] ml-0.5 align-text-bottom animate-[cursorPulse_900ms_ease-in-out_infinite]" />
            )}
          </p>
          {phase !== 'typing' && (
            <div className="mt-2 flex items-center gap-2">
              <span className="font-mono text-[10px] font-bold text-[#C84B31] uppercase tracking-wider bg-[#C84B31]/10 border border-[#C84B31]/20 px-2 py-0.5 rounded-[2px]">
                {scenario.domain}
              </span>
            </div>
          )}
        </div>

        {/* RRF Funnel */}
        <div className="grid grid-cols-3 gap-2">
          {[
            { step: 0, label: 'ACTS', from: 93, to: 93, desc: 'Indexed corpus' },
            { step: 1, label: 'CHUNKS', from: 1400, to: 34, desc: 'RRF retrieved' },
            { step: 2, label: 'MATCH', from: null, to: 1, desc: 'ROUTING' },
          ].map(({ step, label, to, desc }) => {
            const isActive = funnelStep >= step;
            return (
              <div
                key={step}
                className={`border rounded-[4px] p-3 transition-all duration-500 ${
                  isActive
                    ? step === 2
                      ? 'bg-emerald-50 border-emerald-300'
                      : 'bg-white border-[#C84B31]/30'
                    : 'bg-[#F2EFE9]/60 border-[#E4DFD5]'
                }`}
              >
                <div className="font-mono text-[9px] text-[#7A8699] uppercase tracking-wider">{label}</div>
                <div className={`font-mono font-black text-xl transition-all duration-300 ${
                  isActive
                    ? step === 2 ? 'text-emerald-700' : 'text-[#121820]'
                    : 'text-[#D4CFC4]'
                }`}>
                  {to}
                </div>
                <div className={`font-mono text-[9px] transition-colors ${isActive ? 'text-[#C84B31]' : 'text-[#A8A39A]'}`}>
                  {desc}
                </div>
              </div>
            );
          })}
        </div>

        {/* TTFT Ticker */}
        {(phase === 'ttft' || phase === 'parts' || phase === 'done') && (
          <div className="flex items-center gap-3">
            <div className="flex-1 bg-[#F9F8F5] border border-[#E4DFD5] rounded-[4px] px-4 py-2.5 flex items-center gap-3">
              <Zap className="w-3.5 h-3.5 text-[#C84B31] flex-shrink-0" />
              <span className="font-mono text-xs text-[#7A8699]">Time-to-First-Token:</span>
              <span className="font-mono font-bold text-sm text-[#121820] tabular-nums">
                {ttftCount}ms
              </span>
            </div>
            {isComplete && (
              <div className="flex items-center gap-1.5 bg-emerald-50 border border-emerald-300 px-3 py-2 rounded-[4px] animate-[stampIn_200ms_cubic-bezier(0.16,1,0.3,1)_forwards]">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                <span className="font-mono text-[11px] font-bold text-emerald-700 uppercase tracking-wide">GROUNDED</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ZONE 3: 5-Part Dossier Preview with parallax tilt */}
      <div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{
          transform: `perspective(800px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
          transition: 'transform 120ms ease',
        }}
        className="lg:col-span-6 border border-[#E4DFD5] bg-white rounded-[4px] overflow-hidden shadow-sm"
      >
        {/* Header */}
        <div className="bg-[#121820] px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-mono text-[10px] text-[#C84B31] font-bold">5-PART DOSSIER</span>
            <span className="font-mono text-[10px] text-[#7A8699]">{scenario.statute}</span>
          </div>
          {isComplete && (
            <span className="font-mono text-[10px] text-emerald-400 font-bold border border-emerald-700/40 px-1.5 py-0.5 rounded-[2px]">
              {scenario.verdict}
            </span>
          )}
        </div>

        {/* Parts */}
        <div className="divide-y divide-[#F2EFE9]">
          {scenario.parts.map((part, i) => {
            const revealed = activePart >= i;
            return (
              <div
                key={i}
                className={`px-4 py-3 flex gap-3 transition-all duration-300 ${
                  revealed ? 'opacity-100' : 'opacity-0'
                }`}
              >
                <span className="font-mono text-[9px] font-bold text-[#C84B31] uppercase tracking-wider w-[60px] flex-shrink-0 pt-0.5">
                  {part.label}
                </span>
                <p className="font-sans text-[12px] text-[#475467] leading-relaxed">
                  {part.text}
                </p>
              </div>
            );
          })}
        </div>

        {/* CTA strip */}
        {isComplete && onOpenDossierInNavigator && (
          <div className="border-t border-[#E4DFD5] px-4 py-3 bg-[#F9F8F5]">
            <button
              onClick={() => onOpenDossierInNavigator(scenario.query)}
              className="text-xs font-mono font-bold text-[#C84B31] hover:text-[#A83C25] flex items-center gap-1 transition-colors"
            >
              Open in Civic Navigator →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default React.memo(HeroPipelineAnimationComponent);

