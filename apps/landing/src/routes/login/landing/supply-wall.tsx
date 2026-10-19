import { Check, Minus, Plug } from "lucide-react";
import type { ReactElement } from "react";

import { locale } from "@/shared/locale";
import { hasRuntimeIcon, RuntimeIcon, VendorIcon } from "@/shared/ui/brand-icons";

import { t, tp } from "./i18n";
import { PHRASE_CLASS, Phrases, SectionHeading } from "./ui";

// Copy deck §4. Runtime ids, providers and protocols mirror the main repo's
// runtime catalog (pkgs/runtime-catalog catalog.ts RUNTIMES and VENDORS;
// docs/prd/runtime-catalog.md: "OpenCode and Pi accept all four protocols,
// OpenAI Runtime only Responses, and Claude Agent SDK only Anthropic Messages
// for Anthropic models"). The list itself is the claim, so the copy carries
// no provider count.
const PROTOCOLS = ["Chat Completions", "Responses", "Anthropic Messages", "Google Gemini"] as const;

type Protocol = (typeof PROTOCOLS)[number];

const RUNTIMES: readonly { id: string; name: string; accepts: readonly Protocol[] }[] = [
  { id: "openai-runtime", name: "OpenAI Codex", accepts: ["Responses"] },
  { id: "claude-agent-sdk", name: "Claude Agent SDK", accepts: ["Anthropic Messages"] },
  { id: "acp-fallback", name: "OpenCode", accepts: PROTOCOLS },
  { id: "pi", name: "Pi", accepts: PROTOCOLS },
];

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
function RuntimeMark({ id, name }: { id: string; name: string }): ReactElement {
  if (hasRuntimeIcon(id)) {
    return <RuntimeIcon runtimeId={id} size={20} className="size-5 shrink-0" />;
  }
  return (
    <span
      aria-hidden="true"
      className="bg-ink-900 text-paper-100 inline-flex size-5 shrink-0 items-center justify-center rounded-[4px] font-mono text-[11px] font-semibold"
    >
      {name}
    </span>
  );
}

/** Phones: each runtime with the protocols it accepts, as plain text. */
function ProtocolList(): ReactElement {
  const separator = locale === "en" ? ", " : "、";
  return (
    <ul className="border-border-strong border-t sm:hidden">
      {RUNTIMES.map((runtime) => (
        <li key={runtime.id} className="border-border-strong flex gap-3 border-b py-3.5">
          <RuntimeMark id={runtime.id} name={runtime.name} />
          <div className="min-w-0">
            <p className="flex flex-wrap items-baseline gap-x-2.5">
              <span translate="no" className="text-ink-900 text-[16px] font-semibold">
                {runtime.name}
              </span>
              <code translate="no" className="text-ink-500 font-mono text-[14px]">
                {runtime.id}
              </code>
            </p>
            <p translate="no" className="text-ink-700 mt-1 text-[15px] leading-[1.5]">
              {runtime.accepts.join(separator)}
            </p>
          </div>
        </li>
      ))}
    </ul>
  );
}

function ProtocolMatrix(): ReactElement {
  return (
    <div className="border-border-strong overflow-hidden rounded-[14px] border max-sm:hidden">
      <table className="w-full border-collapse text-left">
        <caption className="sr-only">{t("Runtimes and the model protocols they accept")}</caption>
        <thead>
          <tr className="border-border-strong bg-paper-50 border-b">
            <th scope="col" className="text-ink-500 px-4 py-3 text-[14px] font-semibold">
              {t("Runtime")}
            </th>
            {PROTOCOLS.map((protocol) => (
              <th
                key={protocol}
                scope="col"
                translate="no"
                className="text-ink-900 px-3 py-3 text-center text-[14px] font-semibold"
              >
                {protocol}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {RUNTIMES.map((runtime) => (
            <tr key={runtime.id} className="border-border-soft border-t first:border-t-0">
              <th scope="row" className="px-4 py-3 align-middle font-normal">
                <span className="flex items-center gap-3">
                  <RuntimeMark id={runtime.id} name={runtime.name} />
                  <span>
                    <span translate="no" className="text-ink-900 block text-[16px] font-semibold whitespace-nowrap">
                      {runtime.name}
                    </span>
                    <code translate="no" className="text-ink-500 block font-mono text-[14px]">
                      {runtime.id}
                    </code>
                  </span>
                </span>
              </th>
              {PROTOCOLS.map((protocol) =>
                runtime.accepts.includes(protocol) ? (
                  <td key={protocol} className="px-3 py-3 text-center align-middle">
                    <Check aria-hidden="true" className="inline-block size-5 text-green-700" strokeWidth={2.25} />
                    <span className="sr-only">{t("Accepted")}</span>
                  </td>
                ) : (
                  <td key={protocol} className="px-3 py-3 text-center align-middle">
                    <Minus aria-hidden="true" className="text-ink-300 inline-block size-4" />
                    <span className="sr-only">{t("Not accepted")}</span>
                  </td>
                ),
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function SupplyWall(): ReactElement {
  return (
    <section id="runtimes" aria-labelledby="supply-title" className="px-4 py-16 md:px-6">
      <SectionHeading
        id="supply-title"
        scale="evidence"
        title={tp("Every Session runs one of 4 runtimes on your own model key.")}
        intro={t(
          "Pick the runtime and model per Session. Models run on your keys for the providers below, or on a custom OpenAI-compatible endpoint at a public HTTPS URL. mosoo checks that the runtime, model, and protocol fit before anything runs.",
        )}
      />

      {/* Wide screens set the runtime matrix and the provider grid side by
          side: two views of one supply, read across. */}
      <div className="mt-10 grid grid-cols-1 gap-x-10 gap-y-10 xl:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
        <div className="min-w-0">
          <h3 className={`${PHRASE_CLASS} text-ink-900 text-[18px] font-semibold`}>
            <Phrases text={tp("Runtimes and the model protocols they accept")} />
          </h3>
          <div className="mt-4">
            <ProtocolMatrix />
            <ProtocolList />
          </div>
          <ul className="text-ink-700 mt-3 flex flex-col gap-1 text-[15px] leading-[1.55]">
            <li>{t("Claude Agent SDK runs Anthropic models only.")}</li>
            <li>{t("Pi takes text input only. Files reach it through the Session workspace.")}</li>
          </ul>
        </div>

        <div className="min-w-0">
          <h3 className={`${PHRASE_CLASS} text-ink-900 text-[18px] font-semibold`}>
            <Phrases text={tp("Model providers (your keys)")} />
          </h3>
          {/* A hairline grid of names: these are compatible services, not buttons. */}
          <ul className="border-border-strong mt-4 grid grid-cols-2 border-t border-l sm:grid-cols-3 xl:grid-cols-2">
            {PROVIDERS.map((provider) => (
              <li
                key={provider.iconKey}
                className="border-border-strong flex min-h-12 items-center gap-2.5 border-r border-b px-3.5 py-2.5"
              >
                <VendorIcon vendorId={provider.iconKey} size={18} className="size-[18px] shrink-0" />
                <span translate="no" className="text-ink-900 text-[16px]">
                  {provider.name}
                </span>
              </li>
            ))}
            <li className="border-border-strong text-ink-700 flex min-h-12 items-center gap-2.5 border-r border-b px-3.5 py-2.5 max-sm:col-span-2">
              <Plug aria-hidden="true" className="size-[18px] shrink-0" />
              <span className={`${PHRASE_CLASS} text-[15px] leading-[1.4]`}>
                <Phrases text={tp("Custom OpenAI-compatible endpoint (public HTTPS)")} />
              </span>
            </li>
          </ul>
          <div className="text-ink-500 mt-3 space-y-1 text-[15px] leading-[1.55]">
            <p>{t("Provider keys belong to your Project, and the provider bills your account directly.")}</p>
            <p>{t("Names and logos identify compatible services and don’t imply a partnership or endorsement.")}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
