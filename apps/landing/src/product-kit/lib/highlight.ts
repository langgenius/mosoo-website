// A small highlighter for the two languages the kit shows: one shell command
// (curl with flags, $VARS and quoted strings) and JSON. It tokenizes line by
// line and never reorders or drops characters, so the joined tokens are the
// exact source text. Colours are console status tones, all at least 4.5:1 on
// the sunken surface (#f4f4f4): keys info-fg 5.5:1, strings soil-fg, $VARS
// warning-fg 5.4:1, punctuation and flags fg-3 4.7:1.

export type TokenKind = "command" | "flag" | "key" | "literal" | "plain" | "punct" | "string" | "variable";

export interface Token {
  kind: TokenKind;
  text: string;
}

export const TOKEN_CLASS: Record<TokenKind, string> = {
  command: "text-fg-heading font-semibold",
  flag: "text-fg-3",
  key: "text-info-fg",
  literal: "text-fg-heading",
  plain: "",
  punct: "text-fg-3",
  string: "text-soil-fg",
  variable: "text-warning-fg",
};

const VARIABLE = /\$[A-Z_][A-Z0-9_]*/g;

function splitVariables(text: string, kind: TokenKind): Token[] {
  const tokens: Token[] = [];
  let last = 0;

  for (const match of text.matchAll(VARIABLE)) {
    const index = match.index;
    if (index > last) {
      tokens.push({ kind, text: text.slice(last, index) });
    }
    tokens.push({ kind: "variable", text: match[0] });
    last = index + match[0].length;
  }

  if (last < text.length) {
    tokens.push({ kind, text: text.slice(last) });
  }

  return tokens;
}

export function highlightLine(line: string): Token[] {
  const tokens: Token[] = [];
  let index = 0;

  while (index < line.length) {
    const rest = line.slice(index);
    const char = line.charAt(index);

    if (char === '"') {
      const end = line.indexOf('"', index + 1);
      const close = end === -1 ? line.length : end + 1;
      const text = line.slice(index, close);
      const isKey = /^\s*:/.test(line.slice(close));
      tokens.push(...splitVariables(text, isKey ? "key" : "string"));
      index = close;
      continue;
    }

    const whitespace = /^\s+/.exec(rest);
    if (whitespace !== null) {
      tokens.push({ kind: "plain", text: whitespace[0] });
      index += whitespace[0].length;
      continue;
    }

    const url = /^https?:\/\/[^\s"']+/.exec(rest);
    if (url !== null) {
      tokens.push(...splitVariables(url[0], "plain"));
      index += url[0].length;
      continue;
    }

    const command = /^curl\b/.exec(rest);
    if (command !== null && line.slice(0, index).trim() === "") {
      tokens.push({ kind: "command", text: command[0] });
      index += command[0].length;
      continue;
    }

    const flag = /^-{1,2}[A-Za-z][\w-]*/.exec(rest);
    if (flag !== null && (index === 0 || /\s/.test(line.charAt(index - 1)))) {
      tokens.push({ kind: "flag", text: flag[0] });
      index += flag[0].length;
      continue;
    }

    const literal = /^(?:-?\d+(?:\.\d+)?|true|false|null)\b/.exec(rest);
    if (literal !== null && !/[\w$/.-]/.test(line.charAt(index - 1))) {
      tokens.push({ kind: "literal", text: literal[0] });
      index += literal[0].length;
      continue;
    }

    if ("{}[],:'\\".includes(char)) {
      tokens.push({ kind: "punct", text: char });
      index += 1;
      continue;
    }

    const word = /^[^\s"{}[\],:'\\]+/.exec(rest);
    const text = word?.[0] ?? char;
    tokens.push(...splitVariables(text, "plain"));
    index += text.length;
  }

  return tokens;
}
