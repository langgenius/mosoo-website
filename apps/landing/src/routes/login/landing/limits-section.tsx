import { Ban } from "lucide-react";
import type { ReactElement } from "react";

import { t, tp } from "./i18n";
import { PHRASE_CLASS, Phrases, SectionHeading } from "./ui";

// Copy deck §9: what docs/SPEC.md §8 rules out, each paired with something
// mosoo really offers instead.
function limits(): readonly { notIncluded: string; instead: string }[] {
  return [
    { notIncluded: tp("Webhooks"), instead: t("Stream events over SSE, or read the saved history.") },
    {
      notIncluded: tp("Interactive tool approvals"),
      instead: t("Agents run with full access inside the Session’s own sandbox."),
    },
    {
      notIncluded: tp("Models, credits, billing, or a spending cap"),
      instead: t("Use your own provider key. The provider bills you, and the usage API lists every model call."),
    },
    {
      notIncluded: tp("Git mounting, private repository access, or branch and PR workflows"),
      instead: t("Pass a public URL with an exact commit, or upload the files."),
    },
    {
      notIncluded: tp("Your own runtimes, a connector marketplace, or local MCP servers"),
      instead: t("Pick one of the 4 runtimes and connect remote HTTPS MCP servers."),
    },
    {
      notIncluded: tp("An online file editor or file manager"),
      instead: t("Upload inputs and download artifacts through the API."),
    },
    {
      notIncluded: tp("Chat channels or a personal cloud computer"),
      instead: t("That’s Mosoo Computer, a separate product."),
    },
  ];
}

export function LimitsSection(): ReactElement {
  return (
    <section id="limits" aria-labelledby="limits-title" className="px-4 py-16 md:px-6">
      <SectionHeading
        id="limits-title"
        scale="evidence"
        title={tp("mosoo has no Webhooks, tool approvals, or billing.")}
        intro={t("Plan around these before you build. Each row says what to use instead.")}
      />
      {/* Phones stack each row and repeat the column names inside it, so a
          reader who lands mid-list still sees which side is which. The
          explicit roles keep the table semantics when the rows are blocks. */}
      <table role="table" className="mt-10 w-full border-collapse text-left max-sm:block">
        <thead role="rowgroup" className="max-sm:sr-only">
          <tr role="row" className="text-ink-500 text-[14px]">
            <th scope="col" role="columnheader" className="w-[45%] pr-6 pb-3 font-semibold">
              {t("Not included")}
            </th>
            <th scope="col" role="columnheader" className="pb-3 font-semibold">
              {t("Use instead")}
            </th>
          </tr>
        </thead>
        <tbody role="rowgroup" className="max-sm:block">
          {limits().map((row) => (
            <tr key={row.notIncluded} role="row" className="border-border-strong border-t max-sm:block max-sm:py-4">
              <th scope="row" role="rowheader" className="py-3 pr-6 align-top font-normal max-sm:block max-sm:p-0">
                <span
                  aria-hidden="true"
                  className="text-ink-700 mb-1.5 inline-flex items-center gap-1.5 text-[14px] font-semibold sm:hidden"
                >
                  <Ban className="size-3.5" />
                  {t("Not included")}
                </span>
                <span className={`${PHRASE_CLASS} text-ink-900 block text-[16px] leading-[1.5] font-semibold`}>
                  <Phrases text={row.notIncluded} />
                </span>
              </th>
              <td role="cell" className="text-ink-700 py-3 align-top text-[16px] leading-[1.55] max-sm:block max-sm:p-0 max-sm:pt-1.5">
                <span aria-hidden="true" className="text-ink-500 mr-1.5 font-semibold sm:hidden">
                  {t("Instead:")}
                </span>
                {row.instead}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
