import React from 'react';
import { motion } from 'framer-motion';

const SECTION_CONFIG = {
  'Problem & Rights': {
    number: '01',
    icon: '§',
    color: 'border-l-ink',
  },
  'Evidence Required': {
    number: '02',
    icon: '✓',
    color: 'border-l-amber',
  },
  'Relevant Authority': {
    number: '03',
    icon: '⊕',
    color: 'border-l-ink-muted',
  },
  'Action Plan': {
    number: '04',
    icon: '→',
    color: 'border-l-success',
  },
  'Document Generation': {
    number: '05',
    icon: '⊡',
    color: 'border-l-amber',
  },
};

/**
 * SectionCard — renders one of the 5 structured sections of a Civic answer.
 * Stamps in with a decisive motion (150-220ms, sharp ease-out).
 * Used inside CivicNavigator to replace the undifferentiated markdown blob.
 */
export default function SectionCard({ title, content, isStreaming = false, index = 0 }) {
  const cfg = SECTION_CONFIG[title] || { number: '0' + (index + 1), icon: '·', color: 'border-l-paper-rule' };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1], delay: index * 0.04 }}
      className={`bg-paper-warm border border-paper-rule border-l-4 ${cfg.color} rounded-card p-5 mb-3`}
    >
      {/* Section header */}
      <div className="flex items-center gap-2.5 mb-3">
        <span className="font-mono text-[10px] text-ink-fog">{cfg.number}</span>
        <div className="h-px bg-paper-rule flex-grow" />
        <span className="label-stamp text-ink-muted">{title}</span>
      </div>

      {/* Content */}
      <div className="text-[14px] leading-relaxed text-ink prose prose-sm max-w-none
        prose-headings:font-display prose-headings:text-ink
        prose-strong:text-ink prose-strong:font-semibold
        prose-li:text-ink
        prose-a:text-amber prose-a:no-underline hover:prose-a:underline
      ">
        <span dangerouslySetInnerHTML={{ __html: content }} />
        {isStreaming && <span className="cursor-amber" aria-hidden="true" />}
      </div>
    </motion.div>
  );
}

/**
 * Parses a raw markdown string from the Civic Navigator stream into
 * sections keyed by the 5 expected H2 headers.
 *
 * Returns: Array<{ title: string, content: string }>
 *
 * Backend produces headers like: ## Problem & Rights, ## Evidence Required, etc.
 * This is purely a frontend concern — zero backend changes.
 */
const SECTION_TITLES = [
  'Problem & Rights',
  'Evidence Required',
  'Relevant Authority',
  'Action Plan',
  'Document Generation',
];

export function parseCivicSections(markdown = '') {
  const sections = [];
  const lines = markdown.split('\n');
  let currentTitle = null;
  let currentLines = [];

  for (const line of lines) {
    const headerMatch = line.match(/^#{1,3}\s+(.+)/);
    if (headerMatch) {
      const header = headerMatch[1].trim();
      const matched = SECTION_TITLES.find(t =>
        header.toLowerCase().includes(t.toLowerCase())
      );
      if (matched) {
        if (currentTitle) {
          sections.push({ title: currentTitle, content: currentLines.join('\n').trim() });
        }
        currentTitle = matched;
        currentLines = [];
        continue;
      }
    }
    if (currentTitle) {
      currentLines.push(line);
    }
  }

  if (currentTitle && currentLines.length > 0) {
    sections.push({ title: currentTitle, content: currentLines.join('\n').trim() });
  }

  // If no sections were parsed (stream still accumulating), return raw as one block
  if (sections.length === 0 && markdown.trim()) {
    return [{ title: null, content: markdown }];
  }

  return sections;
}
