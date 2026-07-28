import { t } from "./i18n";

/** A cell in the capability matrix: included, absent, or a concrete value. */
export type MatrixValue =
  | { kind: "check" }
  | { kind: "dash" }
  | { kind: "text"; label: string };

const CHECK: MatrixValue = { kind: "check" };
const DASH: MatrixValue = { kind: "dash" };
const text = (label: string): MatrixValue => ({ kind: "text", label });

export type TierId = "free" | "pro" | "enterprise";

export type Tier = {
  id: TierId;
  name: string;
  /** Display price ("$0", "$20") or a word ("Custom") for non-priced tiers. */
  price: string;
  /** Mono suffix rendered after the price, e.g. "/mo". */
  priceSuffix?: string;
  tagline: string;
  cta: { kind: "get-started" } | { kind: "coming-soon" };
  features: readonly string[];
};

// Plan limits are deliberate estimates for the alpha cloud offering; the page
// footnote marks them as indicative until GA.
export const TIERS: readonly Tier[] = [
  {
    id: "free",
    name: t("Free"),
    price: "$0",
    priceSuffix: t("/mo"),
    tagline: t("For individual developers and weekend agents."),
    cta: { kind: "get-started" },
    features: [
      t("1 App with 3 agents"),
      t("All runtimes: Claude Agent SDK · Codex · OpenCode"),
      t("10 sandbox hours / month"),
      t("15 min max run duration"),
      t("2 concurrent sandboxes"),
      t("BYOK provider keys"),
      t("Community support"),
    ],
  },
  {
    id: "pro",
    name: t("Pro"),
    price: "$20",
    priceSuffix: t("/mo"),
    tagline: t("For teams shipping production agents."),
    cta: { kind: "coming-soon" },
    features: [
      t("Unlimited Apps and agents"),
      t("100 sandbox hours / month included"),
      t("Extra compute at $0.10 / hour, metered per second"),
      t("4 hour max run duration"),
      t("20 concurrent sandboxes"),
      t("All chat channels: Slack · Lark · Discord · Telegram · WeChat"),
      t("Priority support"),
    ],
  },
  {
    id: "enterprise",
    name: t("Enterprise"),
    price: t("Custom"),
    tagline: t("For platforms operating agent fleets."),
    cta: { kind: "coming-soon" },
    features: [
      t("Custom sandbox pool and concurrency"),
      t("Unlimited run duration"),
      t("SSO / SAML and audit logs"),
      t("VPC or on-prem deployment with SLA"),
      t("Compliance reviews and DPA"),
      t("Dedicated support engineer"),
    ],
  },
];

export type MatrixRow = {
  capability: string;
  values: readonly [MatrixValue, MatrixValue, MatrixValue];
};

export type MatrixGroup = {
  group: string;
  rows: readonly MatrixRow[];
};

/** The full capability list — one row per capability, one column per tier. */
export const CAPABILITY_MATRIX: readonly MatrixGroup[] = [
  {
    group: t("Build"),
    rows: [
      { capability: t("Apps"), values: [text("1"), text(t("Unlimited")), text(t("Unlimited"))] },
      {
        capability: t("Agents per App"),
        values: [text("3"), text(t("Unlimited")), text(t("Unlimited"))],
      },
      {
        capability: t("Agent runtimes"),
        values: [text(t("All")), text(t("All")), text(t("All + early access"))],
      },
      { capability: t("Skills and Skill.md export"), values: [CHECK, CHECK, CHECK] },
      { capability: t("MCP tools and permissions"), values: [CHECK, CHECK, CHECK] },
      { capability: t("BYOK provider keys"), values: [CHECK, CHECK, CHECK] },
    ],
  },
  {
    group: t("Run"),
    rows: [
      {
        capability: t("Sandbox compute included"),
        values: [text(t("10 hrs / mo")), text(t("100 hrs / mo")), text(t("Custom"))],
      },
      {
        capability: t("Extra sandbox compute"),
        values: [DASH, text(t("$0.10 / hr, per-second metering")), text(t("Committed-use pricing"))],
      },
      {
        capability: t("Max run duration"),
        values: [text(t("15 min")), text(t("4 hrs")), text(t("Unlimited"))],
      },
      {
        capability: t("Concurrent sandboxes"),
        values: [text("2"), text("20"), text("1,000+")],
      },
      { capability: t("Session replay and resume"), values: [CHECK, CHECK, CHECK] },
      {
        capability: t("Thread retention"),
        values: [text(t("7 days")), text(t("90 days")), text(t("Custom"))],
      },
      {
        capability: t("File storage"),
        values: [text(t("1 GB")), text(t("50 GB")), text(t("Custom"))],
      },
    ],
  },
  {
    group: t("Invoke"),
    rows: [
      { capability: t("Web Threads"), values: [CHECK, CHECK, CHECK] },
      {
        capability: t("Typed HTTP Agent API"),
        values: [
          text(t("1,000 requests / day")),
          text(t("100,000 requests / day")),
          text(t("Custom")),
        ],
      },
      {
        capability: t("Chat channels"),
        values: [text(t("1 channel")), text(t("All channels")), text(t("All + custom"))],
      },
      { capability: t("Claude Code /skill export"), values: [CHECK, CHECK, CHECK] },
    ],
  },
  {
    group: t("Observe"),
    rows: [
      { capability: t("Cost dashboard by app, agent, and model"), values: [CHECK, CHECK, CHECK] },
      { capability: t("CSV usage export"), values: [DASH, CHECK, CHECK] },
      { capability: t("Audit logs"), values: [DASH, DASH, CHECK] },
    ],
  },
  {
    group: t("Team"),
    rows: [
      { capability: t("Seats"), values: [text("1"), text("10"), text(t("Custom"))] },
      { capability: t("SSO / SAML"), values: [DASH, DASH, CHECK] },
      {
        capability: t("Support"),
        values: [text(t("Community")), text(t("Priority")), text(t("Dedicated engineer"))],
      },
      {
        capability: t("Deployment"),
        values: [text(t("mosoo Cloud")), text(t("mosoo Cloud")), text(t("Cloud, VPC, or on-prem"))],
      },
    ],
  },
];
