import { ArrowDown, ArrowRight } from "lucide-react";
import type { ReactElement } from "react";

import { cn } from "@/shared/lib/class-names";

import { t, tp } from "./i18n";
import { PHRASE_CLASS, Phrases, SectionHeading, WithCode } from "./ui";

type Duty = { readonly term: string; readonly gloss: string; readonly proof?: string };

// Copy deck §7 and §5, merged: the two halves of docs/SPEC.md §1 in the
// spec's order. Each "mosoo runs" row carries the line a reviewer can check
// (SPEC §3 to §6, docs/prd/session-files.md), so the page lists the product's
// promises once.
function appDuties(): readonly Duty[] {
  return [
    { term: tp("Business logic"), gloss: t("What the task is for and what happens to the result") },
    { term: tp("End-user authentication"), gloss: t("mosoo never signs your users in") },
    { term: tp("Business queues"), gloss: t("When work starts and in what order") },
    { term: tp("Result validation"), gloss: t("You decide whether the report is right") },
    { term: tp("Business storage"), gloss: t("Keep the `thread.id` and whatever you extract") },
    { term: tp("UI"), gloss: t("The screens your users see") },
  ];
}

function mosooDuties(): readonly Duty[] {
  return [
    {
      term: tp("Agent execution"),
      gloss: t("The harness runs each turn: model calls, code, tools"),
      proof: t(
        "Inline configuration needs no saved Agent. A runtime and protocol that don’t match are rejected before anything runs.",
      ),
    },
    {
      term: tp("Sandboxing"),
      gloss: t("One sandbox per Session, never shared"),
      proof: t("Provider keys and MCP credentials stay outside it. Code inside can read Environment variables."),
    },
    {
      term: tp("Durable continuation"),
      gloss: t("Follow-ups restore the last checkpoint"),
      proof: t(
        "A reply 1 minute or 7 days later has the same semantics. If the checkpoint can’t be restored, the follow-up fails with an error.",
      ),
    },
    {
      term: tp("Input files and artifacts"),
      gloss: t("Attachments mount read-only. Files written under `outputs/` become artifacts."),
      proof: t("Other workspace files come back with the checkpoint but aren’t listed for download."),
    },
    {
      term: tp("Events"),
      gloss: t("Saved first, then streamed over SSE"),
      proof: t("Stable event IDs let a client reconnect without duplicates. There are no Webhooks."),
    },
    {
      term: tp("Usage measurement"),
      gloss: t("One record per model call"),
      proof: t("Measured tokens and cost estimates. They are not invoices."),
    },
    {
      term: tp("Runtime cleanup"),
      gloss: t("Idle sandboxes are reclaimed; the Session’s state stays"),
      proof: t(
        "A turn succeeds only once its events, usage, and a checkpoint are committed. Until then, the sandbox is not reclaimed.",
      ),
    },
  ];
}

function DutyList({
  heading,
  duties,
  note,
  className,
}: {
  heading: string;
  duties: readonly Duty[];
  note?: string;
  className?: string;
}): ReactElement {
  return (
    <div className={cn("p-5 md:p-7", className)}>
      <h3 className={cn(PHRASE_CLASS, "text-ink-900 text-[20px] font-semibold")}>
        <Phrases text={heading} />
      </h3>
      <dl className="mt-5">
        {duties.map((duty) => (
          // Phones run the term into its gloss on one line; wider screens give
          // the terms their own column.
          <div
            key={duty.term}
            className="border-border-strong border-t py-3 sm:grid sm:grid-cols-[minmax(0,0.6fr)_minmax(0,1.4fr)] sm:gap-5"
          >
            <dt className={cn(PHRASE_CLASS, "text-ink-900 text-[16px] font-semibold max-sm:mr-2 max-sm:inline")}>
              <Phrases text={duty.term} />
            </dt>
            <dd className="max-sm:inline">
              <p className="text-ink-900 text-[16px] leading-[1.55] max-sm:inline">
                <WithCode text={duty.gloss} />
              </p>
              {duty.proof === undefined ? null : (
                <p className="text-ink-500 mt-1.5 text-[15px] leading-[1.55] [text-wrap:pretty]">
                  <WithCode text={duty.proof} />
                </p>
              )}
            </dd>
          </div>
        ))}
      </dl>
      {note === undefined ? null : (
        <p className="border-border-strong text-ink-700 border-t pt-4 text-[15px] leading-[1.55]">
          <WithCode text={note} />
        </p>
      )}
    </div>
  );
}

/** Where the keys live: your app talks to mosoo; the sandbox only gets grants. */
function Boundary(): ReactElement {
  const zones = [
    { name: tp("Your app"), note: t("Calls the API from your backend") },
    { name: "mosoo", note: t("Holds provider keys and MCP credentials") },
    { name: tp("Session sandbox"), note: t("One per Session. Keys never enter it.") },
  ] as const;
  const links = [t("Project API key"), t("Expiring grants only")] as const;

  return (
    <ol className="mt-8 flex flex-col items-stretch gap-1 md:flex-row md:items-center md:gap-0">
      {zones.map((zone, index) => (
        <li key={zone.name} className="contents">
          <div
            className={cn(
              "rounded-[12px] border px-4 py-3 md:flex-1",
              index === 1 ? "border-green-600 bg-green-50" : "border-border-strong bg-paper-50",
              index === 2 ? "border-dashed" : undefined,
            )}
          >
            <p className={cn(PHRASE_CLASS, "text-ink-900 text-[16px] font-semibold")}>
              <Phrases text={zone.name} />
            </p>
            <p className="text-ink-700 mt-0.5 text-[15px] leading-[1.45]">{zone.note}</p>
          </div>
          {index < links.length ? (
            <div className="text-ink-500 flex items-center gap-2 px-3 py-0.5 text-[14px] font-semibold md:flex-col md:gap-1 md:px-3 md:py-1 md:text-center">
              <ArrowDown aria-hidden="true" className="size-4 shrink-0 md:hidden" />
              <span className="md:max-w-[9rem]">{links[index]}</span>
              <ArrowRight aria-hidden="true" className="hidden size-4 shrink-0 md:block" />
            </div>
          ) : null}
        </li>
      ))}
    </ol>
  );
}

export function SplitSection(): ReactElement {
  return (
    <section id="your-app-and-mosoo" aria-labelledby="split-title" className="px-4 py-16 md:px-6 md:py-20">
      <SectionHeading
        id="split-title"
        scale="statement"
        title={tp("Your app keeps its users. mosoo runs the Agent.")}
      />
      <Boundary />
      <div className="border-border-strong mt-8 grid overflow-hidden rounded-[14px] border lg:grid-cols-[minmax(0,0.75fr)_minmax(0,1.25fr)]">
        <DutyList
          heading={tp("Your app keeps")}
          duties={appDuties()}
          note={t(
            "mosoo doesn’t authenticate your end users. If your MCP servers need to know who asked, label the Thread with your own `userId`.",
          )}
          className="bg-paper-50"
        />
        <DutyList
          heading={tp("mosoo runs")}
          duties={mosooDuties()}
          className="border-border-strong border-t bg-green-50 lg:border-t-0 lg:border-l"
        />
      </div>
    </section>
  );
}
