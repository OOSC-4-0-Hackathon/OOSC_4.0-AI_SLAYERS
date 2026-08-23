import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Sparkles,
  Search,
  BookOpen,
  FileUp,
  FileText,
  Scale,
  LayoutDashboard,
  FolderArchive,
  LogOut,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

/**
 * AppNav — unified navigation bar for all routes.
 *
 * Translucent glassmorphic Navy Blue pill header (#121820 / rgba(18, 24, 32, 0.75)).
 * Scroll > 80px increases opacity to 0.92 for floating presence.
 *
 * Props:
 *   fullWidth    — stretch to full viewport width (default: max-w-7xl centred)
 *   tabs         — array of { id, label } objects
 *   activeTab    — currently active tab id
 *   onTabChange  — (id: string) => void
 */
export default function Navbar({ fullWidth = false, tabs, activeTab, onTabChange }) {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const rafRef = useRef(null);

  /* ── Scroll-driven opacity boost ── */
  useEffect(() => {
    const onScroll = () => {
      if (rafRef.current) return;
      rafRef.current = requestAnimationFrame(() => {
        setScrolled(window.scrollY > 80);
        rafRef.current = null;
      });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  /* ── Nav order: Home → Dashboard → Civic Navigator → Kanoon Q&A → Doc Chat → Drafting → Reasoning ── */
  const NAV_ITEMS = [
    { path: '/',                 label: 'Home',            icon: Sparkles },
    { path: '/dashboard',        label: 'Dashboard',       icon: LayoutDashboard },
    { path: '/civic',            label: 'Civic Navigator', icon: Search },
    { path: '/know-your-kanoon', label: 'Kanoon Q&A',      icon: BookOpen },
    { path: '/upload-chat',      label: 'Doc Chat',        icon: FileUp },
    { path: '/dochub',           label: 'Drafting',        icon: FileText },
    { path: '/reasoning',        label: 'Reasoning',       icon: Scale },
  ];

  const innerClass = fullWidth ? 'w-full px-4 md:px-6' : 'max-w-7xl mx-auto px-4 sm:px-6';

  /* Glassmorphic Navy Blue background (#121820 = rgb(18, 24, 32)) */
  const barBg = scrolled
    ? 'rgba(18, 24, 32, 0.92)'
    : 'rgba(18, 24, 32, 0.78)';

  return (
    <header
      className="fixed top-0 w-full z-50 transform-gpu will-change-transform transition-all duration-300"
      style={{
        background: barBg,
        backdropFilter: 'blur(16px) saturate(160%)',
        WebkitBackdropFilter: 'blur(16px) saturate(160%)',
        borderBottom: '1px solid rgba(43, 53, 66, 0.6)',
      }}
    >
      {/* ── Main row ── */}
      <div className={`${innerClass} flex items-center justify-between h-16 gap-3 sm:gap-6`}>

        {/* Brand */}
        <Link to="/" className="flex items-center space-x-2.5 group select-none shrink-0">
          {/* Logo icon box */}
          <div className="w-8 h-8 rounded-[4px] bg-[#1A222D] text-[#FAF7F2] flex items-center justify-center border border-[#2B3542] group-hover:border-[#C84B31] transition-colors">
            <span className="font-serif font-black text-sm tracking-tight text-[#FAF7F2]">Ny</span>
          </div>

          {/* Wordmark */}
          <div className="flex items-baseline space-x-2">
            <span className="font-serif font-extrabold text-xl tracking-tight text-[#FAF7F2]">
              NYAAY
            </span>
            {/* AI badge — rust-orange #C84B31 */}
            <span className="font-mono text-[9px] uppercase tracking-widest px-1.5 py-0.5 rounded bg-[#C84B31] text-[#FAF7F2] font-bold border border-[#C84B31]">
              AI
            </span>
            <span className="hidden xl:inline text-[#2B3542]">|</span>
            <span className="hidden xl:inline text-[11px] font-mono uppercase tracking-wider text-[#A2B1C6]">
              CIVIC LEGAL OS
            </span>
          </div>
        </Link>

        {/* Desktop nav — Navy blue segmented container */}
        <nav
          className="hidden lg:flex items-center p-1 rounded-[6px] bg-[#1A222D]/80 border border-[#2B3542] shadow-inner"
          aria-label="Main Navigation"
        >
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`relative flex items-center space-x-1.5 px-3 py-1.5 rounded-[4px] text-xs font-mono transition-all duration-150 ${
                  isActive
                    ? 'bg-[#C84B31] text-[#FAF7F2] font-semibold shadow-xs'
                    : 'text-[#A2B1C6] hover:text-[#FAF7F2] hover:bg-[#2B3542]/60'
                }`}
              >
                <Icon
                  className={`w-3.5 h-3.5 shrink-0 ${
                    isActive ? 'text-[#FAF7F2]' : 'text-[#7A8699]'
                  }`}
                />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Right: actions */}
        <div className="flex items-center space-x-2 shrink-0">
          {/* Dockets — Navy blue ghost button */}
          <Link
            to="/civic"
            className="flex items-center space-x-1.5 px-2.5 py-1.5 bg-[#1A222D]/80 hover:bg-[#2B3542] text-[#A2B1C6] hover:text-[#FAF7F2] border border-[#2B3542] text-xs font-mono rounded-[4px] transition-all shadow-xs"
            title="View Case Dockets"
          >
            <FolderArchive className="w-3.5 h-3.5 text-[#7A8699]" />
            <span className="hidden md:inline">Dockets</span>
          </Link>

          {currentUser ? (
            <div className="flex items-center space-x-2">
              {/* Username chip */}
              <span className="hidden sm:inline text-xs font-mono text-[#A2B1C6] bg-[#1A222D]/80 border border-[#2B3542] px-2.5 py-1.5 rounded-[4px] truncate max-w-[120px]">
                {currentUser.displayName || currentUser.email?.split('@')[0]}
              </span>

              {/* Sign out — solid rust-orange fill */}
              <button
                onClick={handleLogout}
                className="flex items-center space-x-1 px-2.5 py-1.5 bg-[#C84B31] hover:bg-[#A83C25] text-[#FAF7F2] text-xs font-mono font-medium rounded-[4px] transition-colors shadow-xs"
                title="Sign out"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Sign out</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <Link
                to="/login"
                className="px-3 py-1.5 text-xs font-mono text-[#A2B1C6] hover:text-[#FAF7F2] transition-colors"
              >
                Sign in
              </Link>
              <Link
                to="/signup"
                className="px-3 py-1.5 bg-[#C84B31] hover:bg-[#A83C25] text-[#FAF7F2] text-xs font-mono font-medium rounded-[4px] transition-colors shadow-xs"
              >
                Get started
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* ── Optional tab strip (e.g. CivicNavigator) ── */}
      {tabs && tabs.length > 0 && (
        <div className="border-t border-[#2B3542] bg-[#121820]/90 backdrop-blur-md">
          <div className={`${innerClass} flex items-center gap-1 h-10 overflow-x-auto scrollbar-none`}>
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => onTabChange?.(tab.id)}
                  className={`whitespace-nowrap px-3 py-1.5 rounded-[4px] text-[11px] font-mono font-semibold uppercase tracking-wider transition-all duration-150 ${
                    isActive
                      ? 'bg-[#C84B31] text-[#FAF7F2]'
                      : 'text-[#A2B1C6] hover:text-[#FAF7F2] hover:bg-[#1A222D]'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Mobile nav strip ── */}
      <div className="lg:hidden flex items-center space-x-1.5 px-4 py-2 bg-[#121820]/95 backdrop-blur-md border-t border-[#2B3542] overflow-x-auto text-xs font-mono scrollbar-none">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center space-x-1 px-2.5 py-1.5 rounded-[4px] shrink-0 transition-all duration-150 ${
                isActive
                  ? 'bg-[#C84B31] text-[#FAF7F2] font-semibold shadow-xs'
                  : 'bg-[#1A222D] text-[#A2B1C6] hover:text-[#FAF7F2] border border-[#2B3542]'
              }`}
            >
              <Icon className={`w-3 h-3 ${isActive ? 'text-[#FAF7F2]' : 'text-[#7A8699]'}`} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </header>
  );
}
