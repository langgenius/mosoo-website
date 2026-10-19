import type { ReactElement } from "react";

import {
  MOSOO_GITHUB_URL,
  MOSOO_INCIDENTS_URL,
  MOSOO_RELEASES_URL,
  MOSOO_SPEC_URL,
  pathToUseCases,
  statusPath,
} from "../links";
import { t } from "./i18n";
import { ArrowLink, Phrases } from "./ui";

// Copy deck §8: only what a visitor can check. No logos, star counts or
// success rates. Release facts were checked against GitHub Releases on
// 2026-10-19 (v0.7.0 published 2026-10-09; every release is a prerelease).
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
      label: t("Source"),
      copy: t(
        "The runtime, console, and API are Apache 2.0 on GitHub. The stack: Cloudflare Workers, Durable Objects, D1, R2, and Containers.",
      ),
      links: [
        { href: MOSOO_GITHUB_URL, label: t("View source") },
        { href: MOSOO_SPEC_URL, label: t("Read the product spec") },
      ],
    },
    {
      id: "releases",
      label: t("Releases"),
      copy: t(
        "Latest: v0.7.0 (Alpha), October 9, 2026. v0.5.0 added Pi as the fourth runtime. v0.4.0 made Sessions startable without an Agent.",
      ),
      links: [{ href: MOSOO_RELEASES_URL, label: t("View all releases") }],
    },
    {
      id: "status",
      label: t("Production status"),
      copy: t(
        "mosoo.ai/health is built from production Worker outcomes and real Run completions. A runtime without production samples shows Unknown.",
      ),
      links: [{ href: statusPath(), label: t("Open the status page") }],
    },
    {
      id: "postmortems",
      label: t("Postmortems"),
      copy: t(
        "6 incident postmortems from July to September 2026 are in the repo. Newer incidents are tracked as GitHub issues.",
      ),
      links: [{ href: MOSOO_INCIDENTS_URL, label: t("Read the postmortems") }],
    },
  ];
}

// Static fallback of the release list (copy deck §8), newest first.
function releases(): readonly { version: string; date: string; change: string }[] {
  return [
    {
      version: "v0.7.0",
      date: "2026-10-09",
      change: t("Smaller codebase. The public Thread API v1 and v2 did not change."),
    },
    {
      version: "v0.5.1",
      date: "2026-10-08",
      change: t(
        "Custom providers declare a model protocol, and mismatched runtime and model pairs are rejected before a run.",
      ),
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
    <ol aria-label={t("Releases")} className="v2a-releases mt-4 border-l border-[rgba(109,120,106,0.6)] pl-4">
      {/* The two newest; "View all releases" links to the full list (v3 length cut). */}
      {releases().slice(0, 2).map((release, index) => (
        <li key={release.version} className="relative py-1.5">
          <p className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <span translate="no" className="text-ink-900 font-mono text-[14px] font-semibold">
              {release.version}
            </span>
            <time dateTime={release.date} className="text-ink-500 font-mono text-[13px]">
              {release.date}
            </time>
            {index === 0 ? (
              <span className="border-ink-900 text-ink-900 rounded-full border px-2 text-[14px] font-semibold">
                {t("Latest")}
              </span>
            ) : null}
          </p>
          <p className="text-ink-500 mt-0.5 text-[16px] leading-[1.55]">{release.change}</p>
        </li>
      ))}
    </ol>
  );
}

type UseCaseCard = {
  readonly name: string;
  readonly byline: string;
  readonly body: string;
  readonly image: { readonly src: string; readonly width: number; readonly height: number; readonly alt: string };
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
      image: {
        src: "/landing/use-cases/codex-pet-app.png",
        width: 2880,
        height: 1800,
        alt: t("The Codex Pet app turning one uploaded avatar into 9 animation states."),
      },
      links: [{ href: pathToUseCases("codex-pet"), label: t("Read the Codex Pet use case") }],
    },
    {
      name: "ghfind",
      byline: t("Built by AsperforMias."),
      body: t(
        "For each public GitHub repository, ghfind’s Go worker starts a Thread and turns the 3 artifacts the Agent saves (analysis JSON, evidence JSON, and a Markdown report) into its own result page.",
      ),
      image: {
        src: "/landing/use-cases/ghfind-app.png",
        width: 1174,
        height: 857,
        alt: t("The ghfind Projects page, where a mosoo Agent evaluates public GitHub repositories."),
      },
      links: [
        { href: pathToUseCases("ghfind"), label: t("Read the ghfind use case") },
        { href: "https://ghfind.com", label: t("Open ghfind") },
      ],
    },
  ];
}

export function ProofSection(): ReactElement {
  return (
    <section id="proof" aria-labelledby="proof-title" className="v2a-section v2a-tight">
      <span aria-hidden="true" className="v2a-node" style={{ top: 94 }} />
      <h2 id="proof-title" className="v2a-display v2a-h2">
        <Phrases text={t("The code, the releases, and the incident postmortems are public.")} />
      </h2>
      <p className="v2a-intro">
        {t(
          "mosoo is in Alpha. What you can check today is the code, the releases, production status, and two projects built on it.",
        )}
      </p>

      <div className="mt-12 grid grid-cols-1 gap-12 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)] lg:gap-14">
        <ul className="border-t border-[rgba(109,120,106,0.35)]">
          {checkables().map((item) => (
            <li
              key={item.id}
              className="grid gap-2 border-b border-[rgba(109,120,106,0.35)] py-6 sm:grid-cols-[11rem_minmax(0,1fr)] sm:gap-6"
            >
              <h3 className="v2a-label pt-1">{item.label}</h3>
              <div>
                <p className="text-ink-500 text-[16px] leading-[1.6]">{item.copy}</p>
                {item.id === "releases" ? <ReleaseList /> : null}
                <div className="mt-3 flex flex-wrap gap-x-6 gap-y-2">
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

        <div>
          <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
            {useCaseCards().map((card) => (
              <li
                key={card.name}
                className="border-border-strong bg-paper-50 flex flex-col overflow-hidden rounded-[14px] border"
              >
                <img
                  src={card.image.src}
                  width={card.image.width}
                  height={card.image.height}
                  alt={card.image.alt}
                  loading="lazy"
                  decoding="async"
                  className="border-border-strong aspect-[16/10] w-full border-b object-cover object-top"
                />
                <div className="flex flex-1 flex-col p-5">
                  <h3 translate="no" className="text-ink-900 text-[19px] font-semibold">
                    {card.name}
                  </h3>
                  <p className="text-ink-500 mt-1 text-[16px]">{card.byline}</p>
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
        </div>
      </div>
    </section>
  );
}
