import React from 'react';
import { 
  ArrowLeft, 
  Settings, 
  Minus, 
  Plus, 
  Maximize, 
  Printer, 
  FileText, 
  Copy, 
  Edit3 
} from 'lucide-react';
import { WATERMARK_OPTIONS, LETTERHEAD_TEMPLATES } from './templates/index';

/**
 * DocumentToolbar — sticky PDF-viewer-style toolbar.
 * Modelled on Adobe Reader / Microsoft Word top bar.
 *
 * Layout:
 *   [ ← Back ] | [ Template ▾ ] [ Watermark ▾ ] [ ⚙ ] | [ − ] XX% [ + ] [ ⛶ ] | [ 🖨 ] [ PDF ] [ DOCX ] | [ ✂ Copy ] [ ✎ Edit ] [ ↩ Over ]
 */
export default function DocumentToolbar({
  draftResult,
  zoom,           onZoomChange,
  watermark,      onWatermarkChange,
  template,       onTemplateChange,
  onLetterheadOpen,
  onPrint,
  onDownloadPdf,
  onDownloadDocx,
  onCopyText,
  onEditToggle,   isEditing,
  onStartOver,
  onFullscreen,
}) {
  const zoomPct = Math.round(zoom * 100);

  return (
    <div className="no-print sticky top-0 z-20 bg-dark-rule text-white px-4 py-2 flex flex-wrap items-center gap-2 shadow-lg select-none">

      {/* ── Back ──────────────────────────── */}
      <button onClick={onStartOver} className="toolbar-btn toolbar-btn--text flex items-center gap-1.5" title="Start Over">
        <ArrowLeft className="w-4 h-4" />
        <span className="hidden sm:inline text-xs">Back</span>
      </button>

      <div className="toolbar-divider" />

      {/* ── Document info ─────────────────── */}
      <span className="text-xs text-slate hidden md:block truncate max-w-[200px]">
        {draftResult?.document_type?.replace(/_/g, ' ')} · v{draftResult?.metadata?.version || 1}
      </span>

      <div className="toolbar-divider" />

      {/* ── Template ──────────────────────── */}
      <label className="text-xs text-slate-muted hidden sm:block">Template</label>
      <select
        value={template}
        onChange={e => onTemplateChange(e.target.value)}
        className="toolbar-select"
        title="Select letterhead template"
      >
        {LETTERHEAD_TEMPLATES.map(t => (
          <option key={t.id} value={t.id}>{t.label}</option>
        ))}
      </select>

      {/* ── Watermark ─────────────────────── */}
      <label className="text-xs text-slate-muted hidden sm:block">Watermark</label>
      <select
        value={watermark}
        onChange={e => onWatermarkChange(e.target.value)}
        className="toolbar-select"
        title="Select watermark"
      >
        {WATERMARK_OPTIONS.map(w => (
          <option key={w.id} value={w.id}>{w.label}</option>
        ))}
      </select>

      {/* ── Letterhead Settings ───────────── */}
      <button onClick={onLetterheadOpen} className="toolbar-btn flex items-center justify-center" title="Letterhead Settings">
        <Settings className="w-4 h-4" />
      </button>

      <div className="toolbar-divider" />

      {/* ── Zoom ──────────────────────────── */}
      <button onClick={() => onZoomChange(Math.max(0.5, zoom - 0.1))} className="toolbar-btn flex items-center justify-center" title="Zoom out">
        <Minus className="w-4 h-4" />
      </button>
      <span className="text-xs w-10 text-center tabular-nums">{zoomPct}%</span>
      <button onClick={() => onZoomChange(Math.min(1.5, zoom + 0.1))} className="toolbar-btn flex items-center justify-center" title="Zoom in">
        <Plus className="w-4 h-4" />
      </button>

      {/* ── Fullscreen ────────────────────── */}
      <button onClick={onFullscreen} className="toolbar-btn flex items-center justify-center" title="Fullscreen">
        <Maximize className="w-4 h-4" />
      </button>

      <div className="toolbar-divider" />

      {/* ── Print ─────────────────────────── */}
      <button onClick={onPrint} className="toolbar-btn flex items-center gap-1.5" title="Print">
        <Printer className="w-4 h-4" />
        <span className="hidden sm:inline text-xs">Print</span>
      </button>

      {/* ── PDF ───────────────────────────── */}
      <button onClick={onDownloadPdf} className="toolbar-btn toolbar-btn--pdf flex items-center gap-1.5" title="Download PDF">
        <FileText className="w-4 h-4 text-accent" />
        <span className="hidden sm:inline text-xs">PDF</span>
      </button>

      {/* ── DOCX ──────────────────────────── */}
      <button onClick={onDownloadDocx} className="toolbar-btn toolbar-btn--docx flex items-center gap-1.5" title="Download DOCX">
        <FileText className="w-4 h-4 text-blue-400" />
        <span className="hidden sm:inline text-xs">DOCX</span>
      </button>

      <div className="toolbar-divider" />

      {/* ── Copy ──────────────────────────── */}
      <button onClick={onCopyText} className="toolbar-btn flex items-center gap-1.5" title="Copy text">
        <Copy className="w-4 h-4" />
        <span className="hidden sm:inline text-xs">Copy</span>
      </button>

      {/* ── Edit ──────────────────────────── */}
      <button
        onClick={onEditToggle}
        className={`toolbar-btn flex items-center gap-1.5 ${isEditing ? 'toolbar-btn--active' : ''}`}
        title="Edit draft"
      >
        <Edit3 className="w-4 h-4" />
        <span className="hidden sm:inline text-xs">Edit</span>
      </button>
    </div>
  );
}
