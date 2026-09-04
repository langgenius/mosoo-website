import { MOSOO_GITHUB_URL } from "../login/links";
import { t } from "./i18n";

export interface IncidentRecord {
  readonly id: string;
  /** Calendar date (UTC) on which the incident was resolved. */
  readonly resolvedOn: string;
  readonly summary: string;
  readonly postmortemLabel: string;
  readonly postmortemUrl: string;
}

const POSTMORTEM_BASE_URL = `${MOSOO_GITHUB_URL}blob/main/docs/operations/incidents/`;

// Newest first. The postmortems in the mosoo repository stay the source of
// truth; this list only mirrors their one-line summaries for the notice feed.
export const INCIDENTS: readonly IncidentRecord[] = [
  {
    id: "2026-08-15-stranded-cattle-account-capacity",
    resolvedOn: "2026-08-15",
    summary: t(
      "54 user-facing Runs for one account failed when stranded Cattle sandboxes exhausted its concurrency capacity. Lifecycle repair reclaimed the capacity.",
    ),
    postmortemLabel: t("Read the account capacity incident postmortem"),
    postmortemUrl: `${POSTMORTEM_BASE_URL}2026-08-15-stranded-cattle-account-capacity.md`,
  },
  {
    id: "2026-08-13-acp-tool-call-identity-conflict",
    resolvedOn: "2026-08-13",
    summary: t(
      "8 user-facing ACP Runs across two accounts failed when streamed tool arguments conflicted with durable tool-call identity. The hotfix restored tool execution.",
    ),
    postmortemLabel: t("Read the streamed tool identity incident postmortem"),
    postmortemUrl: `${POSTMORTEM_BASE_URL}2026-08-13-acp-tool-call-identity-conflict.md`,
  },
  {
    id: "2026-07-29-openai-runtime-unavailable",
    resolvedOn: "2026-07-29",
    summary: t(
      "OpenAI Runtime runs failed before producing a response. Production hotfixes restored sandbox startup, provider routing, and lifecycle recovery.",
    ),
    postmortemLabel: t("Read the OpenAI Runtime incident postmortem"),
    postmortemUrl: `${POSTMORTEM_BASE_URL}2026-07-29-openai-runtime-unavailable.md`,
  },
];
