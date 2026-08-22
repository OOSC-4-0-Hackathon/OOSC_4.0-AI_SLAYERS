import React, { useState } from 'react';
import { 
  Edit3, 
  FileText, 
  Copy, 
  Check, 
  Printer, 
  Download, 
  Sparkles, 
  Layers, 
  AlertCircle, 
  ArrowRight,
  RefreshCw
} from 'lucide-react';
import { FivePartCaseDossier } from '../types';

interface DocumentDraftingToolProps {
  dossier: FivePartCaseDossier | null;
  onGoToNavigator: () => void;
}

export const DocumentDraftingTool: React.FC<DocumentDraftingToolProps> = ({
  dossier,
  onGoToNavigator
}) => {
  if (!dossier) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
        <Edit3 className="w-12 h-12 text-[#7A8699] mx-auto" />
        <h2 className="font-serif text-2xl font-bold text-[#121820]">No Active Legal Draft Loaded</h2>
        <p className="text-sm text-[#5A687D] max-w-md mx-auto font-sans">
          To generate an actionable legal notice, affidavit, or appeal memorandum, run a case search in the Civic Navigator.
        </p>
        <button
          onClick={onGoToNavigator}
          className="px-5 py-2.5 bg-[#121820] text-[#FAF7F2] font-mono text-xs font-bold rounded-[2px] hover:bg-[#2B3542] transition-colors"
        >
          GO TO CIVIC NAVIGATOR
        </button>
      </div>
    );
  }

  const initialDraft = dossier.documentGeneration;
  const [placeholders, setPlaceholders] = useState<Record<string, string>>(initialDraft.placeholders);
  const [copied, setCopied] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'editor' | 'preview'>('preview');

  const handlePlaceholderChange = (key: string, value: string) => {
    setPlaceholders(prev => ({
      ...prev,
      [key]: value
    }));
  };

  // Compile document body by replacing bracketed placeholder keys
  const getCompiledDocumentText = () => {
    let text = initialDraft.templateBody;
    const today = new Date().toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });

    text = text.replace(/\[TODAY_DATE\]/g, today);

    Object.entries(placeholders).forEach(([key, val]) => {
      // Escape regex special chars in key
      const escapedKey = key.replace(/[[\]]/g, '\\$&');
      const regex = new RegExp(escapedKey, 'g');
      text = text.replace(regex, val || `___${key}___`);
    });

    return text;
  };

  const compiledText = getCompiledDocumentText();

  const handleCopy = () => {
    navigator.clipboard.writeText(compiledText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadTxt = () => {
    const blob = new Blob([compiledText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${initialDraft.documentType}_${dossier.problemAndRights.docketId}.txt`;
    link.click();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#E4DFD5] pb-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="stamp-badge text-[10px] px-2 py-0.5">
              SINGLE-PASS DRAFTING ENGINE // PART 05
            </span>
            <span className="font-mono text-xs text-[#7A8699]">
              DOCKET: {dossier.problemAndRights.docketId}
            </span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-black text-[#121820] mt-1">
            {initialDraft.title}
          </h1>
          <p className="text-xs font-mono text-[#5A687D] mt-0.5">
            Statutory Basis: {initialDraft.actReference}
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleCopy}
            className="px-3.5 py-2 border border-[#E4DFD5] bg-white hover:bg-[#F2EFE9] text-[#121820] font-mono text-xs rounded-[2px] transition-colors flex items-center space-x-1.5"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-[#C84B31]" />}
            <span>{copied ? 'COPIED TO CLIPBOARD' : 'COPY DOCUMENT'}</span>
          </button>

          <button
            onClick={handleDownloadTxt}
            className="px-3.5 py-2 border border-[#E4DFD5] bg-white hover:bg-[#F2EFE9] text-[#121820] font-mono text-xs rounded-[2px] transition-colors flex items-center space-x-1.5"
          >
            <Download className="w-3.5 h-3.5 text-[#C84B31]" />
            <span>DOWNLOAD .TXT</span>
          </button>

          <button
            onClick={handlePrint}
            className="px-4 py-2 bg-[#121820] hover:bg-[#2B3542] text-[#FAF7F2] font-mono text-xs font-bold rounded-[2px] transition-colors flex items-center space-x-1.5"
          >
            <Printer className="w-3.5 h-3.5 text-[#C84B31]" />
            <span>PRINT / SAVE PDF</span>
          </button>
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Interactive Form Variable Tokens Editor */}
        <div className="lg:col-span-5 space-y-4">
          <div className="border border-[#121820] bg-white p-5 rounded-[2px] shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-[#E4DFD5] pb-3">
              <span className="font-mono text-xs font-bold text-[#C84B31] uppercase tracking-wider">
                // DYNAMIC LEGAL TOKENS ({Object.keys(placeholders).length})
              </span>
              <span className="text-[11px] font-mono text-[#7A8699]">LIVE REPLACEMENT</span>
            </div>

            <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
              {Object.entries(placeholders).map(([key, val]) => (
                <div key={key} className="space-y-1">
                  <label className="font-mono text-[11px] font-bold text-[#121820] flex items-center justify-between">
                    <span>{key.replace(/[[\]]/g, '')}</span>
                    <span className="text-[9px] text-[#C84B31] font-mono">EDITABLE</span>
                  </label>
                  <textarea
                    rows={key.includes('ADDRESS') || key.includes('SUBJECT') || key.includes('DESCRIPTION') || key.includes('PRAYER') ? 2 : 1}
                    value={val}
                    onChange={(e) => handlePlaceholderChange(key, e.target.value)}
                    className="w-full p-2.5 border border-[#E4DFD5] bg-[#FAF7F2] focus:bg-white focus:border-[#121820] rounded-[2px] text-xs font-sans text-[#121820] outline-none"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Dispatch Instructions Card */}
          <div className="border border-[#E4DFD5] bg-[#FAF7F2] p-5 rounded-[2px] space-y-3">
            <div className="font-mono text-xs font-bold text-[#121820] uppercase tracking-wider flex items-center space-x-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#C84B31]" />
              <span>DISPATCH & SERVICE PROTOCOL:</span>
            </div>
            <ul className="space-y-2 text-xs text-[#556377] font-sans">
              {initialDraft.instructions.map((ins, idx) => (
                <li key={idx} className="flex items-start space-x-2">
                  <span className="font-mono text-[11px] text-[#C84B31] font-bold mt-0.5">0{idx + 1}.</span>
                  <span>{ins}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Right Column: Live Legal Document Paper Preview */}
        <div className="lg:col-span-7">
          <div className="border border-[#121820] bg-white rounded-[2px] shadow-md overflow-hidden ledger-ruled-margin">
            {/* Judicial Paper Header Bar */}
            <div className="bg-[#121820] text-[#FAF7F2] px-6 py-3 flex items-center justify-between font-mono text-xs border-b border-[#242F3E]">
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block"></span>
                <span>COURT DOCKET FORMAT // STANDARD A4 LEGAL PAPER</span>
              </div>
              <span className="text-[#A2B1C6]">VERIFIED STATUTORY PROFORMA</span>
            </div>

            {/* Document Body View */}
            <div className="p-8 sm:p-12 font-mono text-xs leading-relaxed text-[#121820] whitespace-pre-wrap select-text bg-[#FAF7F2]/40 min-h-[680px]">
              {compiledText}
            </div>

            {/* Document Signatory Disclaimer Footer */}
            <div className="p-4 bg-[#F2EFE9] border-t border-[#E4DFD5] text-[11px] font-mono text-[#7A8699] flex items-center justify-between">
              <span>GENERATED VIA NYAAY AI DRAFTING ENGINE</span>
              <span>GROUNDED UNDER 93 INDIAN BARE ACTS</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
