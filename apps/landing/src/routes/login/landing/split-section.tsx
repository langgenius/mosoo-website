import type { ReactElement } from "react";

import { cn } from "@/shared/lib/class-names";

import { t } from "./i18n";
import { SectionHeading, WithCode } from "./ui";

type Duty = { readonly term: string; readonly gloss: string };

// Copy deck §7: the two halves of docs/SPEC.md §1, in the spec's order, with
// one plain gloss each.
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

function DutyList({
  heading,
  duties,
  className,
}: {
  heading: string;
  duties: readonly Duty[];
  className?: string;
}): ReactElement {
  return (
    <div className={cn("p-6 md:p-8", className)}>
      <h3 className="text-ink-900 text-[19px] font-semibold">{heading}</h3>
      <dl className="mt-5">
        {duties.map((duty) => (
          <div
            key={duty.term}
            className="border-border-strong grid gap-1 border-t py-3.5 sm:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] sm:gap-5"
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

export function SplitSection(): ReactElement {
  return (
    <section id="your-app-and-mosoo" aria-labelledby="split-title" className="px-4 py-20 md:px-6 md:py-24">
      <SectionHeading
        id="split-title"
        title={t("Your app keeps its users. mosoo runs the Agent.")}
        intro={t("This split comes straight from the product spec.")}
      />
      <div className="border-border-strong mt-12 grid overflow-hidden rounded-[14px] border md:grid-cols-2">
        <DutyList heading={t("Your app keeps")} duties={appDuties()} className="bg-paper-50" />
        <DutyList
          heading={t("mosoo runs")}
          duties={mosooDuties()}
          className="border-border-strong border-t bg-green-50 md:border-t-0 md:border-l"
        />
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
