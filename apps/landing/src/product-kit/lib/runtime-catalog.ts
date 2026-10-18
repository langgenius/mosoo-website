// The runtime catalog, read from data/runtime-catalog.snapshot.json (exported
// from langgenius/mosoo pkgs/runtime-catalog/src/catalog.ts; see `source` in
// the file). The resolvers are ports of the product's own:
// - resolveRuntimeModelProtocol (pkgs/runtime-catalog/src/runtime-catalog.ts)
// - resolveAvailableModels for preset models, with its sort order
//   (apps/api/src/modules/vendor-credentials/application/available-models.ts)
// - listRuntimeAvailabilityRows (apps/web/src/routes/providers/
//   runtime-availability-model.ts), for preset keys
// The status labels and details are the server's English strings, as the
// console shows them in every locale.

import snapshot from "../data/runtime-catalog.snapshot.json";
import type { KitLocale } from "../i18n";
import { consoleText, interpolate } from "../i18n";

export const MODEL_PROTOCOLS = [
  "anthropic-messages",
  "google-gemini",
  "openai-chat-completions",
  "openai-responses",
] as const;

export type ModelProtocol = (typeof MODEL_PROTOCOLS)[number];

function toProtocol(value: string): ModelProtocol {
  const protocol = MODEL_PROTOCOLS.find((candidate) => candidate === value);

  if (protocol === undefined) {
    throw new Error(`Unknown model protocol in the runtime catalog snapshot: ${value}.`);
  }

  return protocol;
}

export interface CatalogVendor {
  readonly iconKey: string;
  readonly label: string;
  readonly vendorId: string;
}

export interface CatalogRuntime {
  readonly acceptsCustomProvider: boolean;
  readonly color: string | null;
  readonly defaultModel: string;
  readonly defaultProvider: string;
  readonly iconKey: string;
  readonly label: string;
  readonly providerLabel: string;
  readonly runtimeId: string;
  readonly supportedModelProtocols: readonly ModelProtocol[];
  readonly vendorIds: readonly string[];
}

export interface CatalogPresetModel {
  readonly displayName: string;
  readonly modelId: string;
  readonly protocol: ModelProtocol;
  readonly vendorId: string;
}

// Module-level reads of the snapshot go through pure calls, so a page that
// shows no catalog moment drops the catalog from its bundle.
function pick<T>(read: () => T): T {
  return read();
}

export const CATALOG_SOURCE = /* @__PURE__ */ pick(() => snapshot.source);

export const VENDORS: readonly CatalogVendor[] = /* @__PURE__ */ pick(() => snapshot.vendors);

export const RUNTIMES: readonly CatalogRuntime[] = /* @__PURE__ */ snapshot.runtimes.map((runtime) => ({
  ...runtime,
  supportedModelProtocols: runtime.supportedModelProtocols.map(toProtocol),
}));

export const PRESET_MODELS: readonly CatalogPresetModel[] = /* @__PURE__ */ snapshot.presetModels.map(
  (model) => ({ ...model, protocol: toProtocol(model.protocol) }),
);

/** provider-model-protocol.ts modelProtocolLabel. */
export function protocolLabel(protocol: ModelProtocol): string {
  return snapshot.protocols.find((entry) => entry.id === protocol)?.label ?? protocol;
}

const CUSTOM_VENDOR_ID = "openai-compatible";

export function getRuntime(runtimeId: string): CatalogRuntime {
  const runtime = RUNTIMES.find((candidate) => candidate.runtimeId === runtimeId);

  if (runtime === undefined) {
    throw new Error(`Unknown runtime: ${runtimeId}.`);
  }

  return runtime;
}

export function vendorLabel(vendorId: string): string {
  return VENDORS.find((vendor) => vendor.vendorId === vendorId)?.label ?? vendorId;
}

export type ResolvedModelReason = "needs-key" | "wrong-protocol" | "wrong-runtime";

export interface ResolvedModelEntry {
  readonly available: boolean;
  readonly displayName: string;
  readonly modelId: string;
  readonly protocol: ModelProtocol;
  readonly reason: ResolvedModelReason | null;
  readonly statusDetail: string | null;
  readonly statusLabel: string;
  readonly vendorId: string;
  readonly vendorLabel: string;
}

const STATUS = /* @__PURE__ */ pick(() => snapshot.availability);

/** The server's English label for a model whose provider has no key. */
export const PROVIDER_KEY_REQUIRED_LABEL: string = /* @__PURE__ */ pick(() => STATUS.needsKey.statusLabel);

function resolvePresetEntry(
  model: CatalogPresetModel,
  runtime: CatalogRuntime,
  configuredVendorIds: ReadonlySet<string>,
): ResolvedModelEntry {
  const base = {
    displayName: model.displayName,
    modelId: model.modelId,
    protocol: model.protocol,
    vendorId: model.vendorId,
    vendorLabel: vendorLabel(model.vendorId),
  };

  if (!runtime.vendorIds.includes(model.vendorId)) {
    return {
      ...base,
      available: false,
      reason: "wrong-runtime",
      statusDetail: interpolate(STATUS.wrongRuntime.statusDetail, {
        runtime: runtime.label,
        vendor: base.vendorLabel,
      }),
      statusLabel: STATUS.wrongRuntime.statusLabel,
    };
  }

  if (!runtime.supportedModelProtocols.includes(model.protocol)) {
    return {
      ...base,
      available: false,
      reason: "wrong-protocol",
      statusDetail: interpolate(STATUS.wrongProtocol.statusDetail, {
        protocol: model.protocol,
        runtimeId: runtime.runtimeId,
      }),
      statusLabel: STATUS.wrongProtocol.statusLabel,
    };
  }

  if (!configuredVendorIds.has(model.vendorId)) {
    return {
      ...base,
      available: false,
      reason: "needs-key",
      statusDetail: interpolate(STATUS.needsKey.statusDetail, { vendor: base.vendorLabel }),
      statusLabel: STATUS.needsKey.statusLabel,
    };
  }

  return {
    ...base,
    available: true,
    reason: null,
    statusDetail: null,
    statusLabel: STATUS.available.statusLabel,
  };
}

/**
 * Preset models for one runtime, resolved and sorted like the server
 * (available first, then by "vendor model"). Custom-provider models exist only
 * on a Project's custom credentials, so the kit has none.
 */
export function resolveAvailableModels(
  runtimeId: string,
  configuredVendorIds: ReadonlySet<string>,
): ResolvedModelEntry[] {
  const runtime = getRuntime(runtimeId);

  return PRESET_MODELS.filter((model) => model.vendorId !== CUSTOM_VENDOR_ID)
    .map((model) => resolvePresetEntry(model, runtime, configuredVendorIds))
    .toSorted((left, right) => {
      if (left.available !== right.available) {
        return left.available ? -1 : 1;
      }

      return `${left.vendorLabel} ${left.displayName}`.localeCompare(
        `${right.vendorLabel} ${right.displayName}`,
      );
    });
}

/** model-picker-availability.ts listLockedVendorLabels. */
export function listLockedVendorLabels(entries: readonly ResolvedModelEntry[]): string[] {
  const labels = new Set<string>();

  for (const entry of entries) {
    if (!entry.available && entry.reason === "needs-key") {
      labels.add(entry.vendorLabel);
    }
  }

  return [...labels];
}

export interface RuntimeAvailabilityRow {
  readonly label: string;
  readonly runtimeId: string;
  readonly status: string;
  readonly tone: "muted" | "ready";
}

function formatJoin(items: readonly string[], locale: KitLocale): string {
  const or = consoleText(locale, "providers.or");

  if (items.length <= 2) {
    return items.join(` ${or} `);
  }

  const lastItem = items.at(-1);
  return lastItem === undefined ? "" : `${items.slice(0, -1).join(", ")}, ${or} ${lastItem}`;
}

/**
 * The Providers page's "Runtime availability" rows for a set of preset keys,
 * listed in the order the keys were added (the Set's order), like the console.
 */
export function listRuntimeAvailabilityRows(
  configuredVendorIds: ReadonlySet<string>,
  locale: KitLocale,
): RuntimeAvailabilityRow[] {
  return RUNTIMES.map((runtime) => {
    const readyLabels = [...configuredVendorIds]
      .filter((vendorId) => vendorId !== CUSTOM_VENDOR_ID && runtime.vendorIds.includes(vendorId))
      .filter((vendorId) =>
        PRESET_MODELS.some(
          (model) =>
            model.vendorId === vendorId && runtime.supportedModelProtocols.includes(model.protocol),
        ),
      )
      .map(vendorLabel);
    const ready = readyLabels.length > 0;
    const requiredLabels = [
      ...runtime.vendorIds.map(vendorLabel),
      ...(runtime.acceptsCustomProvider
        ? [consoleText(locale, "providers.customProviderRequired")]
        : []),
    ];

    return {
      label: runtime.label,
      runtimeId: runtime.runtimeId,
      status: ready
        ? consoleText(locale, "providers.readyConfigured", { vendors: readyLabels.join(" / ") })
        : consoleText(locale, "providers.needsKeyAdd", {
            vendors: formatJoin(requiredLabels, locale),
          }),
      tone: ready ? "ready" : "muted",
    };
  });
}
