import React from 'react';
import { Link } from 'react-router-dom';
import { Scale, BookOpen, Search, FileText, FileUp, LayoutDashboard, Shield, ExternalLink } from 'lucide-react';

/**
 * Footer.
 *
 * Contrast notes (all verified against the surface behind them):
 *   #FAF7F2 on #121820 → 17.2:1   column headings, act names
 *   #A2B1C6 on #1A222D →  7.4:1   links, act sub-lines
 *   #7A8699 on #121820 →  5.0:1   bottom bar
 *   #C84B31 on #121820 →  3.9:1   PASSES for icons/rules (3:1), FAILS for
 *                                 text under 18.66px. Never put 12px rust
 *                                 copy on navy — that is what the old column
 *                                 headings did.
 *
 * The top edge is a 2px rust rule, not `border-[#2B3542]`. The old border was
 * navy-on-navy (1.3:1) and vanished entirely where the footer met the dark
 * landing section above it.
 */
export default function Footer() {
  const currentYear = new Date().getFullYear();

  const linkClass =
    'text-[#A2B1C6] hover:text-[#FAF7F2] transition-colors rounded focus-visible:ring-2 focus-visible:ring-[#C84B31] focus-visible:outline-none';

  const headingClass =
    'text-[12px] font-sans font-semibold uppercase tracking-[0.08em] text-[#FAF7F2]';

  return (
    <footer className="w-full bg-[#121820] text-[#FAF7F2] border-t-2 border-[#C84B31] pt-14 pb-10 mt-auto font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">

        {/* Main Structured 4-Column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 pb-12 border-b border-[#2B3542]">

          {/* Col 1: Brand & Identity (4 cols) */}
          <div className="lg:col-span-4 space-y-4">
            <Link
              to="/"
              className="flex items-center space-x-3 group rounded focus-visible:ring-2 focus-visible:ring-[#C84B31] focus-visible:outline-none"
              aria-label="NYAAY AI — home"
            >
              <div className="w-8 h-8 rounded-[4px] bg-[#1A222D] text-[#FAF7F2] flex items-center justify-center border border-[#2B3542] group-hover:border-[#C84B31] transition-colors">
                <span className="font-serif font-bold text-sm tracking-tight text-[#FAF7F2]">Ny</span>
              </div>
              <div className="flex items-baseline space-x-2">
                <span className="font-serif font-bold text-xl tracking-tight text-[#FAF7F2]">
                  NYAAY
                </span>
                <span className="font-mono text-[10px] uppercase tracking-widest px-1.5 py-0.5 rounded bg-[#C84B31] text-[#FAF7F2] font-bold border border-[#C84B31]">
                  AI
                </span>
              </div>
            </Link>

            <p className="text-[13px] text-[#A2B1C6] leading-relaxed max-w-sm">
              Turns a civic or legal problem into a grounded, actionable case dossier —
              every claim traced back to the Bare Act it came from.
            </p>

            <div className="pt-2 flex items-center space-x-2">
              <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded bg-[#1A222D] border border-[#2B3542] text-[12px] text-[#A2B1C6] font-medium">
                <Shield aria-hidden="true" className="w-3 h-3 text-[#C84B31]" />
                <span>OOSC 4.0 · Civic &amp; Legal Empowerment</span>
              </span>
            </div>
          </div>

          {/* Col 2: Legal Tools (3 cols) */}
          <nav className="lg:col-span-3 space-y-3" aria-labelledby="footer-tools">
            <h2 id="footer-tools" className={headingClass}>
              Legal &amp; Civic Tools
            </h2>
            <ul className="space-y-2.5 text-[13px]">
              <li>
                <Link to="/civic" className={`${linkClass} flex items-center space-x-2 group`}>
                  <Search aria-hidden="true" className="w-3.5 h-3.5 text-[#C84B31] group-hover:scale-110 transition-transform" />
                  <span>Civic Navigator</span>
                </Link>
              </li>
              <li>
                <Link to="/know-your-kanoon" className={`${linkClass} flex items-center space-x-2 group`}>
                  <BookOpen aria-hidden="true" className="w-3.5 h-3.5 text-[#C84B31] group-hover:scale-110 transition-transform" />
                  <span>Kanoon Q&amp;A</span>
                </Link>
              </li>
              <li>
                <Link to="/dochub" className={`${linkClass} flex items-center space-x-2 group`}>
                  <FileText aria-hidden="true" className="w-3.5 h-3.5 text-[#C84B31] group-hover:scale-110 transition-transform" />
                  <span>Document Drafting</span>
                </Link>
              </li>
              <li>
                <Link to="/upload-chat" className={`${linkClass} flex items-center space-x-2 group`}>
                  <FileUp aria-hidden="true" className="w-3.5 h-3.5 text-[#C84B31] group-hover:scale-110 transition-transform" />
                  <span>Document Chat</span>
                </Link>
              </li>
              <li>
                <Link to="/reasoning" className={`${linkClass} flex items-center space-x-2 group`}>
                  <Scale aria-hidden="true" className="w-3.5 h-3.5 text-[#C84B31] group-hover:scale-110 transition-transform" />
                  <span>Legal Reasoning</span>
                </Link>
              </li>
            </ul>
          </nav>

          {/* Col 3: Platform Navigation (2 cols) */}
          <nav className="lg:col-span-2 space-y-3" aria-labelledby="footer-nav">
            <h2 id="footer-nav" className={headingClass}>
              Navigation
            </h2>
            <ul className="space-y-2.5 text-[13px]">
              <li>
                <Link to="/" className={linkClass}>
                  Home
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className={`${linkClass} flex items-center space-x-1.5`}>
                  <LayoutDashboard aria-hidden="true" className="w-3.5 h-3.5 text-[#C84B31]" />
                  <span>Dashboard</span>
                </Link>
              </li>
              <li>
                <Link to="/login" className={linkClass}>
                  Sign in
                </Link>
              </li>
              <li>
                <Link to="/signup" className={linkClass}>
                  Create account
                </Link>
              </li>
            </ul>
          </nav>

          {/* Col 4: Grounded Acts (3 cols) */}
          <div className="lg:col-span-3 space-y-3">
            <h2 className={headingClass}>93 Grounded Bare Acts</h2>
            <div className="space-y-2 text-[12px]">
              <div className="p-2 rounded bg-[#1A222D] border border-[#2B3542]">
                <span className="font-mono text-[#FAF7F2] font-bold block">RTI Act, 2005</span>
                <span className="text-[#A2B1C6]">Sec 7(1) &amp; Sec 19 Appellate Forum</span>
              </div>
              <div className="p-2 rounded bg-[#1A222D] border border-[#2B3542]">
                <span className="font-mono text-[#FAF7F2] font-bold block">Consumer Protection Act, 2019</span>
                <span className="text-[#A2B1C6]">Defect &amp; Deficiency Remedies</span>
              </div>
              <div className="p-2 rounded bg-[#1A222D] border border-[#2B3542]">
                <span className="font-mono text-[#FAF7F2] font-bold block">Bharatiya Nyaya Sanhita, 2023</span>
                <span className="text-[#A2B1C6]">Updated Statutory Provisions</span>
              </div>
            </div>
          </div>

        </div>

        {/*
          Standing disclaimer. An AI legal product should say this on every
          page, not bury it behind a link.
        */}
        <p className="pt-8 text-[12px] text-[#A2B1C6] leading-relaxed max-w-3xl">
          <span className="font-semibold text-[#FAF7F2]">This is not legal advice.</span>{' '}
          NYAAY AI is not a law firm and is not enrolled with any Bar Council. Output is
          machine-generated and can be wrong — verify it before you rely on it, and consult
          a licensed advocate for anything consequential.{' '}
          <Link
            to="/legal/disclaimer"
            className="text-[#FAF7F2] underline decoration-[#C84B31] decoration-2 underline-offset-2 hover:decoration-[#FAF7F2] transition-colors rounded focus-visible:ring-2 focus-visible:ring-[#C84B31] focus-visible:outline-none"
          >
            Read the full disclaimer
          </Link>
          .
        </p>

        {/* Bottom Bar */}
        <div className="mt-8 pt-6 border-t border-[#2B3542] flex flex-col md:flex-row items-center justify-between gap-4 text-[12px] text-[#7A8699]">
          <div className="font-mono">
            © {currentYear} NYAAY AI · Grounded Legal OS
          </div>

          <nav className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2" aria-label="Legal and source">
            <Link to="/legal/terms" className={linkClass}>Terms of Service</Link>
            <Link to="/legal/privacy" className={linkClass}>Privacy Policy</Link>
            <Link to="/legal/disclaimer" className={linkClass}>Legal Disclaimer</Link>
            <a
              href="https://github.com/AnshDarji/OOSC_4.0-AI_SLAYERS"
              target="_blank"
              rel="noopener noreferrer"
              className={`${linkClass} flex items-center space-x-1`}
            >
              <span>GitHub</span>
              <ExternalLink aria-hidden="true" className="w-3 h-3 text-[#C84B31]" />
            </a>
          </nav>
        </div>

      </div>
    </footer>
  );
}
