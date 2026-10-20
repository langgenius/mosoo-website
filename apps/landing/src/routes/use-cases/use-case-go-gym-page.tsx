import { ArrowUpRight, CheckCircle2 } from "lucide-react";
import type { ReactElement } from "react";

import { Reveal } from "../login/landing/motion";
import { MOSOO_API_REFERENCE_URL, MOSOO_GITHUB_URL } from "../login/links";
import { sectionHeadingStyle } from "./display";
import {
  CaseHeader,
  CasePage,
  CasePoints,
  CaseSection,
  CaseShot,
  ClosingCta,
  LiveAppButton,
  OutboundLink,
} from "./case-parts";
import { t } from "./i18n";
import { GO_GYM } from "./use-cases-data";

const CLOUDFLARE_CONTAINERS_URL = "https://developers.cloudflare.com/containers/";
const SUPABASE_RLS_URL = "https://supabase.com/docs/guides/database/postgres/row-level-security";

const REQUEST_PATH = [
  "Browser",
  "Go Gym backend",
  "mosoo Thread API",
  "Sandbox per Thread",
  "Delegated MCP",
  "Supabase",
] as const;

const VERIFIED_RESULTS = [
  "3 structured records",
  "1,150 kcal intake",
  "64 g protein",
  "320 kcal training burn",
] as const;

const RESPONSIBILITIES = [
  {
    body: () =>
      t("Product UI, Supabase login, domain rules, WebSocket updates, and the business tool endpoints."),
    name: "Go Gym",
  },
  {
    body: () =>
      t("Agent execution, Thread and Run lifecycle, user delegation, sandbox isolation, and harness selection."),
    name: "mosoo",
  },
  {
    body: () => t("OAuth identity, Postgres persistence, Row Level Security, and private file storage."),
    name: "Supabase",
  },
  {
    body: () =>
      t(
        "A stateless Container for the web app and a Worker for the remote MCP service. Durable user data stays in Supabase.",
      ),
    name: "Cloudflare",
  },
] as const;

const RESOURCES = [
  {
    description: () => t("Use the production app and try a meal or workout log."),
    href: GO_GYM.productUrl,
    label: () => t("Try Go Gym"),
  },
  {
    description: () => t("Create Threads and Runs from an application backend."),
    href: MOSOO_API_REFERENCE_URL,
    label: () => t("Thread API reference"),
  },
  {
    description: () => t("Inspect the open-source Agent runtime behind this case."),
    href: MOSOO_GITHUB_URL,
    label: () => t("mosoo source"),
  },
  {
    description: () => t("See the application compute used by the production deployment."),
    href: CLOUDFLARE_CONTAINERS_URL,
    label: () => t("Cloudflare Containers"),
  },
  {
    description: () => t("See how durable per-user records are enforced at the database layer."),
    href: SUPABASE_RLS_URL,
    label: () => t("Supabase Row Level Security"),
  },
] as const;

/** The smoke test: what was sent, beside what it produced (no kickers over either, #143). */
function ProductionProof(): ReactElement {
  return (
    <section className="uc-sec uc-sec--near uc-proof">
      <Reveal className="uc-fact">
        <h2 className="uc-h2" style={sectionHeadingStyle}>
          {t("From one message to durable records")}
        </h2>
        <p className="uc-intro">
          {t(
            "A test user described breakfast, lunch, and 45 minutes of strength training in one message. The Agent created three user-scoped records and refreshed the dashboard.",
          )}
        </p>
      </Reveal>
      <Reveal className="uc-panel" delay={0.06}>
        <ul className="uc-checks" role="list">
          {VERIFIED_RESULTS.map((result) => (
            <li key={result}>
              <CheckCircle2 aria-hidden="true" />
              {t(result)}
            </li>
          ))}
        </ul>
      </Reveal>
    </section>
  );
}

/** The production request path as six hops in a row on the frame (a column on phones). */
function Architecture(): ReactElement {
  return (
    <CaseSection
      title={t("The production request path")}
      intro={t(
        "The app and Agent runtime are deployed separately. The browser talks only to Go Gym; its backend holds the mosoo token and supplies the trusted userId.",
      )}
    >
      <Reveal delay={0.06}>
        <ol className="uc-flow" role="list">
          {REQUEST_PATH.map((stage) => (
            <li key={stage}>{stage}</li>
          ))}
        </ol>
        <p className="uc-note">
          {t(
            "mosoo delegates identity; it does not replace application authorization. Go Gym validates the caller and Supabase RLS remains the final data boundary.",
          )}
        </p>
      </Reveal>
    </CaseSection>
  );
}

function StackOwnership(): ReactElement {
  return (
    <CaseSection title={t("Clear ownership across the stack")}>
      <div className="uc-cards">
        {RESPONSIBILITIES.map((item, index) => (
          <Reveal key={item.name} className="uc-panel" delay={index * 0.04}>
            <h3 className="uc-item-h" translate="no">
              {item.name}
            </h3>
            <p className="uc-item-p">{item.body()}</p>
          </Reveal>
        ))}
      </div>
    </CaseSection>
  );
}

/** Links out, each a card on the frame with a still arrow; hovering underlines the label, nothing moves. */
function ResourceLinks(): ReactElement {
  return (
    <CaseSection title={t("Explore the product and stack")}>
      <div className="uc-cards uc-cards--3">
        {RESOURCES.map((resource, index) => (
          <Reveal key={resource.href} delay={index * 0.04}>
            <a className="uc-panel uc-res" href={resource.href} target="_blank" rel="noreferrer noopener">
              <span className="uc-res-h">
                <span className="uc-res-label">{resource.label()}</span>
                <ArrowUpRight aria-hidden="true" />
              </span>
              <span className="uc-res-p">{resource.description()}</span>
            </a>
          </Reveal>
        ))}
      </div>
    </CaseSection>
  );
}

export function UseCaseGoGymPage(): ReactElement {
  return (
    <CasePage>
      <CaseHeader
        useCase={GO_GYM}
        title={t("One Agent for every user. Their data stays isolated.")}
        lead={t(
          "Go Gym is a production fitness tracker. Users describe meals, workouts, and body measurements in chat; the app turns them into structured records, durable dashboards, and progress summaries.",
        )}
        actions={
          <>
            {GO_GYM.productUrl ? <LiveAppButton href={GO_GYM.productUrl} /> : null}
            <OutboundLink href={MOSOO_API_REFERENCE_URL}>{t("Read the API docs")}</OutboundLink>
          </>
        }
      />
      <Reveal className="uc-sec uc-sec--shot">
        <CaseShot src={GO_GYM.image} alt={GO_GYM.imageAlt} width={1440} height={900} eager />
      </Reveal>
      <ProductionProof />
      <CaseSection title={t("What mosoo provides")}>
        <CasePoints
          items={[
            {
              title: t("One Agent, user-scoped Threads"),
              body: t(
                "Go Gym publishes one shared Agent. Its trusted backend creates a separate Thread with userId for each signed-in user, so the browser never receives a mosoo token.",
              ),
            },
            {
              title: t("Delegated tool identity"),
              body: t(
                "mosoo carries the verified user context into the MCP call. The model cannot choose another user ID, while Go Gym and Supabase still enforce authorization at the data boundary.",
              ),
            },
            {
              title: t("Isolated, harness-neutral execution"),
              body: t(
                "Each Thread runs in its own sandbox. Production uses OpenCode, while the same business MCP path was verified with Codex and Claude without rewriting the app.",
              ),
            },
          ]}
        />
      </CaseSection>
      <Architecture />
      <StackOwnership />
      {/* The mosoo console capture that stood here is gone (#143 item 8: no product screenshots, and it showed
          Published / Import package, the flow MAIN SPEC §8 is retiring); the sentence says the same. */}
      <CaseSection
        title={t("One use case, multiple harnesses")}
        intro={t(
          "Go Gym runs on OpenCode in production. The same Agent contract and business MCP were also exercised through Codex and Claude before release.",
        )}
      />
      <ResourceLinks />
      <ClosingCta
        title={t("Embed an Agent in your own SaaS.")}
        body={t(
          "Keep your product, auth, and database. Let mosoo own the Agent lifecycle, isolation, harness, and delegated tool context.",
        )}
      />
    </CasePage>
  );
}
