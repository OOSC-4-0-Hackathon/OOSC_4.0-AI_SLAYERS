import React, { useState } from 'react';
import { 
  BookOpen, 
  Search, 
  Layers, 
  ExternalLink, 
  FileText, 
  Filter, 
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { BARE_ACTS_CATALOG, CATEGORY_LABELS } from '../data/bareActsData';
import { BareAct } from '../types';

interface BareActsBrowserProps {
  onSelectActForQuery: (act: BareAct) => void;
}

export const BareActsBrowser: React.FC<BareActsBrowserProps> = ({
  onSelectActForQuery
}) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedActModal, setSelectedActModal] = useState<BareAct | null>(null);

  const filteredActs = BARE_ACTS_CATALOG.filter(act => {
    const matchesSearch = act.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          act.summary.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          act.keySections.some(s => s.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === 'ALL' || act.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Header */}
      <div className="border-b border-[#E4DFD5] pb-6 space-y-2">
        <div className="flex items-center space-x-2">
          <span className="stamp-badge text-[10px] px-2 py-0.5">
            STATUTORY REPOSITORY // 93 BARE ACTS
          </span>
          <span className="text-xs text-[#667085]">
            INDIAN LEGISLATIVE DATABASE
          </span>
        </div>
        <h1 className="font-serif text-3xl sm:text-4xl font-black text-[#121820]">
          Indian Bare Acts Grounding Index
        </h1>
        <p className="text-sm text-[#556377] max-w-2xl font-sans">
          Search the grounded statutory repository powering NYAAY AI's hybrid dense and sparse RRF retrieval engine.
        </p>
      </div>

      {/* Search & Category Filter */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-[#667085] absolute left-3.5 top-3.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search across 93 Bare Acts by title, section, or subject (e.g. 'RTI', 'Eviction', 'Warranty', 'Sec 106')..."
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#E4DFD5] focus:border-[#121820] rounded-[2px] text-xs font-sans outline-none"
          />
        </div>

        <div className="w-full sm:w-64">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full py-2.5 px-3 bg-white border border-[#E4DFD5] text-xs rounded-[2px] outline-none"
          >
            <option value="ALL">ALL CATEGORIES ({BARE_ACTS_CATALOG.length})</option>
            <option value="CIVIC_RIGHTS">Civic & Information Rights</option>
            <option value="CONSUMER_COMMERCIAL">Consumer & Commercial</option>
            <option value="PROPERTY_HOUSING">Property & Tenancy</option>
            <option value="CONSTITUTIONAL">Constitutional Charter</option>
            <option value="PENAL_PROCEDURAL">Procedural & Penal</option>
            <option value="ENVIRONMENTAL_LABOR">Environmental & Labor</option>
          </select>
        </div>
      </div>

      {/* Grid of Bare Acts */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredActs.map((act) => (
          <div
            key={act.id}
            className="border border-[#E4DFD5] bg-white hover:border-[#121820] hover:shadow-xs transition-all rounded-[2px] p-5 flex flex-col justify-between space-y-4"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-[#A83C25] uppercase">
                  {act.actCode}
                </span>
                <span className="text-[10px] text-[#667085]">
                  {act.year}
                </span>
              </div>

              <h3 className="font-serif font-bold text-lg text-[#121820]">
                {act.title}
              </h3>

              <div className="text-[11px] text-[#556377]">
                Category: {CATEGORY_LABELS[act.category]}
              </div>

              <p className="text-xs text-[#556377] font-sans line-clamp-3 leading-relaxed">
                {act.summary}
              </p>
            </div>

            {/* Key Sections Tags */}
            <div className="space-y-3 pt-3 border-t border-[#F2EFE9]">
              <div className="flex flex-wrap gap-1">
                {act.keySections.slice(0, 3).map((sec, idx) => (
                  <span key={idx} className="text-[10px] bg-[#FAF7F2] text-[#121820] border border-[#E4DFD5] px-1.5 py-0.5 rounded-[2px]">
                    {sec}
                  </span>
                ))}
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="text-[11px] text-[#667085]">
                  {act.sectionCount} SECTIONS
                </span>
                <button
                  onClick={() => onSelectActForQuery(act)}
                  className="px-3 py-1 bg-[#121820] hover:bg-[#2B3542] text-[#FAF7F2] text-[11px] rounded-[2px] transition-colors flex items-center space-x-1"
                >
                  <span>QUERY THIS ACT</span>
                  <ArrowRight className="w-3 h-3 text-[#C84B31]" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
