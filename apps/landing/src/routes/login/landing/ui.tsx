import { ArrowRight } from "lucide-react";
import { Fragment } from "react";
import type { ReactElement, ReactNode } from "react";

import { cn } from "@/shared/lib/class-names";

import { evidenceHeadingStyle, sectionHeadingStyle, statementHeadingStyle } from "./typography";

/** Uppercase overline with the single green accent dot. Used by the use-case
    pages; the home page uses no overlines (house copy rules). */
export function Eyebrow({
  children,
  tone = "light",
  className,
}: {
  children: ReactNode;
  tone?: "light" | "dark";
  className?: string;
}): ReactElement {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 text-[11px] font-semibold tracking-[0.12em] uppercase",
        tone === "dark" ? "text-paper-100/85" : "text-fg-2",
        className,
      )}
    >
      <span
        className={cn(
          "inline-block size-1.5 rounded-full",
          tone === "dark" ? "bg-green-400" : "bg-green-600",
        )}
      />
      {children}
    </span>
  );
}

const INLINE_CODE_CLASS =
  "bg-paper-200 text-ink-900 rounded-[4px] px-1 py-px font-mono text-[0.88em] [overflow-wrap:anywhere]";

/**
 * Chinese and Japanese headings, labels and buttons wrap only between
 * phrases. The dictionaries mark phrase edges with "|" (see phraseText in
 * the i18n modules); Phrases turns each mark into <wbr>, and app.css sets
 * word-break: keep-all on elements with PHRASE_CLASS, so a line never ends
 * inside a word such as 托管 or 竹の海. English strings carry no marks.
 */
export const PHRASE_CLASS = "cjk-phrase";
export const PHRASE_MARK = "|";

// Terms that read as one word and must not break across lines, in any locale.
const KEEP_TOGETHER = [
  "Agent runtime",
  "API ファースト",
  "open-source",
  "API-first",
  "OpenAI Codex",
  "Claude Agent SDK",
  "Mosoo Computer",
] as const;
// Chinese and Japanese set a space between Latin and CJK text. Two of those
// spaces must not become line breaks: between a Latin word and the Japanese
// particle after it ("Agent のタスク"), and between a number and its counter
// ("7 天后", "1 回").
const LATIN_WORD_WITH_PARTICLE = "[A-Za-z0-9][\\w./-]* (?:の|で|を|が|は|に|と|も|へ|や|ごと|から|まで)";
const NUMBER_WITH_COUNTER = "\\d+ [\\u3040-\\u30ff\\u3400-\\u9fff]";
const KEPT = [...KEEP_TOGETHER, LATIN_WORD_WITH_PARTICLE, NUMBER_WITH_COUNTER].join("|");
const KEEP_TOGETHER_PATTERN = new RegExp(`(${KEPT})`);
const IS_KEPT = new RegExp(`^(?:${KEPT})$`);
const UNTRANSLATED_TERMS: ReadonlySet<string> = new Set([
  "Agent runtime",
  "OpenAI Codex",
  "Claude Agent SDK",
  "Mosoo Computer",
]);

function KeepTogether({ text }: { text: string }): ReactElement {
  return (
    <>
      {text.split(KEEP_TOGETHER_PATTERN).map((part, index) =>
        IS_KEPT.test(part) ? (
          // Pieces of a static string: the index is a stable key.
          <span
            key={index}
            translate={UNTRANSLATED_TERMS.has(part) ? "no" : undefined}
            className="whitespace-nowrap"
          >
            {part}
          </span>
        ) : (
          part
        ),
      )}
    </>
  );
}

/** Renders a phrase-marked string: <wbr> at each mark, fixed terms unbroken. */
export function Phrases({ text }: { text: string }): ReactElement {
  const phrases = text.split(PHRASE_MARK);
  return (
    <>
      {phrases.map((phrase, index) => (
        // Phrases of a static string: the index is a stable key.
        <Fragment key={index}>
          {index > 0 ? <wbr /> : null}
          <KeepTogether text={phrase} />
        </Fragment>
      ))}
    </>
  );
}

/** Offers a line break after each "/" so API paths wrap at segment edges. */
export function BreakAfterSlashes({ text }: { text: string }): ReactElement {
  const segments = text.split("/");
  return (
    <>
      {segments.map((segment, index) => (
        // Segments of a static string: the index is a stable key.
        <Fragment key={index}>
          {segment}
          {index < segments.length - 1 ? (
            <>
              /<wbr />
            </>
          ) : null}
        </Fragment>
      ))}
    </>
  );
}

/**
 * Renders the `backtick` spans of a translated string as inline code, so
 * dictionaries can keep code tokens in one readable sentence.
 */
export function WithCode({ text }: { text: string }): ReactElement {
  const parts = text.split("`");
  return (
    <>
      {parts.map((part, index) =>
        index % 2 === 1 ? (
          // Fragments of a static string: the index is a stable key.
          <code key={index} translate="no" className={INLINE_CODE_CLASS}>
            <BreakAfterSlashes text={part} />
          </code>
        ) : (
          part
        ),
      )}
    </>
  );
}

/**
 * Wraps exact occurrences of the given code tokens in <code>. The text content
 * is unchanged, so strings shared with structured data (the FAQ) stay
 * identical while the page still styles API names as code.
 */
export function WithCodeTokens({
  text,
  tokens,
}: {
  text: string;
  tokens: readonly string[];
}): ReactElement {
  const escaped = tokens.map((token) => token.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
  const pattern = new RegExp(`(${escaped.join("|")})`);
  const parts = text.split(pattern);
  return (
    <>
      {parts.map((part, index) =>
        tokens.includes(part) ? (
          <code key={index} translate="no" className={INLINE_CODE_CLASS}>
            <BreakAfterSlashes text={part} />
          </code>
        ) : (
          part
        ),
      )}
    </>
  );
}

/**
 * A section's h2 and its optional intro. `title` may carry phrase marks
 * (pass the tp() form of the string); `intro` is plain running text.
 */
const HEADING_SCALE = {
  evidence: evidenceHeadingStyle,
  section: sectionHeadingStyle,
  statement: statementHeadingStyle,
} as const;

export function SectionHeading({
  id,
  title,
  intro,
  scale = "section",
  className,
}: {
  id: string;
  title: string;
  intro?: ReactNode;
  /** evidence: quiet sections; statement: the page's one loud heading. */
  scale?: keyof typeof HEADING_SCALE;
  className?: string;
}): ReactElement {
  return (
    <div className={className}>
      <h2
        id={id}
        className={cn(
          PHRASE_CLASS,
          "text-ink-900 [text-wrap:balance]",
          scale === "statement" ? "max-w-[1100px]" : "max-w-[900px]",
        )}
        style={HEADING_SCALE[scale]}
      >
        <Phrases text={title} />
      </h2>
      {intro === undefined ? null : (
        <p className="text-ink-700 mt-4 max-w-[760px] text-[17px] leading-[1.6] [text-wrap:pretty]">
          {intro}
        </p>
      )}
    </div>
  );
}

/** A quiet text link with a trailing arrow, for "read more" style actions. */
export function ArrowLink({
  href,
  children,
  className,
}: {
  href: string;
  children: ReactNode;
  className?: string;
}): ReactElement {
  return (
    <a
      href={href}
      className={cn(
        "group focus-visible:ring-ring inline-flex items-center gap-1.5 rounded-sm text-[15px] font-semibold text-green-700 underline decoration-green-700/35 underline-offset-4 transition-colors outline-none hover:text-green-800 hover:decoration-green-800 focus-visible:ring-2",
        className,
      )}
    >
      <span>{children}</span>
      <ArrowRight
        aria-hidden="true"
        className="size-4 shrink-0 transition-transform duration-150 ease-out group-hover:translate-x-0.5 motion-reduce:transition-none motion-reduce:group-hover:translate-x-0"
      />
    </a>
  );
}
