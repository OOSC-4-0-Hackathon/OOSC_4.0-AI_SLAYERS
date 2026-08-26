import React from 'react';
import { X, FolderArchive, ArrowRight, Trash2, Calendar, FileText, ExternalLink } from 'lucide-react';
import { SavedCaseRecord } from '../types';

interface SavedDocketsModalProps {
  isOpen: boolean;
  onClose: () => void;
  savedCases: SavedCaseRecord[];
  onOpenCase: (record: SavedCaseRecord) => void;
  onDeleteCase: (id: string) => void;
}

export const SavedDocketsModal: React.FC<SavedDocketsModalProps> = ({
  isOpen,
  onClose,
  savedCases,
  onOpenCase,
  onDeleteCase
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-[#121820]/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white border border-[#121820] max-w-2xl w-full rounded-[2px] shadow-xl overflow-hidden animate-stamp max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="bg-[#121820] text-[#FAF7F2] px-6 py-3.5 flex items-center justify-between border-b border-[#2B3542]">
          <div className="flex items-center space-x-2 font-mono text-xs">
            <FolderArchive className="w-4 h-4 text-[#C84B31]" />
            <span className="font-bold tracking-wider uppercase">SAVED CASE FILE DOCKETS ({savedCases.length})</span>
          </div>
          <button onClick={onClose} className="text-[#A2B1C6] hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {savedCases.length === 0 ? (
            <div className="text-center py-12 space-y-3">
              <FolderArchive className="w-10 h-10 text-[#667085] mx-auto" />
              <h4 className="font-serif text-lg font-bold text-[#121820]">No Saved Case Dockets</h4>
              <p className="text-xs text-[#556377] max-w-xs mx-auto font-sans">
                When you generate a case dossier in the Civic Navigator, click "Save Docket" to preserve your evidence and action plan here.
              </p>
            </div>
          ) : (
            savedCases.map((rec) => (
              <div
                key={rec.id}
                className="border border-[#E4DFD5] bg-[#FAF7F2] p-4 rounded-[2px] hover:border-[#121820] transition-colors space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="stamp-badge text-[9px] px-1.5 py-0.2">
                        {rec.docketNumber}
                      </span>
                      <span className="font-mono text-[10px] text-[#667085]">
                        DOMAIN: {rec.domain}
                      </span>
                    </div>
                    <h4 className="font-serif font-bold text-base text-[#121820]">
                      {rec.title}
                    </h4>
                  </div>

                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => onDeleteCase(rec.id)}
                      className="p-1 text-[#667085] hover:text-rose-700"
                      title="Delete Docket"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <p className="text-xs text-[#556377] font-sans line-clamp-2">
                  {rec.dossier.problemAndRights.summary}
                </p>

                <div className="pt-2 border-t border-[#E4DFD5] flex items-center justify-between">
                  <span className="font-mono text-[10px] text-[#667085]">
                    SAVED: {new Date(rec.createdAt).toLocaleDateString()}
                  </span>

                  <button
                    onClick={() => {
                      onOpenCase(rec);
                      onClose();
                    }}
                    className="px-3 py-1 bg-[#121820] hover:bg-[#2B3542] text-[#FAF7F2] font-mono text-[11px] rounded-[2px] transition-colors flex items-center space-x-1"
                  >
                    <span>OPEN DOSSIER</span>
                    <ArrowRight className="w-3 h-3 text-[#C84B31]" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
