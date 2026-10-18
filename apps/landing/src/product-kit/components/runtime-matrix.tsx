// PM-04/05, one preset on any runtime. The runtime cards are the Agent
// editor's BasicsSection grid (routes/agent/components/editor/
// form-sections.tsx); the model list is the ModelPickerField menu
// (model-picker-field.tsx, model-picker-ui.tsx), shown open and flat instead of
// as a floating dropdown, so it lists every preset model the runtime accepts:
// available ones first (an Example Project with Anthropic and OpenAI keys),
// then models whose provider has no key, in the product's own locked state
// ("Provider key required", "Configure a Provider key for …"). Those labels
// are the server's English strings, as in the console. The protocol row and
// the visible lock list are kit additions; the lock list is the text the
// console puts in the "Add provider key" link title.
// RuntimeAvailability is the Providers page card (routes/providers/
// runtime-availability-section.tsx). Replay: Anthropic key, then OpenAI key.

import { useState } from "react";
import type { ReactElement } from "react";

import type { KitLocale } from "../i18n";
import { consoleText, kitText } from "../i18n";
import { reached, useReplay } from "../lib/replay";
import {
  RUNTIMES,
  getRuntime,
  listLockedVendorLabels,
  listRuntimeAvailabilityRows,
  protocolLabel,
  resolveAvailableModels,
} from "../lib/runtime-catalog";
import type { ResolvedModelEntry } from "../lib/runtime-catalog";
import { RuntimeMark, RuntimeTile } from "./brand-marks";
import { ExternalLink } from "./icons";
import { ConsoleIsland, KitFooter, cx } from "./island";
import { Badge, DataRow } from "./primitives";

/** The Example Project's keys, in the order they were added. */
export const EXAMPLE_CONFIGURED_VENDORS: ReadonlySet<string> = new Set(["anthropic", "openai"]);

const PROVIDERS_URL = "https://cloud.mosoo.ai/providers";

export interface RuntimeMatrixProps {
  locale: KitLocale;
  /** Cycle through the runtimes once when first half visible (never with reduced motion). */
  animate?: boolean | undefined;
  /** The runtime selected in the final state. */
  defaultRuntimeId?: string | undefined;
  /** Render the replay frozen at this many milliseconds (stills, docs, tests). */
  replayAt?: number | undefined;
}

const MATRIX_REPLAY_MS = 4400;
// The longest lock list among the runtimes, to hold the line's height.
const RESERVED_LOCK_LIST = RUNTIMES.map((runtime) =>
  listLockedVendorLabels(resolveAvailableModels(runtime.runtimeId, EXAMPLE_CONFIGURED_VENDORS)),
).reduce((longest, list) => (list.join(", ").length > longest.join(", ").length ? list : longest), []);
const DEFAULT_RUNTIME_ID = "acp-fallback";

// Replay order: one runtime per beat, ending on the default selection.
function replayRuntimeAt(elapsed: number, defaultRuntimeId: string): string {
  const order = [
    ...RUNTIMES.map((runtime) => runtime.runtimeId).filter((id) => id !== defaultRuntimeId),
    defaultRuntimeId,
  ];
  const beat = Math.min(order.length - 1, Math.floor(elapsed / (MATRIX_REPLAY_MS / order.length)));
  return order[beat] ?? defaultRuntimeId;
}

function ModelPickerItem({
  entry,
  selected,
}: {
  entry: ResolvedModelEntry;
  selected: boolean;
}): ReactElement {
  return (
    <div
      className={cx(
        "relative flex flex-col items-start gap-0.5 rounded-sm px-2 py-2 text-[13px]",
        entry.available ? "text-fg-1" : "bg-sunken/40 text-fg-3",
        selected ? "bg-ink-100" : null,
      )}
      title={entry.statusDetail ?? entry.statusLabel}
    >
      <div className="flex w-full items-center justify-between gap-2">
        <span
          className={cx(
            "truncate text-[13px] font-medium",
            entry.available ? "text-foreground" : "text-fg-3",
          )}
        >
          {entry.displayName}
        </span>
        <Badge variant={entry.available ? "success" : "outline"}>{entry.statusLabel}</Badge>
      </div>
      <div className="text-fg-3 flex w-full items-center justify-between gap-2 text-[11px]">
        <span className="min-w-0 truncate">
          {entry.vendorLabel} · {entry.modelId}
        </span>
        {entry.available ? null : <span className="text-fg-3 min-w-0 truncate">{entry.statusDetail}</span>}
      </div>
    </div>
  );
}

export function RuntimeMatrixView({
  locale,
  onSelect,
  runtimeId,
}: {
  locale: KitLocale;
  onSelect: (runtimeId: string) => void;
  runtimeId: string;
}): ReactElement {
  const runtime = getRuntime(runtimeId);
  const entries = resolveAvailableModels(runtimeId, EXAMPLE_CONFIGURED_VENDORS).filter(
    (entry) => entry.reason !== "wrong-runtime",
  );
  const lockedVendors = listLockedVendorLabels(entries);
  const lockedTitle =
    lockedVendors.length > 0
      ? `${consoleText(locale, "agent.providerKeyRequired")}: ${lockedVendors.join(", ")}`
      : null;

  return (
    <div className="border-border bg-card rounded-lg border p-4 @xl:p-6">
      <div className="space-y-2">
        <div className="text-fg-3 text-[12px] leading-none font-medium">
          {consoleText(locale, "agent.runtime")}
        </div>
        <div className="grid grid-cols-2 gap-2 @md:gap-3">
          {RUNTIMES.map((candidate) => {
            const selected = candidate.runtimeId === runtimeId;

            return (
              <button
                aria-pressed={selected}
                className={cx(
                  "focus-visible:ring-ring flex min-w-0 items-center gap-2.5 rounded-lg border px-2.5 py-3 text-left transition-colors focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:outline-none @md:gap-3 @md:px-3",
                  selected ? "border-emphasis bg-selected" : "border-border hover:border-border-strong",
                )}
                key={candidate.runtimeId}
                onClick={() => {
                  onSelect(candidate.runtimeId);
                }}
                type="button"
              >
                <RuntimeTile iconKey={candidate.iconKey} size={24} />
                <div className="min-w-0">
                  <div className="text-foreground text-[13px] leading-5 font-medium">{candidate.label}</div>
                  <div className="text-fg-3 truncate text-[11px]">{candidate.providerLabel}</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-5 space-y-2">
        <div className="flex flex-col gap-2 @xl:flex-row @xl:items-center @xl:justify-between">
          <div className="text-fg-3 text-[12px] leading-none font-medium">
            {consoleText(locale, "agent.model")}
          </div>
          {/* Room for two rows of protocols, so switching runtimes never moves the list. */}
          <div
            aria-label={consoleText(locale, "providers.modelProtocol")}
            className="flex min-h-[46px] flex-wrap content-start items-center gap-1.5 @xl:min-h-0 @xl:justify-end"
            role="group"
          >
            {runtime.supportedModelProtocols.map((protocol) => (
              <Badge key={protocol} variant="default">
                {protocolLabel(protocol)}
              </Badge>
            ))}
          </div>
        </div>
        <div className="border-border bg-popover text-popover-foreground overflow-hidden rounded-md border p-1">
          <div className="text-fg-3 px-2 py-1.5 text-[12px] font-medium">
            {consoleText(locale, "agent.availableModels")}
          </div>
          <div className="bg-border-soft -mx-1 my-1 h-px" />
          <div key={runtimeId} className="environment-row-enter max-h-[280px] overflow-y-auto">
            {entries.length === 0 ? (
              <div className="text-fg-3 px-3 py-6 text-center text-[12px]">
                {consoleText(locale, "providers.noMatchingModels")}
              </div>
            ) : (
              entries.map((entry) => (
                <ModelPickerItem
                  key={`${entry.vendorId}:${entry.modelId}`}
                  entry={entry}
                  selected={entry.modelId === runtime.defaultModel && entry.vendorId === runtime.defaultProvider}
                />
              ))
            )}
          </div>
          <div className="bg-border-soft -mx-1 my-1 h-px" />
          <a
            className="text-fg-3 hover:bg-hover hover:text-fg-1 focus-visible:ring-ring flex w-full items-center gap-1.5 rounded-sm px-2 py-1.5 text-[12px] transition-[background-color,color] duration-150 ease-out outline-none focus-visible:ring-2"
            href={PROVIDERS_URL}
            title={lockedTitle ?? undefined}
          >
            <ExternalLink className="size-3" />
            {lockedVendors.length > 0
              ? consoleText(locale, "agent.addProviderKey")
              : consoleText(locale, "agent.manageProviders")}
          </a>
        </div>
        {/* The lock line keeps its space when a runtime has nothing locked. */}
        <p
          aria-hidden={lockedVendors.length === 0 || undefined}
          className={cx(
            "text-fg-3 flex flex-wrap items-center gap-x-2 gap-y-1 px-0.5 text-[12px] leading-4",
            lockedVendors.length === 0 ? "invisible" : null,
          )}
        >
          <Badge variant="outline">{consoleText(locale, "agent.providerKeyRequired")}</Badge>
          <span>{(lockedVendors.length === 0 ? RESERVED_LOCK_LIST : lockedVendors).join(", ")}</span>
        </p>
      </div>
    </div>
  );
}

export function RuntimeMatrix({
  animate = false,
  defaultRuntimeId = DEFAULT_RUNTIME_ID,
  locale,
  replayAt,
}: RuntimeMatrixProps): ReactElement {
  const replay = useReplay({ animate, durationMs: MATRIX_REPLAY_MS, replayAt });
  const [chosen, setChosen] = useState<string | null>(null);
  const runtimeId =
    chosen ?? (replay.elapsed === null ? defaultRuntimeId : replayRuntimeAt(replay.elapsed, defaultRuntimeId));

  return (
    <ConsoleIsland locale={locale} rootRef={replay.ref}>
      <RuntimeMatrixView locale={locale} onSelect={setChosen} runtimeId={runtimeId} />
      <KitFooter
        canReplay={replay.canReplay}
        locale={locale}
        note={kitText(locale, "exampleProjectKeys")}
        onReplay={() => {
          setChosen(null);
          replay.replay();
        }}
      />
    </ConsoleIsland>
  );
}

export interface RuntimeAvailabilityProps {
  locale: KitLocale;
  /** Add the Example keys one at a time once when first half visible. */
  animate?: boolean | undefined;
  /** Render the replay frozen at this many milliseconds (stills, docs, tests). */
  replayAt?: number | undefined;
}

const AVAILABILITY_REPLAY_MS = 3200;
const AVAILABILITY_STEPS = [
  { at: 0, vendors: new Set<string>() },
  { at: 1000, vendors: new Set(["anthropic"]) },
  { at: 2100, vendors: EXAMPLE_CONFIGURED_VENDORS },
] as const;

export function RuntimeAvailability({
  animate = false,
  locale,
  replayAt,
}: RuntimeAvailabilityProps): ReactElement {
  const replay = useReplay({ animate, durationMs: AVAILABILITY_REPLAY_MS, replayAt });
  const vendors =
    replay.elapsed === null
      ? EXAMPLE_CONFIGURED_VENDORS
      : (AVAILABILITY_STEPS.findLast((step) => reached(replay.elapsed, step.at))?.vendors ?? new Set<string>());
  const rows = listRuntimeAvailabilityRows(vendors, locale);

  return (
    <ConsoleIsland locale={locale} rootRef={replay.ref}>
      <section className="border-border bg-card rounded-lg border p-4 @xl:p-6">
        <div className="mb-3">
          <p className="t-section-title">{consoleText(locale, "providers.runtimeAvailability")}</p>
          <p className="text-fg-3 mt-1 text-[12px] leading-4">
            {consoleText(locale, "providers.runtimeAvailabilityDescription")}
          </p>
        </div>
        <div className="space-y-2">
          {rows.map((row) => (
            <DataRow key={row.runtimeId} tone="tinted" className="justify-between">
              {/* The console lets the name shrink too; runtime names are short, so
                  here only the status truncates (its full text is the title). */}
              <div className="flex shrink-0 items-center gap-3">
                <RuntimeMark
                  className="border-border-soft bg-card size-6 shrink-0 rounded-sm border p-0.5"
                  iconKey={getRuntime(row.runtimeId).iconKey}
                />
                <div className={cx("truncate font-medium", row.tone === "ready" ? "text-fg-1" : "text-fg-2")}>
                  {row.label}
                </div>
              </div>
              <span
                className={cx(
                  "min-w-0 shrink truncate text-[12px] transition-colors duration-150 ease-out",
                  row.tone === "ready" ? "text-fg-2" : "text-fg-3",
                )}
                title={row.status}
              >
                {row.status}
              </span>
            </DataRow>
          ))}
        </div>
      </section>
      <KitFooter
        canReplay={replay.canReplay}
        locale={locale}
        note={kitText(locale, "exampleProjectKeys")}
        onReplay={replay.replay}
      />
    </ConsoleIsland>
  );
}
