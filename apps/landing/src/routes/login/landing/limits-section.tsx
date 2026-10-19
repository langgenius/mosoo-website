import type { ReactElement } from "react";

import { t } from "./i18n";
import { SectionHeading } from "./ui";

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

export function LimitsSection(): ReactElement {
  return (
    <section id="limits" aria-labelledby="limits-title" className="px-4 py-20 md:px-6 md:py-24">
      <SectionHeading
        id="limits-title"
        title={t("Some things are out of scope on purpose")}
        intro={t("The product spec lists these on purpose. Plan around them before you build.")}
      />
      {/* Phones stack each row: the gap, then what to do instead. */}
      <table className="mt-10 w-full border-collapse text-left max-sm:block">
        <thead className="max-sm:sr-only">
          <tr className="text-ink-500 text-[14px]">
            <th scope="col" className="w-[45%] pr-6 pb-3 font-semibold">
              {t("Not included")}
            </th>
            <th scope="col" className="pb-3 font-semibold">
              {t("Do this instead")}
            </th>
          </tr>
        </thead>
        <tbody className="max-sm:block">
          {limits().map((row) => (
            <tr key={row.notIncluded} className="border-border-strong border-t max-sm:block max-sm:py-4">
              <th
                scope="row"
                className="text-ink-900 py-4 pr-6 align-top text-[16px] leading-[1.5] font-semibold max-sm:block max-sm:p-0"
              >
                {row.notIncluded}
              </th>
              <td className="text-ink-500 py-4 align-top text-[16px] leading-[1.55] max-sm:block max-sm:p-0 max-sm:pt-1">
                {row.instead}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
