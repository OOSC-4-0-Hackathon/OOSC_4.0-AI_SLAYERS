import React from 'react';
import { Link } from 'react-router-dom';
import { Search, BookOpen, FileText, ArrowLeft } from 'lucide-react';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';

/*
 * 404. Previously an unknown URL matched no route and React Router rendered
 * nothing — a blank #FAF7F2 page with a navbar-less body.
 */

const SUGGESTIONS = [
  { to: '/civic', icon: Search, label: 'Civic Navigator', desc: 'Describe a problem, get a case dossier' },
  { to: '/know-your-kanoon', icon: BookOpen, label: 'Kanoon Q&A', desc: 'Ask what a statute actually says' },
  { to: '/dochub', icon: FileText, label: 'Document Drafting', desc: 'Generate an RTI, appeal, or notice' },
];

export default function NotFound() {
  return (
    <div className="min-h-screen bg-paper text-ink flex flex-col font-sans">
      <Navbar />

      <main className="flex-grow pt-[124px] lg:pt-[88px] pb-20">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-12 sm:py-20">

          <p className="font-mono text-xs font-bold uppercase tracking-[0.1em] text-[#A83C25]">
            Error 404
          </p>

          <h1 className="mt-4 font-serif text-display-md font-bold text-[#121820]">
            No such page on the record.
          </h1>

          <p className="mt-4 text-[15px] text-[#475467] leading-relaxed">
            The URL you followed does not match anything in this application. It may have
            been renamed, or the link may have been mistyped.
          </p>

          <Link
            to="/"
            className="mt-8 inline-flex items-center gap-1.5 text-[13px] font-medium text-[#A83C25] hover:text-[#8C271E] transition-colors rounded focus-visible:ring-2 focus-visible:ring-[#C84B31] focus-visible:outline-none"
          >
            <ArrowLeft aria-hidden="true" className="w-3.5 h-3.5" />
            Back to the home page
          </Link>

          <nav className="mt-12 pt-8 border-t border-[#E4DFD5]" aria-labelledby="nf-suggestions">
            <h2
              id="nf-suggestions"
              className="text-[12px] font-semibold uppercase tracking-[0.08em] text-[#556377]"
            >
              Or start here
            </h2>

            <ul className="mt-4 space-y-2">
              {SUGGESTIONS.map(({ to, icon: Icon, label, desc }) => (
                <li key={to}>
                  <Link
                    to={to}
                    className="group flex items-start gap-3 p-4 bg-[#FFFFFF] border border-[#E4DFD5] rounded-[3px] hover:border-[#C84B31] transition-colors focus-visible:ring-2 focus-visible:ring-[#C84B31] focus-visible:outline-none"
                  >
                    <Icon aria-hidden="true" className="w-4 h-4 mt-0.5 shrink-0 text-[#C84B31]" />
                    <span>
                      <span className="block text-[14px] font-semibold text-[#121820]">
                        {label}
                      </span>
                      <span className="block mt-0.5 text-[13px] text-[#556377]">
                        {desc}
                      </span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

        </div>
      </main>

      <Footer />
    </div>
  );
}
