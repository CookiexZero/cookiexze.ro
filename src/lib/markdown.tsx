import type { ReactNode } from 'react';

/**
 * Discord's inline markdown subset, rendered to React nodes.
 *
 * Output is React elements rather than an HTML string, so nothing the user
 * types in their Discord bio can inject markup — a literal `<3` stays `<3`.
 *
 * Emphasis markers are matched within a single line, the way Discord treats
 * them, so a stray `*` on one line can't italicise the rest of the bio.
 */
const TOKEN =
  /\*\*([^\n]+?)\*\*|__([^\n]+?)__|~~([^\n]+?)~~|\*([^\n]+?)\*|_([^\n]+?)_|`([^`\n]+)`|(https?:\/\/[^\s<]+)/;

export function renderInlineMarkdown(text: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  // A fresh regex per call: recursion would otherwise share `lastIndex`.
  const pattern = new RegExp(TOKEN.source, 'g');
  let cursor = 0;
  let key = 0;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(text)) !== null) {
    if (match.index > cursor) nodes.push(text.slice(cursor, match.index));
    const [full, bold, underline, strike, italic, italicAlt, code, url] = match;

    if (bold !== undefined) {
      nodes.push(
        <strong key={key++} className="font-semibold text-zinc-900">
          {renderInlineMarkdown(bold)}
        </strong>,
      );
    } else if (underline !== undefined) {
      nodes.push(
        <span key={key++} className="underline underline-offset-2">
          {renderInlineMarkdown(underline)}
        </span>,
      );
    } else if (strike !== undefined) {
      nodes.push(
        <s key={key++} className="text-zinc-400">
          {renderInlineMarkdown(strike)}
        </s>,
      );
    } else if (italic !== undefined || italicAlt !== undefined) {
      nodes.push(
        <em key={key++}>{renderInlineMarkdown((italic ?? italicAlt)!)}</em>,
      );
    } else if (code !== undefined) {
      nodes.push(
        <code
          key={key++}
          className="rounded bg-zinc-100 px-1 py-0.5 font-mono text-[0.9em] text-zinc-700"
        >
          {code}
        </code>,
      );
    } else if (url !== undefined) {
      nodes.push(
        <a
          key={key++}
          href={url}
          target="_blank"
          rel="noreferrer noopener"
          className="text-zinc-700 underline underline-offset-2 hover:text-zinc-900"
        >
          {url}
        </a>,
      );
    }

    cursor = match.index + full.length;
  }

  if (cursor < text.length) nodes.push(text.slice(cursor));
  return nodes;
}
