import { ArrowRight } from "lucide-react";
import { Fragment } from "react";
import type { ReactElement, ReactNode } from "react";

import { cn } from "@/shared/lib/class-names";

import { sectionHeadingStyle } from "./typography";

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

export function SectionHeading({
  id,
  title,
  intro,
  className,
}: {
  id: string;
  title: string;
  intro?: string;
  className?: string;
}): ReactElement {
  return (
    <div className={className}>
      <h2 id={id} className="text-ink-900 max-w-[860px] [text-wrap:balance]" style={sectionHeadingStyle}>
        {title}
      </h2>
      {intro === undefined ? null : (
        <p className="text-ink-500 mt-4 max-w-[640px] text-[17px] leading-[1.6] [text-wrap:pretty]">
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
