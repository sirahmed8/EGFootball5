'use client';

import * as React from 'react';

/**
 * FormattedMarkdownText
 *
 * Lightweight, zero-dependency semantic markdown renderer.
 * Strictly guarantees clean DOM rendering with zero raw markdown symbols (*, **, __, `) leaking as text.
 * Supports: **bold**, __bold__, *italics*, _italics_, `code`, bullet lists (- / * / •), numbered lists, headings (#, ##, ###).
 */

interface Props {
  content: string;
  className?: string;
}

function renderInline(text: string): React.ReactNode[] {
  if (!text) return [];

  // Normalize __bold__ to **bold** and _italic_ to *italic*
  const normalized = text
    .replace(/__([^_]+)__/g, '**$1**')
    .replace(/(?<!\w)_([^_]+)_(?!\w)/g, '*$1*');

  // Regex splitting on code, bold, and italic blocks
  const tokens = normalized.split(/(`[^`]+`|\*\*[^*]+\*\*|\*[^*]+\*)/g);

  return tokens.map((token, idx) => {
    if (!token) return null;

    if (token.startsWith('`') && token.endsWith('`') && token.length > 2) {
      return (
        <code
          key={idx}
          className="bg-black/40 text-emerald-300 px-1.5 py-0.5 rounded font-mono text-[11px] border border-white/10"
        >
          {token.slice(1, -1)}
        </code>
      );
    }

    if (token.startsWith('**') && token.endsWith('**') && token.length > 4) {
      return (
        <strong key={idx} className="font-bold text-foreground">
          {token.slice(2, -2)}
        </strong>
      );
    }

    if (token.startsWith('*') && token.endsWith('*') && token.length > 2) {
      return (
        <em key={idx} className="italic text-foreground/90">
          {token.slice(1, -1)}
        </em>
      );
    }

    // Clean any stray formatting asterisks or backticks that failed matching
    const cleanText = token.replace(/[*`_]/g, '');
    return <span key={idx}>{cleanText}</span>;
  });
}

export function FormattedMarkdownText({ content, className = '' }: Props) {
  if (!content) return null;

  // Sanitize content by stripping script injections and raw executable HTML
  const sanitized = content
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/javascript:/gi, '');

  const lines = sanitized.split('\n');

  return (
    <div className={`space-y-1.5 ${className}`}>
      {lines.map((rawLine, lineIdx) => {
        const line = rawLine.trim();
        if (!line) return <div key={lineIdx} className="h-1" />;

        // Heading 1 (# ...)
        if (line.startsWith('# ')) {
          return (
            <p key={lineIdx} className="font-black text-foreground text-base sm:text-lg leading-snug pt-1">
              {renderInline(line.slice(2))}
            </p>
          );
        }

        // Heading 2 (## ...)
        if (line.startsWith('## ')) {
          return (
            <p key={lineIdx} className="font-extrabold text-foreground text-sm sm:text-base leading-snug pt-1">
              {renderInline(line.slice(3))}
            </p>
          );
        }

        // Heading 3 (### ...)
        if (line.startsWith('### ')) {
          return (
            <p key={lineIdx} className="font-bold text-primary text-xs uppercase tracking-wider pt-0.5">
              {renderInline(line.slice(4))}
            </p>
          );
        }

        // Numbered list (e.g. "1. Step")
        const numberedMatch = line.match(/^(\d+)\.\s+(.+)$/);
        if (numberedMatch) {
          const [, num, itemContent] = numberedMatch;
          return (
            <div key={lineIdx} className="flex items-start gap-2 ms-1">
              <span className="text-primary font-bold text-xs shrink-0 select-none">{num}.</span>
              <span className="flex-1 leading-relaxed text-xs sm:text-sm">{renderInline(itemContent)}</span>
            </div>
          );
        }

        // Bullet list item (e.g. "- Item" or "* Item" or "• Item")
        const bulletMatch = line.match(/^[-*•]\s+(.+)$/);
        if (bulletMatch) {
          const [, itemContent] = bulletMatch;
          return (
            <div key={lineIdx} className="flex items-start gap-2 ms-1">
              <span className="text-primary font-bold shrink-0 mt-0.5 select-none leading-none">•</span>
              <span className="flex-1 leading-relaxed text-xs sm:text-sm">{renderInline(itemContent)}</span>
            </div>
          );
        }

        // Standard paragraph line
        return (
          <p key={lineIdx} className="leading-relaxed text-xs sm:text-sm">
            {renderInline(line)}
          </p>
        );
      })}
    </div>
  );
}
