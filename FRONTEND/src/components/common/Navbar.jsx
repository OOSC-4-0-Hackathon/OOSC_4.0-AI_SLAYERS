import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  Sparkles, 
  Search, 
  BookOpen, 
  FileUp, 
  FileText, 
  Scale, 
  LayoutDashboard,
  Zap,
  FolderArchive,
  User,
  LogOut
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export default function Navbar({ fullWidth = false }) {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const NAV_ITEMS = [
    { path: '/', label: 'Home', icon: Sparkles },
    { path: '/civic', label: 'Civic Navigator', icon: Search },
    { path: '/know-your-kanoon', label: 'Kanoon Q&A', icon: BookOpen },
    { path: '/upload-chat', label: 'Doc Chat', icon: FileUp },
    { path: '/dochub', label: 'Drafting', icon: FileText },
    { path: '/reasoning', label: 'Reasoning', icon: Scale },
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  ];

  const handleDemoClick = () => {
    navigate('/civic', { state: { presetQuery: 'I filed an RTI application 38 days ago with Municipal Corporation regarding road repair tender not answered' } });
  };

  return (
    <header className="fixed top-0 w-full z-50 bg-[#FAF7F2]/90 backdrop-blur-md border-b border-[#E4DFD5] transition-colors">
      <div className={`${fullWidth ? 'w-full px-4 md:px-6' : 'max-w-7xl mx-auto px-4 sm:px-6'} flex items-center justify-between h-16 gap-3 sm:gap-6`}>
        
        {/* Left: Brand Identity matching Studio Navigation */}
        <Link to="/" className="flex items-center space-x-3 group select-none shrink-0">
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
        </Link>

        {/* Center: Segmented Navigation Pill matching Studio */}
        <nav className="hidden lg:flex items-center p-1 bg-[#EFECE6]/80 rounded-[6px] border border-[#E4DFD5]/90 shadow-inner" aria-label="Main Navigation">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`relative flex items-center space-x-1.5 px-3 py-1.5 rounded-[4px] text-xs font-mono transition-all duration-150 ${
                  isActive
                    ? 'bg-[#121820] text-[#FAF7F2] font-semibold shadow-xs'
                    : 'text-[#5A687D] hover:text-[#121820] hover:bg-[#FAF7F2]/60'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#C84B31]' : 'text-[#7A8699]'}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Right: Quick Actions */}
        <div className="flex items-center space-x-2 shrink-0">
          {/* Dockets quick link */}
          <Link
            to="/civic"
            className="flex items-center space-x-1.5 px-2.5 py-1.5 bg-white/90 hover:bg-white text-[#121820] border border-[#DDD6C9] hover:border-[#121820] text-xs font-mono rounded-[4px] transition-all shadow-2xs"
            title="View Case Dockets"
          >
            <FolderArchive className="w-3.5 h-3.5 text-[#5A687D]" />
            <span className="hidden md:inline">Dockets</span>
          </Link>

          {/* Auth Button */}
          {currentUser ? (
            <div className="flex items-center space-x-2">
              <span className="hidden sm:inline text-xs font-mono text-[#121820] bg-white border border-[#DDD6C9] px-2.5 py-1.5 rounded-[4px]">
                {currentUser.displayName || currentUser.email?.split('@')[0]}
              </span>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-1 px-2.5 py-1.5 bg-[#121820] hover:bg-[#222C3A] text-white text-xs font-mono rounded-[4px] transition-colors"
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
                className="px-3 py-1.5 text-xs font-mono text-[#5A687D] hover:text-[#121820] transition-colors"
              >
                Sign in
              </Link>
              <Link
                to="/signup"
                className="px-3 py-1.5 bg-[#121820] hover:bg-[#222C3A] text-white text-xs font-mono font-medium rounded-[4px] transition-colors shadow-xs"
              >
                Get started
              </Link>
            </div>
          )}
        </div>

      </div>

      {/* Mobile Horizontal Navigation Strip */}
      <div className="lg:hidden flex items-center space-x-1.5 px-4 py-2 bg-[#F4F1EB]/90 backdrop-blur-xs border-t border-[#E4DFD5] overflow-x-auto text-xs font-mono scrollbar-none">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center space-x-1 px-2.5 py-1.5 rounded-[4px] shrink-0 transition-all ${
                isActive
                  ? 'bg-[#121820] text-white font-medium shadow-xs'
                  : 'bg-white/70 text-[#5A687D] hover:text-[#121820] border border-[#E4DFD5]'
              }`}
            >
              <Icon className={`w-3 h-3 ${isActive ? 'text-[#C84B31]' : 'text-[#7A8699]'}`} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </header>
  );
}
