import React from 'react';
import LoadingSpinner from './LoadingSpinner';

/**
 * Canonical Button — 3 primary variants + danger.
 *
 * primary  → accent red fill (#C84B31) — the single CTA colour
 * secondary → near-black fill (#121820) — strong secondary action
 * ghost    → bordered transparent — tertiary / inline action
 * danger   → destructive actions only
 *
 * Legacy aliases: amber → primary, outline → ghost (unchanged callers won't break)
 */
export default function Button({
  children,
  onClick,
  type = 'button',
  variant = 'secondary',
  size = 'md',
  disabled = false,
  loading = false,
  className = '',
}) {
  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-5 py-2.5 text-[13px]',
    lg: 'px-6 py-3.5 text-sm',
  };

  const baseStyle = [
    'rounded-[3px] font-medium transition-all duration-150',
    'focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C84B31] focus-visible:ring-offset-1',
    'flex items-center justify-center gap-2 select-none',
    'disabled:opacity-40 disabled:cursor-not-allowed',
    'shadow-[0_1px_2px_rgba(26,24,20,0.06)]',
    sizes[size] || sizes.md,
  ].join(' ');

  const variants = {
    // === 3 canonical variants ===
    primary:   'bg-[#C84B31] hover:bg-[#A83C25] text-white font-semibold active:scale-[0.98]',
    secondary: 'bg-[#121820] hover:bg-[#222C3A] text-[#FAF7F2] font-semibold active:scale-[0.98]',
    ghost:     'bg-transparent border border-[#D4CFC4] text-[#1A1814] hover:border-[#1A1814] hover:bg-[#F2EFE9] font-medium',
    danger:    'bg-[#B83A2A] hover:bg-[#9B2E21] text-white font-semibold active:scale-[0.98]',
    // === legacy aliases (kept so existing callers don't break) ===
    amber:   'bg-[#C84B31] hover:bg-[#A83C25] text-white font-semibold active:scale-[0.98]',
    outline: 'bg-transparent border border-[#D4CFC4] text-[#1A1814] hover:border-[#1A1814] hover:bg-[#F2EFE9] font-medium',
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`${baseStyle} ${variants[variant] ?? variants.secondary} ${className}`}
    >
      {loading && <LoadingSpinner size="sm" className="text-current" />}
      {children}
    </button>
  );
}
