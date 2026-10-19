import { Plug } from "lucide-react";
import type { ReactElement } from "react";

import { hasRuntimeIcon, RuntimeIcon, VendorIcon } from "@/shared/ui/brand-icons";

import { t } from "./i18n";

// Copy deck §4, drawn as a readable matrix (#123): which model protocols each
// runtime accepts. Runtime ids, providers and protocols mirror the main repo's
// runtime catalog (pkgs/runtime-catalog catalog.ts RUNTIMES and VENDORS;
// docs/prd/runtime-catalog.md). The list itself is the claim, so the copy
// carries no provider count.
const PROTOCOLS = ["Chat Completions", "Responses", "Anthropic Messages", "Google Gemini"] as const;

type Protocol = (typeof PROTOCOLS)[number];

type Runtime = {
  readonly id: string;
  readonly name: string;
  readonly protocols: string;
  readonly accepts: readonly Protocol[];
  readonly note?: string;
};

function runtimes(): readonly Runtime[] {
  return [
    { id: "openai-runtime", name: "OpenAI Codex", protocols: "Responses", accepts: ["Responses"] },
    {
      id: "claude-agent-sdk",
      name: "Claude Agent SDK",
      protocols: t("Anthropic Messages (Anthropic models)"),
      accepts: ["Anthropic Messages"],
      note: t("Anthropic models"),
    },
    { id: "acp-fallback", name: "OpenCode", protocols: t("All 4"), accepts: PROTOCOLS },
    {
      id: "pi",
      name: "Pi",
      protocols: t("All 4 (text input)"),
      accepts: PROTOCOLS,
      note: t("text input"),
    },
  ];
}

const PROVIDERS = [
  { iconKey: "anthropic", name: "Anthropic" },
  { iconKey: "openai", name: "OpenAI" },
  { iconKey: "deepseek", name: "DeepSeek" },
  { iconKey: "gemini", name: "Gemini" },
  { iconKey: "qwen", name: "Qwen" },
  { iconKey: "kimi", name: "Kimi" },
  { iconKey: "zhipu", name: "Zhipu" },
  { iconKey: "minimax", name: "MiniMax" },
  { iconKey: "opencode", name: "OpenCode Zen" },
] as const;

/** The runtime's brand mark, or a text mark where the site has no mark. */
function RuntimeMark({ runtime }: { runtime: Runtime }): ReactElement | null {
  if (hasRuntimeIcon(runtime.id)) {
    return <RuntimeIcon runtimeId={runtime.id} size={22} className="size-[22px] shrink-0" />;
  }
  return (
    <span
      aria-hidden="true"
      className="bg-ink-900 text-paper-100 inline-flex size-[22px] shrink-0 items-center justify-center rounded-[5px] font-mono text-[11px] font-semibold"
    >
      {runtime.name}
    </span>
  );
}

function RuntimeName({ runtime }: { runtime: Runtime }): ReactElement {
  return (
    <span className="flex items-center gap-3">
      <RuntimeMark runtime={runtime} />
      <span className="min-w-0">
        <span translate="no" className="text-ink-900 block text-[17px] font-semibold">
          {runtime.name}
        </span>
        <code translate="no" className="text-ink-500 block font-mono text-[14px]">
          {runtime.id}
        </code>
      </span>
    </span>
  );
}

/** Wide screens: runtime rows against protocol columns, every name spelled out. */
function Matrix(): ReactElement {
  return (
    <table className="hidden w-full border-collapse text-left md:table">
      <caption className="sr-only">{t("Model protocols")}</caption>
      <thead>
        <tr>
          <th scope="col" className="text-ink-500 w-[30%] pb-4 text-[15px] font-semibold">
            {t("Runtimes")}
          </th>
          {PROTOCOLS.map((protocol) => (
            <th
              key={protocol}
              scope="col"
              translate="no"
              className="text-ink-900 px-3 pb-4 text-center font-mono text-[14px] font-medium"
            >
              {protocol}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {runtimes().map((runtime) => (
          <tr key={runtime.id} className="border-t border-[rgba(109,120,106,0.35)]">
            <th scope="row" className="py-4 pr-4 align-middle font-normal">
              <RuntimeName runtime={runtime} />
            </th>
            {PROTOCOLS.map((protocol) => {
              const accepted = runtime.accepts.includes(protocol);
              return (
                <td key={protocol} className="px-3 py-4 text-center align-middle">
                  {accepted ? (
                    <span className="inline-flex flex-col items-center gap-1">
                      <span aria-hidden="true" className="bg-ink-900 block h-[5px] w-[22px] rounded-[1px]" />
                      <span className="sr-only">{t("Accepted")}</span>
                      {runtime.note !== undefined && runtime.accepts.length === 1 ? (
                        <span className="text-ink-500 text-[14px]">{runtime.note}</span>
                      ) : null}
                    </span>
                  ) : (
                    <span className="text-ink-400 text-[15px]">
                      <span aria-hidden="true">·</span>
                      <span className="sr-only">{t("Not accepted")}</span>
                    </span>
                  )}
                </td>
              );
            })}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

/** Phones: one row per runtime, its protocols in words. */
function RuntimeList(): ReactElement {
  return (
    <ul className="md:hidden">
      {runtimes().map((runtime) => (
        <li key={runtime.id} className="border-t border-[rgba(109,120,106,0.35)] py-4">
          <RuntimeName runtime={runtime} />
          <p className="text-ink-700 mt-2 ml-[34px] text-[16px] leading-[1.5]">
            <span className="sr-only">{t("Model protocols")}: </span>
            {runtime.protocols}
          </p>
        </li>
      ))}
    </ul>
  );
}

export function SupplyWall(): ReactElement {
  return (
    <section id="runtimes" aria-labelledby="supply-title" className="v2a-section v2a-section-first">
      <span aria-hidden="true" className="v2a-node" style={{ top: 110 }} />
      <h2 id="supply-title" className="v2a-display v2a-h2">
        {t("Pick a runtime. Use your own model key.")}
      </h2>
      <p className="v2a-intro">
        {t(
          "4 runtimes, the providers below, or any OpenAI-compatible HTTPS endpoint. mosoo checks the runtime, model, and protocol before anything runs.",
        )}
      </p>

      <div className="mt-12">
        <Matrix />
        <RuntimeList />
      </div>

      <div className="mt-12 border-t border-[rgba(109,120,106,0.35)] pt-8">
        <h3 className="text-ink-900 text-[17px] font-semibold">{t("Model providers (your keys)")}</h3>
        <ul className="mt-5 flex flex-wrap gap-x-7 gap-y-4">
          {PROVIDERS.map((provider) => (
            <li key={provider.iconKey} className="flex items-center gap-2.5">
              <VendorIcon vendorId={provider.iconKey} size={20} className="size-5 shrink-0" />
              <span translate="no" className="text-ink-900 text-[17px]">
                {provider.name}
              </span>
            </li>
          ))}
          <li className="text-ink-900 flex items-center gap-2.5">
            <Plug aria-hidden="true" className="text-ink-700 size-5 shrink-0" />
            <span className="text-[17px]">{t("Custom OpenAI-compatible endpoint")}</span>
          </li>
        </ul>
        <div className="text-ink-500 mt-8 space-y-1.5 text-[16px] leading-[1.6]">
          <p>{t("Provider keys belong to your Project, and the provider bills your account directly.")}</p>
          <p>{t("Names and logos identify compatible services and don’t imply a partnership or endorsement.")}</p>
        </div>
      </div>
    </section>
  );
}
