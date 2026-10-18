import type { ReactElement } from "react";

import { MOSOO_SPEC_URL } from "../links";
import { t } from "./i18n";
import { ArrowLink, SectionHeading, WithCode } from "./ui";

// Copy deck §5: six promises from docs/SPEC.md, each with one line a reviewer
// can check.
function features(): readonly { title: string; body: string; proof: string }[] {
  return [
    {
      title: t("Start a Session without creating an Agent"),
      body: t(
        "Put the harness, provider, model, and instructions in one request. mosoo starts a durable Session and creates no Agent.",
      ),
      proof: t(
        '`configuration.type: "inline"` on `POST /api/v2/projects/{projectId}/threads`. Saved presets are optional.',
      ),
    },
    {
      title: t("Choose the runtime per Session"),
      body: t(
        "Run OpenAI Codex, Claude Agent SDK, OpenCode, or Pi. Each Session freezes its runtime, model, and protocol, and nothing falls back silently.",
      ),
      proof: t("A runtime and model protocol that don’t match are rejected before anything runs."),
    },
    {
      title: t("Reply 1 minute or 7 days later"),
      body: t(
        "Follow-ups continue the same Session, even after the sandbox was reclaimed. The working directory, conversation, and files return from the last checkpoint.",
      ),
      proof: t(
        "If that checkpoint can’t be restored, the follow-up fails with an error. API Sessions have no inactivity deadline.",
      ),
    },
    {
      title: t("A turn succeeds only when its results are saved"),
      body: t(
        "Completion means the events, usage, and a checkpoint were committed together. A failed or cancelled turn never overwrites the last good state.",
      ),
      proof: t("From the product spec: “Model or tool execution ending is not success.”"),
    },
    {
      title: t("Keys stay outside the sandbox"),
      body: t(
        "Provider keys and MCP credentials never enter the sandbox. The runtime reaches models and tools through mosoo’s proxies, which add the credential per request.",
      ),
      proof: t(
        "The sandbox only gets expiring grants. Environment variables are different. Code in the sandbox can read them.",
      ),
    },
    {
      title: t("Attach files, stream events, download results"),
      body: t(
        "Attachments mount read-only. Anything the Agent writes under `outputs/` becomes a downloadable artifact. Watch progress over SSE or read the saved history.",
      ),
      proof: t(
        "Events are saved before they’re sent, and stable IDs let a client reconnect without duplicates. There are no Webhooks.",
      ),
    },
  ];
}

export function FeaturesSection(): ReactElement {
  return (
    <section id="features" aria-labelledby="features-title" className="px-4 py-20 md:px-6 md:py-24">
      <SectionHeading
        id="features-title"
        title={t("What mosoo runs for your backend")}
        intro={t("Each of these is a promise in the product spec. The spec is linked below.")}
      />

      {/* Ruled cells (1px gaps over the border colour) rather than floating
          cards, to match the page's hairline column. */}
      <ul className="border-border-strong bg-border-strong mt-12 grid gap-px overflow-hidden rounded-[14px] border sm:grid-cols-2 lg:grid-cols-3">
        {features().map((feature) => (
          <li key={feature.title} className="bg-paper-100 flex flex-col p-6 md:p-7">
            <h3 className="text-ink-900 text-[19px] leading-[1.3] font-semibold [text-wrap:balance]">
              {feature.title}
            </h3>
            <p className="text-ink-500 mt-3 text-[16px] leading-[1.6]">
              <WithCode text={feature.body} />
            </p>
            <div className="mt-auto pt-5">
              <p className="border-border-strong text-ink-700 border-t border-dashed pt-4 text-[16px] leading-[1.55]">
                <WithCode text={feature.proof} />
              </p>
            </div>
          </li>
        ))}
      </ul>

      <div className="mt-8">
        <ArrowLink href={MOSOO_SPEC_URL}>{t("Read the product spec")}</ArrowLink>
      </div>
    </section>
  );
}
