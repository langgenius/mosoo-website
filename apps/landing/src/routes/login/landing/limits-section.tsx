import type { ReactElement } from "react";

import { t } from "./i18n";
import { Phrases, SpecCite } from "./ui";

// Copy deck §9: what docs/SPEC.md §8 rules out, each paired with something
// mosoo really offers instead.
function limits(): readonly { notIncluded: string; instead: string }[] {
  return [
    { notIncluded: t("Webhooks"), instead: t("Stream events over SSE, or read the saved history.") },
    {
      notIncluded: t("Interactive tool approvals"),
      instead: t("Agents run with full access inside the Session’s own sandbox."),
    },
    {
      notIncluded: t("Models, credits, billing, or a spending cap"),
      instead: t(
        "Use your own provider key. The provider bills you, and the usage API lists every model call.",
      ),
    },
    {
      notIncluded: t("Git mounting, private repository access, or branch and PR workflows"),
      instead: t("Pass a public URL with an exact commit, or upload the files."),
    },
    {
      notIncluded: t("Your own runtimes, a connector marketplace, or local MCP servers"),
      instead: t("Pick one of the 4 runtimes and connect remote HTTPS MCP servers."),
    },
    {
      notIncluded: t("An online file editor or file manager"),
      instead: t("Upload inputs and download artifacts through the API."),
    },
    {
      notIncluded: t("Chat channels or a personal cloud computer"),
      instead: t("That’s Mosoo Computer, a separate product."),
    },
  ];
}

/**
 * The third ledger of #your-app-and-mosoo (v3 folds the old #limits section
 * into the split): what neither your app nor mosoo provides, in soil, each
 * row paired with what to do instead. A nested section with id="limits", so
 * old anchors and the static fallback's section list still match.
 */
export function LimitsLedger(): ReactElement {
  return (
    <section id="limits" aria-labelledby="limits-title" className="mt-14 scroll-mt-24">
      <h3 id="limits-title" className="v2a-h3 v2a-soil">
        <Phrases text={t("mosoo leaves these out on purpose.")} />
      </h3>
      <SpecCite section="s8" />
      <p className="text-ink-500 mt-2 text-[16px] leading-[1.6]">{t("Plan around them before you build.")}</p>
      {/* Soil, the console's boundary colour, marks what is not included;
          phones stack each row: the gap, then what to do instead. */}
      <table className="mt-5 w-full border-collapse text-left max-sm:block">
        <thead className="max-sm:sr-only">
          <tr className="text-[14px]">
            <th scope="col" className="v2a-soil w-[46%] pr-6 pb-3 font-mono font-medium">
              {t("Not included")}
            </th>
            <th scope="col" className="v2a-label pb-3 font-medium">
              {t("Do this instead")}
            </th>
          </tr>
        </thead>
        <tbody className="max-sm:block">
          {limits().map((row) => (
            <tr key={row.notIncluded} className="v2a-limit-row max-sm:block max-sm:py-3">
              <th
                scope="row"
                className="v2a-soil py-3 pr-6 align-top text-[16px] leading-[1.5] font-semibold max-sm:block max-sm:p-0"
              >
                <span aria-hidden="true" className="v2a-limit-mark" />
                {row.notIncluded}
              </th>
              <td className="text-ink-700 py-3 align-top text-[16px] leading-[1.55] max-sm:block max-sm:p-0 max-sm:pt-1">
                {row.instead}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
