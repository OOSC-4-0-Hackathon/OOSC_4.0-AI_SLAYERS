import React from 'react';
import { motion } from 'framer-motion';

const DOMAIN_CONFIG = {
  RTI: {
    label: 'RTI',
    description: 'Right to Information',
    color: 'bg-amber-light border-amber text-amber-dark',
    dot: 'bg-amber',
  },
  CONSUMER: {
    label: 'Consumer',
    description: 'Consumer Protection Act',
    color: 'bg-success-bg border-success text-success',
    dot: 'bg-success',
  },
  TENANT: {
    label: 'Tenant Rights',
    description: 'Rent Control Acts',
    color: 'bg-paper-warm border-paper-rule text-ink-muted',
    dot: 'bg-ink-muted',
  },
  GENERAL: {
    label: 'Civil',
    description: 'General Legal',
    color: 'bg-paper-warm border-paper-rule text-ink-muted',
    dot: 'bg-ink-muted',
  },
};

/**
 * Detects domain from the first status message text.
 * Mirrors the backend's deterministic regex classifier — zero latency.
 */
export function detectDomain(statusText = '') {
  const lower = statusText.toLowerCase();
  if (lower.includes('rti') || lower.includes('right to information')) return 'RTI';
  if (lower.includes('consumer') || lower.includes('product') || lower.includes('warranty')) return 'CONSUMER';
  if (lower.includes('tenant') || lower.includes('rent') || lower.includes('eviction')) return 'TENANT';
  return 'GENERAL';
}

export default function DomainBadge({ domain = 'GENERAL', visible = false }) {
  const cfg = DOMAIN_CONFIG[domain] || DOMAIN_CONFIG.GENERAL;

  if (!visible) return null;

  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-stamp border text-[11px] font-semibold tracking-wide uppercase ${cfg.color}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot} flex-shrink-0`} />
      {cfg.label}
    </motion.div>
  );
}
