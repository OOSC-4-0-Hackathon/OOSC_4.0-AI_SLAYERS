import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  const currentYear = new Date().getFullYear();
  return (
    <footer className="w-full border-t border-paper-rule bg-paper py-10 mt-auto">
      <div className="max-w-[1280px] mx-auto px-4 md:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-8">
          {/* Wordmark — no gavel */}
          <Link to="/" className="flex items-center gap-2">
            <span className="font-display italic text-[18px] font-bold text-ink" style={{ fontFamily: 'Newsreader, Georgia, serif' }}>N</span>
            <span className="font-sans text-[14px] font-semibold text-ink">NYAAY<span className="text-amber"> AI</span></span>
          </Link>
          <span className="font-mono text-[11px] text-ink-fog">
            © {currentYear} — OOSC 4.0 · Civic &amp; Legal Empowerment
          </span>
        </div>
        <div className="flex items-center gap-5">
          {['Terms', 'Privacy', 'GitHub', 'Disclaimer'].map(item => (
            <a key={item} href="#" className="text-[12px] text-ink-muted hover:text-ink transition-colors">
              {item}
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}
