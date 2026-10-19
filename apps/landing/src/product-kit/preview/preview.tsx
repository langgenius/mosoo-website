// Dev-only gallery: `npm run landing:dev`, then open
// /src/product-kit/preview/?c=all&locale=en. Query switches:
//   c        all | turn-receipt | session-continuation | preview-replay |
//            runtime-matrix | runtime-availability | key-boundary | api-call |
//            coding-agent-setup
//   locale   en | zh | ja          animate  1 to enable replays
//   at       freeze replays at this many ms (replayAt)
//   scale    CSS zoom on each island (the moments' `scale` prop)
//   w        stage width in px     probes   1 to append the leak report
// The page sits in the landing theme ([data-theme="landing"], warm paper) so
// the island is checked against the website's own tokens.

import "../../shared/styles/app.css";

import { StrictMode, useState } from "react";
import type { ReactElement, ReactNode } from "react";
import { createRoot } from "react-dom/client";

import {
  ApiCall,
  CodingAgentSetup,
  KeyBoundary,
  PreviewReplay,
  RuntimeAvailability,
  RuntimeMatrix,
  SessionContinuation,
  TurnReceipt,
} from "../index";
import type { KitLocale } from "../index";
import { Probes, readProbeReport } from "./probes";

const params = new URLSearchParams(globalThis.location.search);
const localeParam = params.get("locale");
const locale: KitLocale = localeParam === "zh" || localeParam === "ja" ? localeParam : "en";
const animate = params.get("animate") === "1";
const atParam = params.get("at");
const replayAt = atParam === null ? undefined : Number(atParam);
const width = Number(params.get("w") ?? "760");
const scaleParam = params.get("scale");
const scale = scaleParam === null ? undefined : Number(scaleParam);
const only = params.get("c") ?? "all";

document.documentElement.lang = locale === "zh" ? "zh-CN" : locale;

const MOMENTS: { id: string; render: () => ReactNode; title: string }[] = [
  {
    id: "turn-receipt",
    render: () => <TurnReceipt animate={animate} locale={locale} replayAt={replayAt} scale={scale} />,
    title: "TurnReceipt (PM-01)",
  },
  {
    id: "session-continuation",
    render: () => (
      <SessionContinuation animate={animate} locale={locale} replayAt={replayAt} scale={scale} showCancelledTurn />
    ),
    title: "SessionContinuation (PM-02)",
  },
  {
    id: "preview-replay",
    render: () => <PreviewReplay animate={animate} locale={locale} replayAt={replayAt} scale={scale} />,
    title: "PreviewReplay (PM-03)",
  },
  {
    id: "runtime-matrix",
    render: () => <RuntimeMatrix animate={animate} locale={locale} replayAt={replayAt} scale={scale} />,
    title: "RuntimeMatrix (PM-04)",
  },
  {
    id: "runtime-availability",
    render: () => <RuntimeAvailability animate={animate} locale={locale} replayAt={replayAt} scale={scale} />,
    title: "RuntimeAvailability (PM-05)",
  },
  {
    id: "key-boundary",
    render: () => <KeyBoundary animate={animate} locale={locale} replayAt={replayAt} scale={scale} />,
    title: "KeyBoundary (PM-08)",
  },
  {
    id: "api-call",
    render: () => <ApiCall animate={animate} locale={locale} replayAt={replayAt} scale={scale} />,
    title: "ApiCall (PM-11)",
  },
  {
    id: "coding-agent-setup",
    render: () => <CodingAgentSetup animate={animate} locale={locale} replayAt={replayAt} scale={scale} />,
    title: "CodingAgentSetup (PM-10)",
  },
];

function ProbeReport(): ReactElement {
  const [report, setReport] = useState<string>("");

  return (
    <div
      ref={(node) => {
        if (node !== null && report === "") {
          globalThis.requestAnimationFrame(() => {
            setReport(JSON.stringify(readProbeReport(node), null, 1));
          });
        }
      }}
    >
      <Probes />
      <pre id="probe-report" style={{ fontSize: 11, whiteSpace: "pre-wrap" }}>
        {report}
      </pre>
    </div>
  );
}

function Gallery(): ReactElement {
  const moments = MOMENTS.filter((moment) => only === "all" || moment.id === only);

  return (
    <div
      data-theme="landing"
      style={{ background: "var(--paper-100)", minHeight: "100dvh", padding: "24px 16px 64px" }}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 48, margin: "0 auto", maxWidth: width }}>
        {moments.map((moment) => (
          <section key={moment.id} id={moment.id}>
            {only === "all" ? (
              <p className="t-caption" style={{ marginBottom: 8 }}>
                {moment.title}
              </p>
            ) : null}
            {moment.render()}
          </section>
        ))}
        {params.get("probes") === "1" ? <ProbeReport /> : null}
      </div>
    </div>
  );
}

const root = document.getElementById("root");

if (root !== null) {
  createRoot(root).render(
    <StrictMode>
      <Gallery />
    </StrictMode>,
  );
}
