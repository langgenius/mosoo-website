import { t } from "./i18n";

export type TierId = "free" | "pro" | "enterprise";

export type Tier = {
  id: TierId;
  name: string;
  /** Small line under the tier name: the price for Free, a non-price for paid tiers. */
  priceLine: string;
  tagline: string;
  cta: { kind: "get-started" } | { kind: "coming-soon" };
  features: readonly string[];
};

// Paid tiers deliberately carry no concrete price — like the reference pages,
// they only signal Coming Soon until billing ships.
export const TIERS: readonly Tier[] = [
  {
    id: "free",
    name: t("Free"),
    priceLine: t("$0 / month"),
    tagline: t("For individual developers and weekend agents."),
    cta: { kind: "get-started" },
    features: [
      t("3 agents in one App"),
      t("OpenAI Codex · Claude Agent SDK · OpenCode"),
      t("10 sandbox hours every month"),
      t("Concurrent sandboxes: 3 per Agent · 10 per App · 20 per account"),
      t("Durable Threads and session replay"),
      t("BYOK provider keys"),
    ],
  },
  {
    id: "pro",
    name: t("Pro"),
    priceLine: t("Pricing to be announced"),
    tagline: t("For teams shipping production agents."),
    cta: { kind: "coming-soon" },
    features: [
      t("Everything in Free"),
      t("More sandbox hours and concurrency"),
      t("Longer runs, kept warm"),
      t("All chat channels"),
      t("Priority support"),
    ],
  },
  {
    id: "enterprise",
    name: t("Enterprise"),
    priceLine: t("Custom pricing"),
    tagline: t("For platforms operating agent fleets."),
    cta: { kind: "coming-soon" },
    features: [
      t("Custom sandbox pool and concurrency"),
      t("SSO / SAML and audit logs"),
      t("VPC or on-prem deployment"),
      t("Dedicated support"),
    ],
  },
];

export type MeteredItem = {
  label: string;
  description: string;
};

// The meter maps to what Cloudflare actually bills mosoo for — sandbox
// container time, R2/D1 storage, Workers requests — plus BYOK tokens, which
// pass through at cost.
export const METERED_ITEMS: readonly MeteredItem[] = [
  {
    label: t("Sandbox compute"),
    description: t("Per-second while a sandbox is mounted for a run. Idle time is never billed."),
  },
  {
    label: t("Storage"),
    description: t("Files your Apps keep in R2, plus Threads and metadata in D1."),
  },
  {
    label: t("Requests"),
    description: t("Agent API calls served by Workers."),
  },
  {
    label: t("Model tokens"),
    description: t("BYOK: your provider bills you directly. mosoo adds no markup."),
  },
];
