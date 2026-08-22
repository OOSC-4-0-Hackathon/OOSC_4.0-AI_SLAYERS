import React from 'react';
import { 
  Search, 
  CheckSquare, 
  ListOrdered, 
  FileText, 
  BookOpen, 
  FolderArchive, 
  User, 
  Sparkles,
  Zap,
  ShieldCheck,
  Bot
} from 'lucide-react';
import { DomainCategory } from '../types';

export type ActiveTab = 'landing' | 'navigator' | 'scheme_reader' | 'form_filler' | 'evidence' | 'action_plan' | 'drafter' | 'bare_acts';

interface NavigationProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  activeDocketId?: string;
  activeDomain?: DomainCategory;
  savedCasesCount: number;
  onOpenSavedModal: () => void;
  onOpenAuthModal: () => void;
  onStartDemoFlow: () => void;
  userEmail?: string | null;
}

interface NavItem {
  id: ActiveTab;
  label: string;
  shortLabel: string;
  icon: React.ElementType;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'landing', label: 'Manifesto', shortLabel: 'Manifesto', icon: Sparkles },
  { id: 'navigator', label: 'Navigator', shortLabel: 'Navigator', icon: Search },
  { id: 'scheme_reader', label: 'Scheme Reader', shortLabel: 'Schemes', icon: ShieldCheck },
  { id: 'form_filler', label: 'Form-Filler', shortLabel: 'Forms', icon: Bot },
  { id: 'evidence', label: 'Evidence Vault', shortLabel: 'Evidence', icon: CheckSquare },
  { id: 'action_plan', label: 'Action Plan', shortLabel: 'Timeline', icon: ListOrdered },
  { id: 'drafter', label: 'Legal Drafter', shortLabel: 'Drafter', icon: FileText },
  { id: 'bare_acts', label: '93 Bare Acts', shortLabel: '93 Acts', icon: BookOpen },
];

export const Navigation: React.FC<NavigationProps> = ({
  activeTab,
  setActiveTab,
  savedCasesCount,
  onOpenSavedModal,
  onOpenAuthModal,
  onStartDemoFlow,
  userEmail
}) => {
  return (
    <header className="relative w-full z-30 bg-[#FAF7F2]/85 backdrop-blur-md border-b border-[#E4DFD5]/80 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16 gap-3 sm:gap-6">
          
          {/* Left: Brand Identity */}
          <div 
            onClick={() => setActiveTab('landing')}
            className="cursor-pointer flex items-center space-x-3 group select-none shrink-0"
            tabIndex={0}
            role="button"
            onKeyDown={(e) => { if (e.key === 'Enter') setActiveTab('landing'); }}
          >
            <div className="w-8 h-8 rounded-[4px] bg-[#121820] text-[#FAF7F2] flex items-center justify-center border border-[#2B3542] shadow-2xs group-hover:border-[#C84B31] transition-colors">
              <span className="font-serif font-black text-sm tracking-tight">Ny</span>
            </div>
            
            <div className="flex items-baseline space-x-2">
              <span className="font-serif font-extrabold text-lg sm:text-xl tracking-tight text-[#121820]">
                NYAAY
              </span>
              <span className="font-mono text-[9px] uppercase tracking-widest px-1 py-0.5 rounded bg-[#C84B31]/10 text-[#C84B31] font-bold border border-[#C84B31]/20">
                AI
              </span>
              <span className="hidden xl:inline text-[#DDD6C9] font-light">|</span>
              <span className="hidden xl:inline text-[11px] font-mono text-[#7A8699] uppercase tracking-wider">
                CIVIC LEGAL OS
              </span>
            </div>
          </div>

          {/* Center: Clean Segmented Pill Navigation */}
          <nav className="hidden lg:flex items-center p-1 bg-[#EFECE6]/80 rounded-[6px] border border-[#E4DFD5]/90 shadow-inner" aria-label="Main Navigation">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`relative flex items-center space-x-1.5 px-3 py-1.5 rounded-[4px] text-xs font-mono transition-all duration-150 cursor-pointer ${
                    isActive
                      ? 'bg-[#121820] text-[#FAF7F2] font-semibold shadow-xs'
                      : 'text-[#5A687D] hover:text-[#121820] hover:bg-[#FAF7F2]/60'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#C84B31]' : 'text-[#7A8699]'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right: Quick Action Controls */}
          <div className="flex items-center space-x-2 shrink-0">
            {/* 90s Guided Demo Pill */}
            <button
              onClick={onStartDemoFlow}
              className="flex items-center space-x-1.5 px-2.5 sm:px-3 py-1.5 bg-[#C84B31] hover:bg-[#B33D24] text-white text-xs font-mono font-medium rounded-[4px] transition-all shadow-xs cursor-pointer active:scale-95"
              title="Launch 90-Second Judge Guided Demo Flow"
            >
              <Zap className="w-3.5 h-3.5 fill-amber-200 text-amber-200" />
              <span className="hidden sm:inline">90s Demo</span>
              <span className="sm:hidden">Demo</span>
            </button>

            {/* Saved Dockets Button */}
            <button
              onClick={onOpenSavedModal}
              className="flex items-center space-x-1.5 px-2.5 py-1.5 bg-white/90 hover:bg-white text-[#121820] border border-[#DDD6C9] hover:border-[#121820] text-xs font-mono rounded-[4px] transition-all shadow-2xs cursor-pointer"
              title="View Saved Case Dockets"
            >
              <FolderArchive className="w-3.5 h-3.5 text-[#5A687D]" />
              <span className="hidden md:inline">Dockets</span>
              <span className="inline-flex items-center justify-center min-w-4 h-4 px-1 text-[10px] font-bold rounded-full bg-[#121820] text-white">
                {savedCasesCount}
              </span>
            </button>

            {/* Citizen Auth Button */}
            <button
              onClick={onOpenAuthModal}
              className="flex items-center space-x-1.5 px-2.5 py-1.5 bg-white/90 hover:bg-white text-[#121820] border border-[#DDD6C9] hover:border-[#121820] text-xs font-mono rounded-[4px] transition-all shadow-2xs cursor-pointer"
              title="Citizen Authentication / Profile"
            >
              <User className="w-3.5 h-3.5 text-[#C84B31]" />
              <span className="hidden sm:inline max-w-[100px] truncate">
                {userEmail ? userEmail.split('@')[0] : 'Auth'}
              </span>
            </button>
          </div>

        </div>
      </div>

      {/* Mobile / Tablet Horizontal Navigation Strip */}
      <div className="lg:hidden flex items-center space-x-1.5 px-4 py-2 bg-[#F4F1EB]/90 backdrop-blur-xs border-t border-[#E4DFD5]/80 overflow-x-auto text-xs font-mono scrollbar-none">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex items-center space-x-1 px-2.5 py-1.5 rounded-[4px] shrink-0 transition-all ${
                isActive
                  ? 'bg-[#121820] text-white font-medium shadow-xs'
                  : 'bg-white/70 text-[#5A687D] hover:text-[#121820] border border-[#E4DFD5]'
              }`}
            >
              <Icon className={`w-3 h-3 ${isActive ? 'text-[#C84B31]' : 'text-[#7A8699]'}`} />
              <span>{item.shortLabel}</span>
            </button>
          );
        })}
      </div>
    </header>
  );
};
