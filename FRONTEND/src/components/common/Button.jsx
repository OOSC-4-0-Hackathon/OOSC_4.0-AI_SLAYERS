import React from 'react';
import LoadingSpinner from './LoadingSpinner';

export default function Button({
  children,
  onClick,
  type = 'button',
  variant = 'primary',
  disabled = false,
  loading = false,
  className = '',
}) {
  const baseStyle = 'px-5 py-2.5 rounded-button font-medium text-[13px] transition-colors duration-150 focus:outline-none flex items-center justify-center gap-2 select-none disabled:opacity-50 disabled:cursor-not-allowed shadow-stamp';

  const variants = {
    primary: 'bg-ink text-paper hover:bg-ink-soft',
    amber: 'bg-amber text-paper hover:bg-amber-hover',
    outline: 'bg-transparent border border-paper-rule text-ink hover:border-paper-border hover:bg-paper-warm',
    secondary: 'bg-paper-warm text-ink hover:bg-paper border border-paper-rule',
    danger: 'bg-error text-paper hover:bg-red-700',
    // Keep legacy alias
    ghost: 'bg-transparent border border-paper-rule text-ink-muted hover:text-ink',
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`${baseStyle} ${variants[variant] || variants.primary} ${className}`}
    >
      {loading && <LoadingSpinner size="sm" className="text-current" />}
      {children}
    </button>
  );
}
