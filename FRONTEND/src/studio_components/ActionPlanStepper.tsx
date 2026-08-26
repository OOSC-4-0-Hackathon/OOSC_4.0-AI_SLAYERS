import React from 'react';
import { 
  Milestone, 
  Clock, 
  Calendar, 
  CheckCircle2, 
  AlertOctagon, 
  ArrowRight, 
  Printer, 
  Download,
  ShieldAlert
} from 'lucide-react';
import { ActionPlanStep, FivePartCaseDossier } from '../types';

interface ActionPlanStepperProps {
  dossier: FivePartCaseDossier | null;
  onUpdateSteps: (steps: ActionPlanStep[]) => void;
  onGoToNavigator: () => void;
  onGoToDrafter: () => void;
}

export const ActionPlanStepper: React.FC<ActionPlanStepperProps> = ({
  dossier,
  onUpdateSteps,
  onGoToNavigator,
  onGoToDrafter
}) => {
  if (!dossier) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
        <Milestone className="w-12 h-12 text-[#667085] mx-auto" />
        <h2 className="font-serif text-2xl font-bold text-[#121820]">No Active Case Timeline Loaded</h2>
        <p className="text-sm text-[#556377] max-w-md mx-auto font-sans">
          To generate a phased statutory action plan, submit your dispute query in the Civic Navigator.
        </p>
        <button
          onClick={onGoToNavigator}
          className="px-5 py-2.5 bg-[#121820] text-[#FAF7F2] text-xs font-bold rounded-[2px] hover:bg-[#2B3542] transition-colors"
        >
          GO TO CIVIC NAVIGATOR
        </button>
      </div>
    );
  }

  const steps = dossier.actionPlan.steps;

  const handleStepStatus = (stepNumber: number, newStatus: 'pending' | 'in_progress' | 'completed') => {
    const updated = steps.map(s => s.stepNumber === stepNumber ? { ...s, status: newStatus } : s);
    onUpdateSteps(updated);
  };

  const completedCount = steps.filter(s => s.status === 'completed').length;
  const progressPercent = Math.round((completedCount / (steps.length || 1)) * 100);

  const handleDownloadIcs = () => {
    // Generate simple ICS calendar event payload
    const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//NYAAY AI//Civic Legal Limitation Calendar//EN
BEGIN:VEVENT
SUMMARY:NYAAY AI: ${dossier.problemAndRights.docketId} Limitation Deadline
DESCRIPTION:Action step due for ${dossier.problemAndRights.summary}
DTSTART:${new Date().toISOString().replace(/[-:]/g, '').split('.')[0]}Z
DTEND:${new Date(Date.now() + 86400000 * 30).toISOString().replace(/[-:]/g, '').split('.')[0]}Z
STATUS:CONFIRMED
END:VEVENT
END:VCALENDAR`;

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `NYAAY-Deadline-${dossier.problemAndRights.docketId}.ics`;
    link.click();
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#E4DFD5] pb-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="stamp-badge text-[10px] px-2 py-0.5">
              ACTION PLAN // PART 04
            </span>
            <span className="text-xs text-[#667085]">
              DOCKET: {dossier.problemAndRights.docketId}
            </span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-black text-[#121820] mt-1">
            Phased Statutory Action Plan & Deadlines
          </h1>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleDownloadIcs}
            className="px-3.5 py-2 border border-[#E4DFD5] bg-white hover:bg-[#F2EFE9] text-[#121820] text-xs rounded-[2px] transition-colors flex items-center space-x-1.5"
          >
            <Calendar className="w-3.5 h-3.5 text-[#C84B31]" />
            <span>EXPORT ICS DEADLINES</span>
          </button>

          <button
            onClick={() => window.print()}
            className="px-3.5 py-2 border border-[#E4DFD5] bg-white hover:bg-[#F2EFE9] text-[#121820] text-xs rounded-[2px] transition-colors flex items-center space-x-1.5"
          >
            <Printer className="w-3.5 h-3.5 text-[#C84B31]" />
            <span>PRINT PLAN</span>
          </button>
        </div>
      </div>

      {/* Progress & Summary Banner */}
      <div className="p-6 bg-[#121820] text-[#FAF7F2] rounded-[2px] border border-[#2B3542] grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
        <div className="md:col-span-8 space-y-2">
          <div className="flex items-center space-x-2">
            <span className="text-[#A83C25] text-xs font-bold uppercase tracking-wider">
              TOTAL ESTIMATED DURATION: ~{dossier.actionPlan.totalEstimatedDays} CALENDAR DAYS
            </span>
            <span className="text-[#556377]">|</span>
            <span className="text-[#A2B1C6] text-xs">
              LIMITATION ACT 1963 ENFORCED
            </span>
          </div>
          <p className="text-sm text-[#FAF7F2] font-sans leading-relaxed">
            Every step is calibrated against mandatory statutory limitation periods. Missing statutory appeal windows forfeits legal remedies.
          </p>
          <div className="w-full bg-[#1A222D] h-2 rounded-full overflow-hidden">
            <div 
              className="bg-[#C84B31] h-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        <div className="md:col-span-4 bg-[#1A222D] p-4 rounded-[2px] border border-[#2B3542] text-center space-y-1">
          <div className="text-[11px] text-[#A2B1C6] uppercase">EXECUTION PROGRESS</div>
          <div className="font-serif font-black text-3xl text-emerald-400">
            {completedCount} / {steps.length}
          </div>
          <div className="text-[10px] text-[#556377]">
            {progressPercent}% MILESTONES COMPLETED
          </div>
        </div>
      </div>

      {/* Phased Timeline Stepper */}
      <div className="space-y-4">
        <div className="text-xs font-bold text-[#121820] uppercase tracking-wider">
          CHRONOLOGICAL EXECUTION TIMELINE:
        </div>

        <div className="space-y-4 relative before:absolute before:top-4 before:bottom-4 before:left-7 before:w-0.5 before:bg-[#E4DFD5]">
          {steps.map((step) => (
            <div
              key={step.stepNumber}
              className={`relative z-10 p-6 border rounded-[2px] bg-white transition-all ${
                step.status === 'completed' 
                  ? 'border-[#121820] shadow-xs' 
                  : step.status === 'in_progress' 
                    ? 'border-[#C84B31] ring-1 ring-[#C84B31]/30' 
                    : 'border-[#E4DFD5]'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="flex items-start space-x-4 flex-1">
                  <div className={`w-8 h-8 rounded-[2px] flex items-center justify-center text-sm font-bold shrink-0 ${
                    step.status === 'completed'
                      ? 'bg-emerald-800 text-white'
                      : step.status === 'in_progress'
                        ? 'bg-[#C84B31] text-white'
                        : 'bg-[#E4DFD5] text-[#556377]'
                  }`}>
                    {step.stepNumber}
                  </div>

                  <div className="space-y-2 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-serif font-bold text-lg text-[#121820]">{step.title}</span>
                      <span className="text-xs px-2 py-0.5 bg-[#FAF7F2] text-[#A83C25] border border-[#C84B31]/20 font-bold rounded-[2px]">
                        {step.timeframe}
                      </span>
                      <span className="text-[10px] text-[#667085] px-1.5 py-0.5 bg-[#F2EFE9] rounded-[2px]">
                        TYPE: {step.actionType}
                      </span>
                    </div>

                    <p className="text-sm text-[#475467] font-sans leading-relaxed">
                      {step.description}
                    </p>

                    {step.statutoryDeadlineNotice && (
                      <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-[2px] text-xs text-rose-900 flex items-start space-x-2">
                        <AlertOctagon className="w-4 h-4 text-rose-700 shrink-0 mt-0.5" />
                        <span>STATUTORY LIMITATION: {step.statutoryDeadlineNotice}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Status Toggle Buttons */}
                <div className="flex sm:flex-col items-center gap-1.5 shrink-0 text-xs">
                  <button
                    onClick={() => handleStepStatus(step.stepNumber, 'completed')}
                    className={`w-full px-3 py-1.5 rounded-[2px] transition-colors ${
                      step.status === 'completed' 
                        ? 'bg-emerald-800 text-white font-bold' 
                        : 'bg-[#FAF7F2] hover:bg-[#F2EFE9] text-[#556377] border border-[#E4DFD5]'
                    }`}
                  >
                    COMPLETED
                  </button>
                  <button
                    onClick={() => handleStepStatus(step.stepNumber, 'in_progress')}
                    className={`w-full px-3 py-1.5 rounded-[2px] transition-colors ${
                      step.status === 'in_progress' 
                        ? 'bg-[#C84B31] text-white font-bold' 
                        : 'bg-[#FAF7F2] hover:bg-[#F2EFE9] text-[#556377] border border-[#E4DFD5]'
                    }`}
                  >
                    IN PROGRESS
                  </button>
                  <button
                    onClick={() => handleStepStatus(step.stepNumber, 'pending')}
                    className={`w-full px-3 py-1.5 rounded-[2px] transition-colors ${
                      step.status === 'pending' 
                        ? 'bg-[#121820] text-white font-bold' 
                        : 'bg-[#FAF7F2] hover:bg-[#F2EFE9] text-[#556377] border border-[#E4DFD5]'
                    }`}
                  >
                    PENDING
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom CTA to Document Drafter */}
      <div className="p-6 bg-[#FAF7F2] border border-[#E4DFD5] rounded-[2px] flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h4 className="font-serif font-bold text-lg text-[#121820]">Ready to execute formal filings?</h4>
          <p className="text-xs text-[#556377] font-sans">
            Launch the single-pass drafting engine to assemble your notices and appeals with instant bracketed token replacement.
          </p>
        </div>
        <button
          onClick={onGoToDrafter}
          className="px-5 py-2.5 bg-[#121820] hover:bg-[#2B3542] text-[#FAF7F2] text-xs font-bold rounded-[2px] transition-colors flex items-center space-x-2 shrink-0"
        >
          <span>OPEN DRAFTING TOOL</span>
          <ArrowRight className="w-3.5 h-3.5 text-[#C84B31]" />
        </button>
      </div>
    </div>
  );
};
