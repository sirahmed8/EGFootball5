'use client';

/**
 * FormattedMarkdownText
 *
 * Lightweight markdown renderer for AI-generated content.
 * Supports: **bold**, *italics*, `code`, bullet lists (- / *), line breaks.
 * Used in: FloatingChatWidget AI tab, DailyAIAdviceCard, Announcements AI improve.
 */

interface Props {
  content: string;
  className?: string;
}

export function FormattedMarkdownText({ content, className = '' }: Props) {
  if (!content) return null;

  // Sanitize content by stripping inline script tags & raw HTML vectors
  const sanitized = content
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/javascript:/gi, '');

  const lines = sanitized.split('\n');

  return (
    <div className={`space-y-1 ${className}`}>
      {lines.map((line, lineIdx) => {
        if (!line.trim()) return <div key={lineIdx} className="h-1" />;

        // Parse inline **bold**, *italics*, `code`
        const parts = line.split(/(\*\*.*?\*\*|\*.*?\*|`.*?`)/g);

        const renderedParts = parts.map((part, pIdx) => {
          if (part.startsWith('**') && part.endsWith('**') && part.length > 4) {
            return (
              <strong key={pIdx} className="font-black text-foreground">
                {part.slice(2, -2)}
              </strong>
            );
          }
          if (part.startsWith('*') && part.endsWith('*') && part.length > 2) {
            return (
              <em key={pIdx} className="italic">
                {part.slice(1, -1)}
              </em>
            );
          }
          if (part.startsWith('`') && part.endsWith('`') && part.length > 2) {
            return (
              <code
                key={pIdx}
                className="bg-black/30 text-emerald-300 px-1 py-0.5 rounded font-mono text-[11px]"
              >
                {part.slice(1, -1)}
              </code>
            );
          }
          return part;
        });

        // Bullet list items
        if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
          return (
            <div key={lineIdx} className="flex items-start gap-1.5 ms-2">
              <span className="text-emerald-400 font-bold shrink-0 mt-0.5">•</span>
              <span>{renderedParts}</span>
            </div>
          );
        }

        // Heading-style lines (starting with #)
        if (line.trim().startsWith('# ')) {
          return (
            <p key={lineIdx} className="font-black text-foreground text-base leading-snug">
              {line.trim().slice(2)}
            </p>
          );
        }

        return (
          <p key={lineIdx} className="leading-relaxed">
            {renderedParts}
          </p>
        );
      })}
    </div>
  );
}
