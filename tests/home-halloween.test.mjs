import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import {
  HALLOWEEN_ENABLED,
  HALLOWEEN_END,
  HALLOWEEN_START,
  isHalloween,
} from "../apps/landing/src/home/halloween/halloween.ts";
import { renderLandingLocale } from "../scripts/landing-locales.mjs";

// The Halloween accents (apps/landing/src/home/halloween/, owner 2026-10-29: 「来点万圣节氛围，点缀即可」): shown from
// HALLOWEEN_START through HALLOWEEN_END in the reader's own calendar, or as ?halloween=1 / 0 says, and decided in the
// browser, so the prerendered page is the same whatever day it was built. The tests read the dates from the module, so
// moving the window or switching it off keeps them true. Delete this file with the folder.

const LOCALES = ["en", "zh", "ja"];
const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");

/** A local time on a YYYY-MM-DD day plus `days` (the reader's calendar, as isHalloween reads it). */
function at(ymd, days = 0, hours = 12) {
  const [year, month, date] = ymd.split("-").map(Number);
  return new Date(year, month - 1, date + days, hours);
}

const enabled = { skip: !HALLOWEEN_ENABLED && "HALLOWEEN_ENABLED is false" };
const disabled = { skip: HALLOWEEN_ENABLED && "HALLOWEEN_ENABLED is true" };

test("the accents show from the first through the last day of the window, in local time", enabled, () => {
  assert.match(HALLOWEEN_START, /^\d{4}-\d{2}-\d{2}$/);
  assert.match(HALLOWEEN_END, /^\d{4}-\d{2}-\d{2}$/);
  assert.ok(HALLOWEEN_START <= HALLOWEEN_END, "the window starts before it ends");
  assert.equal(isHalloween(at(HALLOWEEN_START, -1, 23)), false, "the evening before");
  assert.equal(isHalloween(at(HALLOWEEN_START, 0, 0)), true, "the first midnight");
  assert.equal(isHalloween(at(HALLOWEEN_END, 0, 23)), true, "the last evening");
  assert.equal(isHalloween(at(HALLOWEEN_END, 1, 0)), false, "the midnight after: off by itself");
  assert.equal(isHalloween(at(HALLOWEEN_START, 365)), false, "a year later: the window names its year");
});

test("?halloween=1 shows the accents on any day and ?halloween=0 hides them", enabled, () => {
  const before = at(HALLOWEEN_START, -30);
  const during = at(HALLOWEEN_START);
  assert.equal(isHalloween(before, "?halloween=1"), true);
  assert.equal(isHalloween(during, "?halloween=0"), false);
  assert.equal(isHalloween(during, "?utm_source=x&halloween=0"), false, "among other parameters");
  assert.equal(isHalloween(before, "?halloween=yes"), false, "any other value leaves it to the day");
  assert.equal(isHalloween(during, "?halloween=yes"), true);
});

test("HALLOWEEN_ENABLED = false hides the accents on every day, whatever the query", disabled, () => {
  assert.equal(isHalloween(at(HALLOWEEN_START)), false);
  assert.equal(isHalloween(at(HALLOWEEN_START), "?halloween=1"), false);
});

test("the prerendered home carries no accent: the reader's browser adds them (en, zh, ja)", () => {
  for (const locale of LOCALES) {
    assert.doesNotMatch(renderLandingLocale(read("apps/landing/index.html"), locale), /v5-hw-|data-halloween/, locale);
  }
});

test("the accents are decoration: aria-hidden, no pointer, motion only for readers who allow it", () => {
  const module = read("apps/landing/src/home/halloween/halloween.ts");
  const css = read("apps/landing/src/home/halloween/halloween.css");
  for (const name of ["v5-hw-ghost", "v5-hw-web"]) {
    assert.match(module, new RegExp(`class="${name}" aria-hidden="true"`), `${name} is aria-hidden`);
    assert.match(css, new RegExp(`\\.${name} \\{[^}]*pointer-events: none;`), `${name} takes no pointer`);
  }
  const motion = /@media \(prefers-reduced-motion: no-preference\) \{([\s\S]*?)\n\}/.exec(css)?.[1] ?? "";
  assert.match(motion, /animation:/, "the accents' motion");
  assert.doesNotMatch(css.replace(motion, ""), /\banimation:/, "no animation outside that media query");
});
