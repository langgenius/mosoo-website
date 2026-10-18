import { t } from "@/shared/i18n";

import { MOSOO_CLOUD_URL, MOSOO_COMPUTER_URL } from "./links";

export type Product = {
  readonly id: "mosoo" | "computer";
  /** Product names are brand terms and stay untranslated. */
  readonly name: string;
  readonly description: string;
  readonly href: string;
};

// The two top-level product entry points shown under "Products" in the site
// chrome: the topbar menu, the mobile menu and the footer. The brand is
// lowercase "mosoo"; Mosoo Computer is a separate product and keeps its capital.
export const PRODUCTS: readonly Product[] = [
  {
    id: "mosoo",
    name: "mosoo",
    description: t("Open-source Agent runtime for application backends."),
    href: MOSOO_CLOUD_URL,
  },
  {
    id: "computer",
    name: "Mosoo Computer",
    description: t("A persistent cloud computer for agents."),
    href: MOSOO_COMPUTER_URL,
  },
];

export function productHost(product: Product): string {
  return new URL(product.href).host;
}

// Shared by the real trigger and its pre-idle fallback so the topbar does not
// shift when the menu chunk arrives.
export const PRODUCTS_TRIGGER_CLASS =
  "group text-fg-2 hover:text-fg-1 focus-visible:ring-ring data-[open]:text-fg-1 inline-flex h-9 items-center gap-1 rounded-md px-3 text-[14px] font-semibold transition-colors outline-none focus-visible:ring-2";
