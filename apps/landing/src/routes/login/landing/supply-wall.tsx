import { Plug } from "lucide-react";
import type { ReactElement } from "react";

import { hasRuntimeIcon, RuntimeIcon, VendorIcon } from "@/shared/ui/brand-icons";

import { t } from "./i18n";
import { SectionHeading } from "./ui";

// Copy deck §4. Runtime ids, providers and protocols mirror the main repo's
// runtime catalog (pkgs/runtime-catalog catalog.ts RUNTIMES and VENDORS;
// docs/prd/runtime-catalog.md). The list itself is the claim, so the copy
// carries no provider count.
type Runtime = { readonly id: string; readonly name: string; readonly protocols: string };

function runtimes(): readonly Runtime[] {
  return [
    { id: "openai-runtime", name: "OpenAI Codex", protocols: "Responses" },
    {
      id: "claude-agent-sdk",
      name: "Claude Agent SDK",
      protocols: t("Anthropic Messages (Anthropic models)"),
    },
    { id: "acp-fallback", name: "OpenCode", protocols: t("All 4") },
    { id: "pi", name: "Pi", protocols: t("All 4 (text input)") },
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

const PROTOCOLS = ["Chat Completions", "Responses", "Anthropic Messages", "Google Gemini"] as const;

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

export function SupplyWall(): ReactElement {
  return (
    <section aria-labelledby="supply-title" className="px-4 py-20 md:px-6 md:py-24">
      <SectionHeading
        id="supply-title"
        title={t("Pick a runtime. Use your own model key.")}
        intro={t(
          "4 runtimes, the providers below, or any OpenAI-compatible HTTPS endpoint. mosoo checks the runtime, model, and protocol before anything runs.",
        )}
      />

      <div className="mt-12 grid grid-cols-1 gap-12 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] lg:gap-14">
        <div>
          <h3 className="text-ink-900 text-[18px] font-semibold">{t("Runtimes")}</h3>
          <table className="mt-4 w-full border-collapse text-left">
            <thead>
              <tr className="text-ink-500 text-[14px]">
                <th scope="col" className="pr-4 pb-3 font-semibold">
                  {t("Name")}
                </th>
                <th scope="col" className="hidden pr-4 pb-3 font-semibold sm:table-cell">
                  {t("API id")}
                </th>
                <th scope="col" className="pb-3 font-semibold [overflow-wrap:anywhere]">
                  {t("Model protocols")}
                </th>
              </tr>
            </thead>
            <tbody>
              {runtimes().map((runtime) => (
                <tr key={runtime.id} className="border-border-strong border-t">
                  <th scope="row" className="py-4 pr-3 align-top font-normal sm:pr-4">
                    <span className="flex items-center gap-3">
                      <RuntimeMark runtime={runtime} />
                      <span translate="no" className="text-ink-900 text-[16px] font-semibold sm:whitespace-nowrap">
                        {runtime.name}
                      </span>
                    </span>
                    <code
                      translate="no"
                      className="text-ink-500 mt-1.5 ml-[34px] block font-mono text-[13px] sm:hidden"
                    >
                      {runtime.id}
                    </code>
                  </th>
                  <td className="hidden py-4 pr-4 align-top sm:table-cell">
                    <code translate="no" className="text-ink-700 font-mono text-[14px] leading-[22px] whitespace-nowrap">
                      {runtime.id}
                    </code>
                  </td>
                  <td className="text-ink-700 py-4 align-top text-[16px] leading-[22px] [overflow-wrap:anywhere]">{runtime.protocols}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div>
          <h3 className="text-ink-900 text-[18px] font-semibold">{t("Model providers (your keys)")}</h3>
          <ul className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
            {PROVIDERS.map((provider) => (
              <li
                key={provider.iconKey}
                className="border-border-strong bg-paper-50 flex min-h-12 items-center gap-2.5 rounded-[10px] border px-3 py-2"
              >
                <VendorIcon vendorId={provider.iconKey} size={20} className="size-5 shrink-0" />
                <span translate="no" className="text-ink-900 text-[16px] font-semibold">
                  {provider.name}
                </span>
              </li>
            ))}
            <li className="border-ink-400 text-ink-900 col-span-2 flex min-h-12 items-center gap-2.5 rounded-[10px] border border-dashed px-3 py-2 sm:col-span-3">
              <Plug aria-hidden="true" className="text-ink-700 size-5 shrink-0" />
              <span className="text-[16px] font-semibold">{t("Custom OpenAI-compatible endpoint")}</span>
            </li>
          </ul>

          <h3 className="text-ink-900 mt-9 text-[18px] font-semibold">{t("Model protocols")}</h3>
          <ul className="mt-4 flex flex-wrap gap-2">
            {PROTOCOLS.map((protocol) => (
              <li
                key={protocol}
                translate="no"
                className="border-border-strong text-ink-700 rounded-full border px-3 py-1 font-mono text-[13px]"
              >
                {protocol}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="border-border-soft text-ink-500 mt-12 space-y-1.5 border-t pt-5 text-[16px] leading-[1.6]">
        <p>{t("Provider keys belong to your Project, and the provider bills your account directly.")}</p>
        <p>{t("Names and logos identify compatible services and don’t imply a partnership or endorsement.")}</p>
      </div>
    </section>
  );
}
