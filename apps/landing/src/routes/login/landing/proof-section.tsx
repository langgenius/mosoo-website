import type { ReactElement, ReactNode } from "react";

import { cn } from "@/shared/lib/class-names";

import {
  MOSOO_GITHUB_URL,
  MOSOO_INCIDENTS_URL,
  MOSOO_RELEASES_URL,
  MOSOO_SPEC_URL,
  pathToUseCases,
  statusPath,
} from "../links";
import { t, tp } from "./i18n";
import { ArrowLink, PHRASE_CLASS, Phrases, SectionHeading } from "./ui";

// Copy deck §8: only what a visitor can check. No logos, star counts or
// success rates. Release facts were checked against GitHub Releases on
// 2026-10-19 (v0.7.0 published 2026-10-09; every release is a prerelease).
// This is the page's one sourcing line; other sections talk to the reader.
type Checkable = {
  readonly id: "source" | "releases" | "status" | "postmortems";
  readonly label: string;
  readonly copy: string;
  readonly links: readonly { readonly href: string; readonly label: string }[];
};

function checkables(): readonly Checkable[] {
  return [
    {
      id: "source",
      label: tp("Source"),
      copy: t(
        "The runtime, console, and API are Apache 2.0 on GitHub. The stack: Cloudflare Workers, Durable Objects, D1, R2, and Containers.",
      ),
      links: [{ href: MOSOO_GITHUB_URL, label: t("View source") }],
    },
    {
      // The release list below carries the facts; no paragraph repeats them.
      id: "releases",
      label: tp("Releases"),
      copy: "",
      links: [{ href: MOSOO_RELEASES_URL, label: t("View all releases") }],
    },
    {
      id: "status",
      label: tp("Production status"),
      copy: t(
        "mosoo.ai/health is built from production Worker outcomes and real Run completions. A runtime without production samples shows Unknown.",
      ),
      links: [{ href: statusPath(), label: t("Open the status page") }],
    },
    {
      id: "postmortems",
      label: tp("Postmortems"),
      copy: t(
        "6 incident postmortems from July to September 2026 are in the repo. Newer incidents are tracked as GitHub issues.",
      ),
      links: [{ href: MOSOO_INCIDENTS_URL, label: t("Read the postmortems") }],
    },
  ];
}

// The last releases that changed what this page says (copy deck §8), newest
// first; the rest are one click away on GitHub.
function releases(): readonly { version: string; date: string; change: string }[] {
  return [
    {
      version: "v0.7.0",
      date: "2026-10-09",
      change: t("Smaller codebase. The public Thread API v1 and v2 did not change."),
    },
    { version: "v0.5.0", date: "2026-10-08", change: t("Pi joins as the fourth runtime.") },
    {
      version: "v0.4.0",
      date: "2026-09-30",
      change: t("Sessions start straight from a Project, with no Agent required."),
    },
  ];
}

function ReleaseList(): ReactElement {
  return (
    <ol aria-label={t("Releases")} className="border-border-strong border-l pl-4">
      {releases().map((release, index) => (
        <li key={release.version} className="py-1.5">
          <p className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <span translate="no" className="text-ink-900 font-mono text-[14px] font-semibold">
              {release.version}
            </span>
            <time dateTime={release.date} className="text-ink-500 font-mono text-[14px]">
              {release.date}
            </time>
            {index === 0 ? (
              <span className="border-ink-900 text-ink-900 rounded-full border px-2 text-[14px] font-semibold">
                {t("Latest")}
              </span>
            ) : null}
          </p>
          <p className="text-ink-700 mt-0.5 text-[15px] leading-[1.5]">{release.change}</p>
        </li>
      ))}
    </ol>
  );
}

// The Codex Pet result, drawn from the demo's own contract
// (Yevanchen/mosoo-codex-pet skill/hatch-pet-mosoo/references/animation-rows.md):
// one atlas of 8 columns by 9 rows, one row per animation state, with the
// frames each row uses. Cells after a row's last frame stay empty.
const ATLAS_ROWS = [
  ["idle", 6],
  ["running-right", 8],
  ["running-left", 8],
  ["waving", 4],
  ["jumping", 5],
  ["failed", 8],
  ["waiting", 6],
  ["running", 6],
  ["review", 6],
] as const;

function CodexPetAtlas(): ReactElement {
  return (
    <div
      role="img"
      aria-label={t(
        "What codex-pet.zip holds: a spritesheet of 8 columns and 9 rows, one row per animation state (idle, running-right, running-left, waving, jumping, failed, waiting, running, and review), plus a manifest and QA files.",
      )}
      className="border-border-strong bg-paper-100 flex aspect-[16/10] flex-col justify-center gap-2.5 border-b px-4 py-3"
    >
      <p aria-hidden="true" className="flex flex-wrap items-baseline justify-between gap-x-3">
        <span translate="no" className="text-ink-900 font-mono text-[14px] font-semibold">
          codex-pet.zip
        </span>
        <span className="text-ink-500 text-[13px]">{t("spritesheet, 8 columns × 9 rows")}</span>
      </p>
      <div aria-hidden="true" className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-x-3 gap-y-[3px]">
        {ATLAS_ROWS.map(([state, frames]) => (
          <div key={state} className="contents">
            <span translate="no" className="text-ink-500 font-mono text-[12px] leading-none">
              {state}
            </span>
            <span className="grid grid-cols-8 gap-[3px]">
              {Array.from({ length: 8 }, (_, cell) => (
                <span
                  // Cells of a fixed grid: the index is a stable key.
                  key={cell}
                  className={cn(
                    "h-[9px] rounded-[2px]",
                    cell < frames ? "bg-ink-700" : "border-border-strong border border-dashed",
                  )}
                />
              ))}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

type UseCaseCard = {
  readonly name: string;
  readonly byline: string;
  readonly body: string;
  readonly visual: ReactNode;
  readonly links: readonly { readonly href: string; readonly label: string }[];
};

function useCaseCards(): readonly UseCaseCard[] {
  return [
    {
      name: "Codex Pet",
      byline: t("Built by the mosoo team."),
      body: t(
        "An uploaded avatar comes back as a validated ZIP with all 9 Codex pet animation states. The backend calls mosoo through the Thread API, and the token never reaches the browser.",
      ),
      visual: <CodexPetAtlas />,
      links: [{ href: pathToUseCases("codex-pet"), label: t("Read the Codex Pet use case") }],
    },
    {
      name: "ghfind",
      byline: t("Built by AsperforMias."),
      body: t(
        "For each public GitHub repository, ghfind’s Go worker starts a Thread and turns the 3 artifacts the Agent saves (analysis JSON, evidence JSON, and a Markdown report) into its own result page.",
      ),
      visual: (
        <img
          src="/landing/use-cases/ghfind-app.png"
          width={1174}
          height={857}
          alt={t("The ghfind Projects page, where a mosoo Agent evaluates public GitHub repositories.")}
          loading="lazy"
          decoding="async"
          className="border-border-strong aspect-[16/10] w-full border-b object-cover object-top"
        />
      ),
      links: [
        { href: pathToUseCases("ghfind"), label: t("Read the ghfind use case") },
        { href: "https://ghfind.com", label: t("Open ghfind") },
      ],
    },
  ];
}

export function ProofSection(): ReactElement {
  return (
    <section id="proof" aria-labelledby="proof-title" className="px-4 py-16 md:px-6">
      <SectionHeading
        id="proof-title"
        scale="evidence"
        title={tp("The source, the releases, and production status are public.")}
        intro={
          <>
            {t(
              "The claims on this page come from the main repository: its README, product spec, and OpenAPI documents. mosoo is in Alpha.",
            )}{" "}
            <ArrowLink href={MOSOO_SPEC_URL}>{t("Read the product spec")}</ArrowLink>
          </>
        }
      />

      {/* Four things to check, side by side on wide screens, then two
          projects built on mosoo. */}
      <ul className="border-border-strong mt-10 grid grid-cols-1 gap-x-8 border-t sm:grid-cols-2 xl:grid-cols-4">
        {checkables().map((item) => (
          <li key={item.id} className="border-border-strong flex flex-col border-b py-5 sm:border-b-0 sm:pt-6">
            <h3 className={cn(PHRASE_CLASS, "text-ink-900 text-[17px] font-semibold")}>
              <Phrases text={item.label} />
            </h3>
            <div className="mt-2 flex flex-1 flex-col gap-3">
              {item.copy === "" ? null : <p className="text-ink-700 text-[16px] leading-[1.6]">{item.copy}</p>}
              {item.id === "releases" ? <ReleaseList /> : null}
              <div className="mt-auto flex flex-wrap gap-x-6 gap-y-2">
                {item.links.map((link) => (
                  <ArrowLink key={link.href} href={link.href}>
                    {link.label}
                  </ArrowLink>
                ))}
              </div>
            </div>
          </li>
        ))}
      </ul>

      <ul className="mt-10 grid grid-cols-1 gap-6 lg:grid-cols-2">
        {useCaseCards().map((card) => (
          <li
            key={card.name}
            className="border-border-strong bg-paper-50 grid overflow-hidden rounded-[14px] border sm:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]"
          >
            <div className="border-border-strong max-sm:border-b sm:border-r [&>*]:border-b-0 sm:[&>*]:aspect-auto sm:[&>*]:h-full sm:[&>*]:w-full">
              {card.visual}
            </div>
            <div className="flex flex-col p-5">
              <h3 translate="no" className="text-ink-900 text-[19px] font-semibold">
                {card.name}
              </h3>
              <p className="text-ink-500 mt-1 text-[15px]">{card.byline}</p>
              <p className="text-ink-700 mt-3 text-[16px] leading-[1.6]">{card.body}</p>
              <div className="mt-auto flex flex-wrap gap-x-5 gap-y-2 pt-4">
                {card.links.map((link) => (
                  <ArrowLink key={link.href} href={link.href}>
                    {link.label}
                  </ArrowLink>
                ))}
              </div>
            </div>
          </li>
        ))}
      </ul>
      <div className="mt-6">
        <ArrowLink href={pathToUseCases()}>{t("See all use cases")}</ArrowLink>
      </div>
    </section>
  );
}
