// Home copy, written to the slot sizes in staging v4d/UI-LOCK.md §3 and
// checked against the main repo (staging v4d/CHANGELOG.md cites file:line).
// The strings live in home-copy.json so the static no-JS home
// (scripts/landing-home.mjs), its FAQPage JSON-LD and the React page read one
// source. A string that does not fit its slot is rewritten, never given a
// new slot.

import type { Locale } from "@/shared/locale";
import { locale } from "@/shared/locale";

import COPY from "./home-copy.json";

export type Satellite = { key: string; value: string };
export type SupplyCard = { name: string; badge: string; value: string; label: string; status: string };
export type Faq = { q: string; a: string };

export type HomeCopy = {
  hero: { h1a: string; h1b: string; lead: string; primary: string; secondary: string };
  object: { line: string; event: string; satellites: readonly Satellite[] };
  verbs: readonly { verb: string; desc: string }[];
  stack: { label: string; token: string; status: string; title: string; desc: string };
  supply: { a: string; b: string; cards: readonly SupplyCard[] };
  faq: { label: string; a: string; b: string; items: readonly Faq[] };
  close: { a: string; b: string; legend: string; prompt: string; button: string; done: string; fine: string };
};

const HOME: Record<Locale, HomeCopy> = COPY;

export const home = HOME[locale];

// Fixed by the UI lock, not by the copy: the Harness satellite carries the
// OpenAI Codex mark, the cards' glyphs and the one green dot (Resume).
export const HARNESS_SATELLITE = 1;
export const CARD_GLYPH_KEYS = ["terminal", "resume", "keys"] as const;
export const LIVE_CARD = 1;
