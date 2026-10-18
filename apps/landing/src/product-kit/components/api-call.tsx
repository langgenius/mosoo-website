// PM-11, calling mosoo from a backend: the create call from the content-truth
// brief (section 4; fields from apps/api/openapi/public-api-v2.generated.json)
// and an excerpt of its 201 CreateThreadResponse with Example IDs. The panels
// borrow the console CommandBlock's sunken mono surface and the install bar's
// outline Copy button (routes/project-overview/project-overview-install.tsx).
// Code is set at --kit-code-size (default 1rem): match it to the page's body
// size so code never reads smaller than prose. Lines stay within 80 columns;
// on a narrow screen the block scrolls sideways instead of rewrapping the
// command.
// Replay: the request is sent, then the response arrives.

import { Fragment, useState } from "react";
import type { CSSProperties, ReactElement, ReactNode } from "react";

import { API_CALL } from "../data/example-universe";
import type { KitLocale } from "../i18n";
import { consoleText, kitText } from "../i18n";
import { copyText } from "../lib/clipboard";
import { highlightLine, TOKEN_CLASS } from "../lib/highlight";
import type { Token } from "../lib/highlight";
import { reached, useReplay } from "../lib/replay";
import { Loader2 } from "./icons";
import { ConsoleIsland, KitFooter, cx } from "./island";
import { Badge, Button, CopyCheckIcon } from "./primitives";

export interface ApiCallProps {
  locale: KitLocale;
  /** Send the request once when first half visible (never with reduced motion). */
  animate?: boolean | undefined;
  /** Render the replay frozen at this many milliseconds (stills, docs, tests). */
  replayAt?: number | undefined;
}

const REPLAY_MS = 3200;
const AT = { response: 1500 } as const;

// A wrap opportunity after each "/" so a URL breaks between path segments,
// not mid-word; <wbr> adds no characters to the selection.
function withPathBreaks(text: string): ReactNode {
  if (!text.includes("/")) {
    return text;
  }

  return text.split("/").map((part, index, parts) => (
    <Fragment key={index}>
      {part}
      {index < parts.length - 1 ? (
        <>
          /<wbr />
        </>
      ) : null}
    </Fragment>
  ));
}

function Tokens({ tokens }: { tokens: readonly Token[] }): ReactElement {
  return (
    <>
      {tokens.map((token, index) => (
        <span key={index} className={TOKEN_CLASS[token.kind]}>
          {withPathBreaks(token.text)}
        </span>
      ))}
    </>
  );
}

// A trailing shell continuation (a space and a backslash) stays with its last word.
function Line({ line }: { line: string }): ReactElement {
  const tokens = highlightLine(line);
  const cut = line.search(/\S+ \\$/);

  if (cut <= 0) {
    return <Tokens tokens={tokens} />;
  }

  const head: Token[] = [];
  const tail: Token[] = [];
  let offset = 0;

  for (const token of tokens) {
    const end = offset + token.text.length;
    if (end <= cut) {
      head.push(token);
    } else if (offset >= cut) {
      tail.push(token);
    } else {
      head.push({ kind: token.kind, text: token.text.slice(0, cut - offset) });
      tail.push({ kind: token.kind, text: token.text.slice(cut - offset) });
    }
    offset = end;
  }

  return (
    <>
      <Tokens tokens={head} />
      <span className="whitespace-nowrap">
        <Tokens tokens={tail} />
      </span>
    </>
  );
}

function hangingIndent(line: string): CSSProperties {
  const indent = (/^ */.exec(line)?.[0].length ?? 0) + 2;
  return { paddingLeft: `${indent}ch`, textIndent: `-${indent}ch` };
}

function Code({ text }: { text: string }): ReactElement {
  return (
    <pre className="text-fg-1 px-4 py-3 font-mono text-[length:var(--kit-code-size,1rem)] leading-[1.6]">
      <code>
        {text.split("\n").map((line, index) => (
          // Lines wrap where the column is narrow, with a hanging indent two
          // characters past the line's own, so the command stays readable
          // without sideways scrolling; Copy copies the exact text.
          <span
            key={index}
            className="block min-h-[1.6em] whitespace-pre-wrap [overflow-wrap:anywhere]"
            style={hangingIndent(line)}
          >
            <Line line={line} />
          </span>
        ))}
      </code>
    </pre>
  );
}

export function ApiCallView({
  elapsed,
  locale,
}: {
  elapsed: number | null;
  locale: KitLocale;
}): ReactElement {
  const [copied, setCopied] = useState(false);
  const responded = reached(elapsed, AT.response);

  async function copy(): Promise<void> {
    if (await copyText(API_CALL.curl)) {
      setCopied(true);
      globalThis.setTimeout(() => {
        setCopied(false);
      }, 1500);
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="border-border bg-sunken overflow-hidden rounded-lg border">
        <div className="border-border-soft flex min-h-11 items-center justify-between gap-3 border-b py-1.5 pr-1.5 pl-4">
          <span className="text-fg-2 text-[12.5px] font-medium">{kitText(locale, "request")}</span>
          <Button
            aria-label={copied ? consoleText(locale, "common.copied") : kitText(locale, "copyRequest")}
            onClick={() => {
              void copy();
            }}
            size="sm"
            variant="outline"
          >
            <CopyCheckIcon copied={copied} />
            {copied ? consoleText(locale, "common.copied") : consoleText(locale, "common.copy")}
          </Button>
        </div>
        <Code text={API_CALL.curl} />
      </div>

      <div className="border-border bg-sunken overflow-hidden rounded-lg border">
        <div className="border-border-soft flex min-h-11 items-center gap-2 border-b px-4 py-1.5">
          <span className="text-fg-2 text-[12.5px] font-medium">{kitText(locale, "response")}</span>
          {responded ? (
            <Badge className={elapsed === null ? undefined : "environment-row-enter"} variant="success">
              {API_CALL.status}
            </Badge>
          ) : (
            <Loader2 aria-hidden className="text-brand-mark size-3.5 animate-spin" />
          )}
          <span className="text-fg-3 ml-auto text-[12px]">{kitText(locale, "example")}</span>
        </div>
        <div className={cx(responded ? null : "invisible", elapsed !== null && responded ? "environment-row-enter" : null)}>
          <Code text={API_CALL.response} />
        </div>
      </div>
    </div>
  );
}

export function ApiCall({ animate = false, locale, replayAt }: ApiCallProps): ReactElement {
  const replay = useReplay({ animate, durationMs: REPLAY_MS, replayAt });

  return (
    <ConsoleIsland locale={locale} rootRef={replay.ref}>
      <ApiCallView elapsed={replay.elapsed} locale={locale} />
      {replay.canReplay ? (
        <KitFooter canReplay locale={locale} note="" onReplay={replay.replay} />
      ) : null}
    </ConsoleIsland>
  );
}
