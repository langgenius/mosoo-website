// The kit renders the assistant's short replies itself instead of shipping
// streamdown: bold, inline code and links are all the replies use.

import { segmentGraphemes } from "./stream-pacer";

export type InlineToken =
  | { readonly kind: "code" | "strong" | "text"; readonly text: string }
  | { readonly href: string; readonly kind: "link"; readonly text: string };

const INLINE = /\*\*([^*]+)\*\*|`([^`]+)`|\[([^\]]+)\]\(([^)\s]+)\)/g;

export function parseInline(markdown: string): InlineToken[] {
  const tokens: InlineToken[] = [];
  let last = 0;

  for (const match of markdown.matchAll(INLINE)) {
    if (match.index > last) {
      tokens.push({ kind: "text", text: markdown.slice(last, match.index) });
    }

    const [, strong, code, linkText, href] = match;
    if (strong !== undefined) {
      tokens.push({ kind: "strong", text: strong });
    } else if (code !== undefined) {
      tokens.push({ kind: "code", text: code });
    } else if (linkText !== undefined && href !== undefined) {
      tokens.push({ href, kind: "link", text: linkText });
    }

    last = match.index + match[0].length;
  }

  if (last < markdown.length) {
    tokens.push({ kind: "text", text: markdown.slice(last) });
  }

  return tokens;
}

export function countGraphemes(tokens: readonly InlineToken[]): number {
  return tokens.reduce((sum, token) => sum + segmentGraphemes(token.text).length, 0);
}

/** The first `visible` graphemes of the reply, keeping each token's formatting. */
export function sliceTokens(tokens: readonly InlineToken[], visible: number): InlineToken[] {
  const out: InlineToken[] = [];
  let remaining = visible;

  for (const token of tokens) {
    if (remaining <= 0) {
      break;
    }

    const graphemes = segmentGraphemes(token.text);
    if (graphemes.length <= remaining) {
      out.push(token);
      remaining -= graphemes.length;
      continue;
    }

    out.push({ ...token, text: graphemes.slice(0, remaining).join("") });
    remaining = 0;
  }

  return out;
}
