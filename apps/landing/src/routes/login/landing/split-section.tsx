import type { ReactElement } from "react";

import { KeyBoundary } from "@/product-kit/components/key-boundary";
import { locale } from "@/shared/locale";

import { t } from "./i18n";
import { WithCode } from "./ui";

type Duty = { readonly term: string; readonly gloss: string };

// Copy deck §7: the two halves of docs/SPEC.md §1, in the spec's order, with
// one plain gloss each. Under them, the system drawing (#129): the product
// kit's credential boundary (SPEC §5, architecture §4), so "mosoo runs the
// Agent" is shown as the parts that run it and where the keys stay.
function appDuties(): readonly Duty[] {
  return [
    { term: t("Business logic"), gloss: t("What the task is for and what happens to the result") },
    { term: t("End-user authentication"), gloss: t("mosoo never signs your users in") },
    { term: t("Business queues"), gloss: t("When work starts and in what order") },
    { term: t("Result validation"), gloss: t("You decide whether the report is right") },
    { term: t("Business storage"), gloss: t("Keep the `thread.id` and whatever you extract") },
    { term: t("UI"), gloss: t("Your product, your screens") },
  ];
}

function mosooDuties(): readonly Duty[] {
  return [
    { term: t("Agent execution"), gloss: t("The harness runs each turn: model calls, code, tools") },
    { term: t("Sandboxing"), gloss: t("One sandbox per Session, never shared") },
    { term: t("Durable continuation"), gloss: t("Follow-ups restore the last checkpoint") },
    { term: t("Input files and artifacts"), gloss: t("Attachments in, `outputs/` out") },
    { term: t("Events"), gloss: t("Saved first, then streamed over SSE") },
    { term: t("Usage measurement"), gloss: t("One record per model call") },
    { term: t("Runtime cleanup"), gloss: t("Idle sandboxes are reclaimed; the Session’s state stays") },
  ];
}

function DutyList({ heading, duties, tone }: { heading: string; duties: readonly Duty[]; tone: "app" | "mosoo" }): ReactElement {
  return (
    <div>
      <h3 className={tone === "app" ? "v2a-h3" : "v2a-h3"}>{heading}</h3>
      <dl className="mt-5">
        {duties.map((duty) => (
          <div
            key={duty.term}
            className="grid gap-1 border-t border-[rgba(109,120,106,0.35)] py-3 sm:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] sm:gap-5"
          >
            <dt className="text-ink-900 text-[16px] font-semibold">{duty.term}</dt>
            <dd className="text-ink-500 text-[16px] leading-[1.55]">
              <WithCode text={duty.gloss} />
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

/**
 * The way in (#129): your backend calls the mosoo API over HTTPS with a
 * Project API key, and every Session runs in its own sandbox. The kit's
 * credential boundary below shows what happens inside.
 */
function SystemPath(): ReactElement {
  return (
    <ol className="v2a-path" aria-label={t("From your backend to a Session sandbox")}>
      <li className="v2a-path-node">{t("Your backend")}</li>
      <li className="v2a-path-edge">
        <span>{t("HTTPS and a Project API key")}</span>
      </li>
      <li className="v2a-path-node" translate="no">
        mosoo API
      </li>
      <li className="v2a-path-edge">
        <span>{t("One sandbox per Session, never shared")}</span>
      </li>
      <li className="v2a-path-node" translate="no">
        Session sandbox
      </li>
    </ol>
  );
}

export function SplitSection(): ReactElement {
  return (
    <section id="your-app-and-mosoo" aria-labelledby="split-title" className="v2a-section">
      <span aria-hidden="true" className="v2a-node" style={{ top: 110 }} />
      <h2 id="split-title" className="v2a-display v2a-h2">
        {t("Your app keeps its users. mosoo runs the Agent.")}
      </h2>

      <div className="mt-12 grid gap-12 md:grid-cols-2 md:gap-14">
        <DutyList heading={t("Your app keeps")} duties={appDuties()} tone="app" />
        <DutyList heading={t("mosoo runs")} duties={mosooDuties()} tone="mosoo" />
      </div>

      <div className="mt-16">
        <SystemPath />
        <div className="mt-6 rounded-[16px] bg-[rgba(251,251,249,0.94)] p-3 shadow-[0_0_0_1px_rgba(11,26,20,0.1),0_18px_40px_-18px_rgba(11,26,20,0.25)] sm:p-5">
          <KeyBoundary locale={locale} />
        </div>
      </div>

      <p className="text-ink-500 mt-6 max-w-[760px] text-[16px] leading-[1.6]">
        <WithCode
          text={t(
            "mosoo doesn’t authenticate your end users. If your MCP servers need to know who asked, label the Thread with your own `userId`.",
          )}
        />
      </p>
    </section>
  );
}
