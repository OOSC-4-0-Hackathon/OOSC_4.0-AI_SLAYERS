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
 * Translucent glassmorphic navy header. Scroll > 80px increases opacity for
 * floating presence.
 *
 * Type: labels are Inter, not mono. Mono is reserved for data (the account
 * identifier) — it is not the UI typeface.
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
  const [signingOut, setSigningOut] = useState(false);
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
    if (signingOut) return;
    setSigningOut(true);
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Logout failed:', error);
      setSigningOut(false);
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

  /* Glassmorphic navy background (#121820 = rgb(18, 24, 32)) */
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
        <Link to="/" className="flex items-center space-x-2.5 group select-none shrink-0" aria-label="NYAAY AI — home">
          {/* Logo icon box */}
          <div className="w-8 h-8 rounded-[4px] bg-dark-raised text-paper flex items-center justify-center border border-rule-dark group-hover:border-accent transition-colors">
            <span className="font-serif font-bold text-sm tracking-tight text-paper">Ny</span>
          </div>

          {/* Wordmark */}
          <div className="flex items-baseline space-x-2">
            <span className="font-serif font-bold text-xl tracking-tight text-paper">
              NYAAY
            </span>
            <span className="text-[12px] uppercase tracking-widest px-1.5 py-0.5 rounded bg-accent text-paper font-bold border border-accent">
              AI
            </span>
            <span className="hidden xl:inline text-[#2B3542]" aria-hidden="true">|</span>
            <span className="hidden xl:inline text-[12px] font-sans font-medium uppercase tracking-wider text-slate">
              Civic Legal OS
            </span>
          </div>
        </Link>

        {/* Desktop nav — navy segmented container */}
        <nav
          className="hidden lg:flex items-center p-1 rounded-[6px] bg-dark-raised/80 border border-rule-dark shadow-inner"
          aria-label="Main navigation"
        >
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                aria-current={isActive ? 'page' : undefined}
                className={`relative flex items-center space-x-1.5 px-3 py-1.5 rounded-[4px] text-[13px] font-sans font-medium transition-all duration-150 focus-visible:ring-2 focus-visible:ring-accent focus-visible:outline-none ${
                  isActive
                    ? 'bg-accent text-paper font-semibold shadow-xs'
                    : 'text-slate hover:text-paper hover:bg-dark-rule/60'
                }`}
              >
                <Icon
                  aria-hidden="true"
                  className={`w-3.5 h-3.5 shrink-0 ${
                    isActive ? 'text-paper' : 'text-slate-muted'
                  }`}
                />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Right: actions */}
        <div className="flex items-center space-x-2 shrink-0">
          {/* Dockets */}
          <Link
            to="/civic"
            className="flex items-center space-x-1.5 px-2.5 py-1.5 bg-dark-raised/80 hover:bg-dark-rule text-slate hover:text-paper border border-rule-dark text-[13px] font-sans font-medium rounded-[4px] transition-all shadow-xs focus-visible:ring-2 focus-visible:ring-accent focus-visible:outline-none"
            aria-label="View saved case dockets"
          >
            <FolderArchive aria-hidden="true" className="w-3.5 h-3.5 text-slate-muted" />
            <span className="hidden md:inline">Dockets</span>
          </Link>

          {currentUser ? (
            <div className="flex items-center space-x-2">
              {/* Account identifier — mono, because it is data */}
              <span className="hidden sm:inline text-xs text-slate bg-dark-raised/80 border border-rule-dark px-2.5 py-1.5 rounded-[4px] truncate max-w-[120px]">
                {currentUser.displayName || currentUser.email?.split('@')[0]}
              </span>

              <button
                onClick={handleLogout}
                disabled={signingOut}
                aria-busy={signingOut}
                className="flex items-center space-x-1 px-2.5 py-1.5 bg-accent hover:bg-accent-hover disabled:opacity-60 disabled:cursor-not-allowed text-paper text-[13px] font-sans font-medium rounded-[4px] transition-colors shadow-xs focus-visible:ring-2 focus-visible:ring-[#FAF7F2] focus-visible:outline-none"
                aria-label="Sign out"
              >
                <LogOut aria-hidden="true" className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{signingOut ? 'Signing out…' : 'Sign out'}</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <Link
                to="/login"
                className="px-3 py-1.5 text-[13px] font-sans font-medium text-slate hover:text-paper transition-colors rounded-[4px] focus-visible:ring-2 focus-visible:ring-accent focus-visible:outline-none"
              >
                Sign in
              </Link>
              <Link
                to="/signup"
                className="px-3 py-1.5 bg-accent hover:bg-accent-hover text-paper text-[13px] font-sans font-medium rounded-[4px] transition-colors shadow-xs focus-visible:ring-2 focus-visible:ring-[#FAF7F2] focus-visible:outline-none"
              >
                Get started
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* ── Optional tab strip (e.g. CivicNavigator) ── */}
      {tabs && tabs.length > 0 && (
        <div className="border-t border-rule-dark bg-dark/90 backdrop-blur-md">
          <div
            className={`${innerClass} flex items-center gap-1 h-10 overflow-x-auto scrollbar-none`}
            role="tablist"
            aria-label="Section tabs"
          >
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => onTabChange?.(tab.id)}
                  className={`whitespace-nowrap px-3 py-1.5 rounded-[4px] text-[12px] font-sans font-semibold uppercase tracking-wider transition-all duration-150 focus-visible:ring-2 focus-visible:ring-accent focus-visible:outline-none ${
                    isActive
                      ? 'bg-accent text-paper'
                      : 'text-slate hover:text-paper hover:bg-dark-raised'
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
      <nav
        className="lg:hidden flex items-center space-x-1.5 px-4 py-2 bg-dark/95 backdrop-blur-md border-t border-rule-dark overflow-x-auto scrollbar-none"
        aria-label="Main navigation"
      >
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              aria-current={isActive ? 'page' : undefined}
              className={`flex items-center space-x-1 px-2.5 py-1.5 rounded-[4px] shrink-0 text-[12px] font-sans font-medium transition-all duration-150 focus-visible:ring-2 focus-visible:ring-accent focus-visible:outline-none ${
                isActive
                  ? 'bg-accent text-paper font-semibold shadow-xs'
                  : 'bg-dark-raised text-slate hover:text-paper border border-rule-dark'
              }`}
            >
              <Icon aria-hidden="true" className={`w-3 h-3 ${isActive ? 'text-paper' : 'text-slate-muted'}`} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
