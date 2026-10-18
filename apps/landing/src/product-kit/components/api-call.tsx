// PM-11, calling mosoo from a backend: the two calls that start the CSV story,
// as scripts/public-api-session-workflow.ts makes them. Upload input.csv as a
// Project file, then start the Session with that file attached, the turn 1
// prompt and the script's inline configuration (fields from
// apps/api/openapi/public-api-v2.generated.json; variables as in the docs
// quickstart, copy deck D15). Each call shows an Example excerpt of its 201
// response with the story's IDs, so the file ID and the thread ID are the
// ones every other moment shows. The panels borrow the console CommandBlock's
// sunken mono surface and the install bar's outline Copy button
// (routes/project-overview/project-overview-install.tsx).
// Code is set at --kit-code-size (default 1rem): match it to the page's body
// size so code never reads smaller than prose. Lines wrap only at spaces and
// after the "/" of a URL, with a hanging indent two characters past the
// line's own; strings of up to 24 characters never break, and a longer token
// that cannot fit (an ID on a phone) scrolls inside the block instead of
// breaking. Copy copies the exact text.
// Replay: the upload is sent and answered, then the create call.

import { Fragment, useRef, useState } from "react";
import type { CSSProperties, ReactElement, ReactNode } from "react";

import { API_CALLS } from "../data/example-universe";
import type { ExampleApiCall } from "../data/example-universe";
import type { KitLocale } from "../i18n";
import { kitText, momentLabel, withSubject } from "../i18n";
import { copyText } from "../lib/clipboard";
import { highlightLine, TOKEN_CLASS } from "../lib/highlight";
import type { Token } from "../lib/highlight";
import { reached, useReplay } from "../lib/replay";
import { Loader2 } from "./icons";
import { ConsoleIsland, ExampleValues, ReplayControl, cx, useAnnounce } from "./island";
import type { MomentProps } from "./island";
import { Badge, Button, CopyCheckIcon } from "./primitives";

export interface ApiCallProps extends MomentProps {
  /** Show the input.csv upload before the create call (default true). */
  upload?: boolean | undefined;
}

const REPLAY_MS = 3600;
// Milliseconds into the replay: the upload's answer, the create call going
// out, and its answer. Without the upload, the create call starts at 0.
const AT = { createResponse: 2500, createSent: 1300, uploadResponse: 900 } as const;
const CREATE_ONLY_RESPONSE = 1500;
const UNBROKEN_STRING_MAX = 24;

// A wrap opportunity after each "/" of a URL, so it breaks between path
// segments; <wbr> adds no characters to the selection.
function withPathBreaks(text: string): ReactNode {
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

function TokenSpan({ token }: { token: Token }): ReactElement {
  const isUrl = token.kind === "plain" && /^https?:\/\//.test(token.text);
  const keepWhole =
    (token.kind === "string" || token.kind === "key") && token.text.length <= UNBROKEN_STRING_MAX;

  return (
    <span className={cx(TOKEN_CLASS[token.kind], keepWhole ? "whitespace-nowrap" : null)}>
      {isUrl ? withPathBreaks(token.text) : token.text}
    </span>
  );
}

function Tokens({ tokens }: { tokens: readonly Token[] }): ReactElement {
  return (
    <>
      {tokens.map((token, index) => (
        <TokenSpan key={index} token={token} />
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

function Code({ codeRef, text }: { codeRef?: (node: HTMLElement | null) => void; text: string }): ReactElement {
  return (
    <pre className="text-fg-1 overflow-x-auto px-4 py-3 font-mono text-[length:var(--kit-code-size,1rem)] leading-[1.6]">
      <code ref={codeRef}>
        {text.split("\n").map((line, index) => (
          <span key={index} className="block min-h-[1.6em] whitespace-pre-wrap" style={hangingIndent(line)}>
            <Line line={line} />
          </span>
        ))}
      </code>
    </pre>
  );
}

function CallPanel({
  arriving,
  call,
  label,
  locale,
  responded,
}: {
  arriving: boolean;
  call: ExampleApiCall;
  label: string;
  locale: KitLocale;
  responded: boolean;
}): ReactElement {
  const [copied, setCopied] = useState(false);
  const announce = useAnnounce();
  const code = useRef<HTMLElement | null>(null);

  async function copy(): Promise<void> {
    if (await copyText(call.request)) {
      setCopied(true);
      announce(kitText(locale, "requestCopied"));
      globalThis.setTimeout(() => {
        setCopied(false);
      }, 1500);
      return;
    }

    // No clipboard: select the request so the visitor can copy it.
    if (code.current !== null) {
      globalThis.getSelection()?.selectAllChildren(code.current);
    }
  }

  return (
    <div className="border-border bg-sunken overflow-hidden rounded-lg border">
      <div className="border-border-soft flex min-h-11 items-center justify-between gap-3 border-b py-1.5 pr-1.5 pl-4">
        <span className="text-fg-2 text-[12.5px] font-medium">{label}</span>
        <Button
          aria-label={withSubject(locale, kitText(locale, "copyRequest"), label)}
          onClick={() => {
            void copy();
          }}
          size="sm"
          variant="outline"
        >
          <CopyCheckIcon copied={copied} />
          {kitText(locale, "copyRequest")}
        </Button>
      </div>
      <Code
        codeRef={(node) => {
          code.current = node;
        }}
        text={call.request}
      />
      <div className="border-border-soft flex min-h-10 flex-wrap items-center gap-2 border-t px-4 py-1.5">
        <span className="text-fg-2 text-[12.5px] font-medium">{kitText(locale, "response")}</span>
        {responded ? (
          <Badge className={arriving ? "environment-row-enter" : undefined} variant="success">
            {call.status}
          </Badge>
        ) : (
          <Loader2 aria-hidden className="text-brand-mark size-3.5 animate-spin" />
        )}
        <ExampleValues className="ml-auto" locale={locale} />
      </div>
      <div className={cx(responded ? null : "invisible", arriving ? "environment-row-enter" : null)}>
        <Code text={call.response} />
      </div>
    </div>
  );
}

export function ApiCallView({
  elapsed,
  locale,
  upload,
}: {
  elapsed: number | null;
  locale: KitLocale;
  upload: boolean;
}): ReactElement {
  const createSent = upload ? AT.createSent : 0;
  const createResponse = upload ? AT.createResponse : CREATE_ONLY_RESPONSE;
  const arriving = (at: number): boolean => elapsed !== null && reached(elapsed, at);

  return (
    <div className="flex flex-col gap-3">
      {upload ? (
        <CallPanel
          arriving={arriving(AT.uploadResponse)}
          call={API_CALLS.upload}
          label={kitText(locale, "uploadInputCsv")}
          locale={locale}
          responded={reached(elapsed, AT.uploadResponse)}
        />
      ) : null}
      {/* The create call goes out once the upload is answered. */}
      <div className={cx(reached(elapsed, createSent) ? null : "invisible", arriving(createSent) && createSent > 0 ? "environment-row-enter" : null)}>
        <CallPanel
          arriving={arriving(createResponse)}
          call={API_CALLS.create}
          label={kitText(locale, "startSession")}
          locale={locale}
          responded={reached(elapsed, createResponse)}
        />
      </div>
    </div>
  );
}

export function ApiCall({
  animate = false,
  exclusive,
  locale,
  replayAt,
  scale,
  upload = true,
}: ApiCallProps): ReactElement {
  const replay = useReplay({ animate, durationMs: REPLAY_MS, exclusive, replayAt });
  const name = kitText(locale, "startSession");

  return (
    <ConsoleIsland label={momentLabel(locale, name)} locale={locale} replaying={replay.elapsed !== null} rootRef={replay.ref} scale={scale}>
      <ApiCallView elapsed={replay.elapsed} locale={locale} upload={upload} />
      <ReplayControl canReplay={replay.canReplay} locale={locale} moment={name} onReplay={replay.replay} />
    </ConsoleIsland>
  );
}
