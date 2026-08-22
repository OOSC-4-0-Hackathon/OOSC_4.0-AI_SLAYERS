import React from 'react';
import { Link } from 'react-router-dom';
import { Scale, BookOpen, Search, FileText, FileUp, LayoutDashboard, Shield, ExternalLink } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full bg-[#121820] text-[#FAF7F2] border-t border-[#242F3E] pt-14 pb-10 mt-auto font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        
        {/* Main Structured 4-Column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 pb-12 border-b border-[#2B3542]">
          
          {/* Col 1: Brand & Identity (4 cols) */}
          <div className="lg:col-span-4 space-y-4">
            <Link to="/" className="flex items-center space-x-3 group">
              <div className="w-8 h-8 rounded-[4px] bg-[#1A222D] text-[#FAF7F2] flex items-center justify-center border border-[#2B3542] group-hover:border-[#C84B31] transition-colors">
                <span className="font-serif font-black text-sm tracking-tight text-[#FAF7F2]">Ny</span>
              </div>
              <div className="flex items-baseline space-x-2">
                <span className="font-serif font-extrabold text-xl tracking-tight text-[#FAF7F2]">
                  NYAAY
                </span>
                <span className="font-mono text-[9px] uppercase tracking-widest px-1.5 py-0.5 rounded bg-[#C84B31]/15 text-[#C84B31] font-bold border border-[#C84B31]/30">
                  AI
                </span>
              </div>
            </Link>

            <p className="text-[13px] text-[#A2B1C6] leading-relaxed max-w-sm">
              Transforming raw statutory chaos into clean, grounded, actionable legal dossiers across 93 Indian Bare Acts.
            </p>

            <div className="pt-2 flex items-center space-x-2">
              <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded bg-[#1A222D] border border-[#2B3542] text-[11px] font-mono text-[#C84B31] font-medium">
                <Shield className="w-3 h-3 text-[#C84B31]" />
                <span>OOSC 4.0 · Civic &amp; Legal Empowerment</span>
              </span>
            </div>
          </div>

          {/* Col 2: Legal Tools (3 cols) */}
          <div className="lg:col-span-3 space-y-3">
            <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-[#C84B31]">
              Legal &amp; Civic Tools
            </h3>
            <ul className="space-y-2.5 text-[13px]">
              <li>
                <Link to="/civic" className="text-[#A2B1C6] hover:text-white transition-colors flex items-center space-x-2 group">
                  <Search className="w-3.5 h-3.5 text-[#C84B31] group-hover:scale-110 transition-transform" />
                  <span>Civic Navigator</span>
                </Link>
              </li>
              <li>
                <Link to="/know-your-kanoon" className="text-[#A2B1C6] hover:text-white transition-colors flex items-center space-x-2 group">
                  <BookOpen className="w-3.5 h-3.5 text-[#C84B31] group-hover:scale-110 transition-transform" />
                  <span>Kanoon Q&amp;A</span>
                </Link>
              </li>
              <li>
                <Link to="/dochub" className="text-[#A2B1C6] hover:text-white transition-colors flex items-center space-x-2 group">
                  <FileText className="w-3.5 h-3.5 text-[#C84B31] group-hover:scale-110 transition-transform" />
                  <span>Document Drafting</span>
                </Link>
              </li>
              <li>
                <Link to="/upload-chat" className="text-[#A2B1C6] hover:text-white transition-colors flex items-center space-x-2 group">
                  <FileUp className="w-3.5 h-3.5 text-[#C84B31] group-hover:scale-110 transition-transform" />
                  <span>Document Chat</span>
                </Link>
              </li>
              <li>
                <Link to="/reasoning" className="text-[#A2B1C6] hover:text-white transition-colors flex items-center space-x-2 group">
                  <Scale className="w-3.5 h-3.5 text-[#C84B31] group-hover:scale-110 transition-transform" />
                  <span>Legal Reasoning</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Platform Navigation (2 cols) */}
          <div className="lg:col-span-2 space-y-3">
            <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-[#C84B31]">
              Navigation
            </h3>
            <ul className="space-y-2.5 text-[13px]">
              <li>
                <Link to="/" className="text-[#A2B1C6] hover:text-white transition-colors">
                  Home / Manifesto
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className="text-[#A2B1C6] hover:text-white transition-colors flex items-center space-x-1.5">
                  <LayoutDashboard className="w-3.5 h-3.5 text-[#C84B31]" />
                  <span>Dashboard</span>
                </Link>
              </li>
              <li>
                <Link to="/login" className="text-[#A2B1C6] hover:text-white transition-colors">
                  Sign In
                </Link>
              </li>
              <li>
                <Link to="/signup" className="text-[#A2B1C6] hover:text-white transition-colors">
                  Create Account
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Grounded Acts & Compliance (3 cols) */}
          <div className="lg:col-span-3 space-y-3">
            <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-[#C84B31]">
              93 Grounded Bare Acts
            </h3>
            <div className="space-y-2 text-[12px] text-[#A2B1C6] font-mono">
              <div className="p-2 rounded bg-[#1A222D] border border-[#2B3542]">
                <span className="text-[#FAF7F2] font-bold block">RTI Act, 2005</span>
                <span className="text-[11px] text-[#7A8699]">Sec 7(1) &amp; Sec 19 Appellate Forum</span>
              </div>
              <div className="p-2 rounded bg-[#1A222D] border border-[#2B3542]">
                <span className="text-[#FAF7F2] font-bold block">Consumer Protection Act, 2019</span>
                <span className="text-[11px] text-[#7A8699]">Defect &amp; Deficiency Remedies</span>
              </div>
              <div className="p-2 rounded bg-[#1A222D] border border-[#2B3542]">
                <span className="text-[#FAF7F2] font-bold block">Bharatiya Nyaya Sanhita (BNS)</span>
                <span className="text-[11px] text-[#7A8699]">Updated Statutory Provisions</span>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-[12px] text-[#7A8699]">
          <div className="font-mono">
            © {currentYear} NYAAY AI Engine · Grounded Legal OS
          </div>

          <div className="flex items-center space-x-6 text-[#A2B1C6]">
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a 
              href="https://github.com/AnshDarji/OOSC_4.0-AI_SLAYERS" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="hover:text-white transition-colors flex items-center space-x-1"
            >
              <span>GitHub Repository</span>
              <ExternalLink className="w-3 h-3 text-[#C84B31]" />
            </a>
            <a href="#" className="hover:text-white transition-colors">Legal Disclaimer</a>
          </div>
        </div>

      </div>
    </footer>
  );
}
