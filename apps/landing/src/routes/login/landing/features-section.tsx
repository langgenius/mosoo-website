import type { ReactElement } from "react";

import { MOSOO_SPEC_URL } from "../links";
import { t } from "./i18n";
import { ArrowLink, WithCode, Phrases, SpecCite } from "./ui";

// Copy deck §5 as editorial rows, each with one semantic line drawing (#126).
// Two of the deck's six promises live elsewhere on this page, so they are not
// repeated here: replying 7 days later is the hero's product stage, and keys
// outside the sandbox is the drawing under "Your app keeps its users".

function DrawRequest(): ReactElement {
  // One request in, one Session (a culm) out; no Agent in between.
  return (
    <svg viewBox="0 0 132 88" className="v2a-drawing" aria-hidden="true">
      <rect x="6" y="30" width="44" height="28" rx="4" />
      <text x="13" y="48">POST</text>
      <path d="M54 44h34" />
      <path d="M84 40l5 4-5 4" />
      <path className="v2a-drawing-fill" d="M98 8h16c-.5 6-.8 12-.8 18s.3 12 .8 18H98c.5-6 .8-12 .8-18s-.3-12-.8-18Z" />
      <rect className="v2a-drawing-lime" x="98" y="47" width="16" height="3.5" rx=".75" />
      <path className="v2a-drawing-fill" d="M98 54h16c-.3 4-.5 8-.5 13s.2 9 .5 13H98c.3-4 .5-8 .5-13s-.2-9-.5-13Z" />
    </svg>
  );
}

function DrawRuntimes(): ReactElement {
  // Four runtimes; one is chosen and frozen for the Session.
  return (
    <svg viewBox="0 0 132 88" className="v2a-drawing" aria-hidden="true">
      {[10, 40, 70, 100].map((x, index) => (
        <g key={x}>
          <path
            className={index === 2 ? "v2a-drawing-fill v2a-drawing-ink" : undefined}
            d={`M${x} 18h20c-.6 7-.9 14-.9 21s.3 14 .9 21H${x}c.6-7 .9-14 .9-21s-.3-14-.9-21Z`}
          />
          {index === 2 ? <rect className="v2a-drawing-lime" x={x} y="64" width="20" height="4" rx=".75" /> : null}
        </g>
      ))}
      <path d="M80 76v6" className="v2a-drawing-ink" />
    </svg>
  );
}

function DrawCommit(): ReactElement {
  // Events, usage and a checkpoint meet in one node: only then is the turn done.
  return (
    <svg viewBox="0 0 132 88" className="v2a-drawing" aria-hidden="true">
      <text x="2" y="20">events</text>
      <text x="2" y="48">usage</text>
      <text x="2" y="76">checkpoint</text>
      <path d="M50 16c30 0 38 24 58 26" />
      <path d="M44 44h64" />
      <path d="M74 72c18 0 22-24 34-26" />
      <rect className="v2a-drawing-lime" x="108" y="40" width="20" height="5" rx="1" />
    </svg>
  );
}

function DrawFiles(): ReactElement {
  // input.csv mounts read-only; what lands in outputs/ comes back out.
  return (
    <svg viewBox="0 0 132 88" className="v2a-drawing" aria-hidden="true">
      <rect x="38" y="14" width="56" height="60" rx="6" strokeDasharray="4 3" />
      <text x="2" y="10">input.csv</text>
      <path d="M14 16v28h30" />
      <path d="M40 40l4 4-4 4" />
      <path d="M94 44h22v26" />
      <path d="M112 66l4 4 4-4" />
      <text x="80" y="86">outputs/</text>
    </svg>
  );
}

function features(): readonly {
  title: string;
  body: string;
  proof: string;
  drawing: () => ReactElement;
}[] {
  return [
    {
      title: t("Start a Session without creating an Agent"),
      body: t(
        "Put the harness, provider, model, and instructions in one request. mosoo starts a durable Session and creates no Agent.",
      ),
      proof: t(
        '`configuration.type: "inline"` on `POST /api/v2/projects/{projectId}/threads`. Saved presets are optional.',
      ),
      drawing: DrawRequest,
    },
    {
      title: t("Choose the runtime per Session"),
      body: t(
        "Run OpenAI Codex, Claude Agent SDK, OpenCode, or Pi. Each Session freezes its runtime, model, and protocol, and nothing falls back silently.",
      ),
      proof: t("A runtime and model protocol that don’t match are rejected before anything runs."),
      drawing: DrawRuntimes,
    },
    {
      title: t("A turn succeeds only when its results are saved"),
      body: t(
        "Completion means the events, usage, and a checkpoint were committed together. A failed or cancelled turn never overwrites the last good state.",
      ),
      proof: t("From the product spec: “Model or tool execution ending is not success.”"),
      drawing: DrawCommit,
    },
    {
      title: t("Attach files, stream events, download results"),
      body: t(
        "Attachments mount read-only. Anything the Agent writes under `outputs/` becomes a downloadable artifact. Watch progress over SSE or read the saved history.",
      ),
      proof: t(
        "Events are saved before they’re sent, and stable IDs let a client reconnect without duplicates. There are no Webhooks.",
      ),
      drawing: DrawFiles,
    },
  ];
}

export function FeaturesSection(): ReactElement {
  return (
    <section id="features" aria-labelledby="features-title" className="v2a-section">
      <span aria-hidden="true" className="v2a-node" style={{ top: 110 }} />
      <h2 id="features-title" className="v2a-display v2a-h2">
        <Phrases text={t("mosoo handles execution, files, events, and usage.")} />
      </h2>
      <SpecCite section="s5" />

      <ol className="mt-12">
        {features().map((feature) => {
          const Drawing = feature.drawing;
          return (
            <li
              key={feature.title}
              className="grid gap-5 border-t border-[rgba(109,120,106,0.35)] py-9 md:grid-cols-[132px_minmax(0,1fr)] md:gap-10 lg:grid-cols-[132px_minmax(0,1.15fr)_minmax(0,0.85fr)]"
            >
              <div className="w-[132px]">
                <Drawing />
              </div>
              <div>
                <h3 className="v2a-h3">{feature.title}</h3>
                <p className="text-ink-700 mt-3 max-w-[560px] text-[17px] leading-[1.6]">
                  <WithCode text={feature.body} />
                </p>
              </div>
              <p className="text-ink-500 border-l border-[rgba(109,120,106,0.45)] pl-4 text-[16px] leading-[1.6] md:col-start-2 lg:col-start-auto lg:mt-1">
                <WithCode text={feature.proof} />
              </p>
            </li>
          );
        })}
      </ol>

      <div className="mt-2 border-t border-[rgba(109,120,106,0.35)] pt-8">
        <ArrowLink href={MOSOO_SPEC_URL}>{t("Read the product spec")}</ArrowLink>
      </div>
    </section>
  );
}
