# Product kit

Console product moments for the website, ported from the mosoo console and all telling one story: the CSV acceptance run from `langgenius/mosoo` `scripts/public-api-session-workflow.ts` (input.csv, `grand_total` 230, a follow-up seven days later to 250 with the same private nonce hash, then a cancelled turn). Nothing here is imported by a page yet.

## Use

```tsx
import { PreviewReplay, SessionContinuation, TurnReceipt } from "@/product-kit";

<TurnReceipt locale="en" animate />
<SessionContinuation locale="zh" animate showCancelledTurn />
```

Every component:

- takes `locale` (`"en" | "zh" | "ja"`) and `animate` (default `false`);
- renders its final state on the first render, so the end state is in the HTML, in screenshots and for reduced-motion visitors;
- with `animate`, replays its last step once (3 to 5 s) the first time it is half visible, unless the visitor prefers reduced motion, and then shows a small "Replay" text control (the console's own `agent.replay` string);
- takes `replayAt` (ms) to render a frozen frame of the replay, for stills and docs;
- renders its own `[data-surface="console"]` root with a `lang` attribute, a footer that says "Example", and no outer frame: put it in your stage shell.

| Component | Moment | Extra props |
| --- | --- | --- |
| `TurnReceipt` | PM-01 turn card, SessionTimelineBar, legend, event rows (CSV turn 1) | `turn?: 1 \| 2` |
| `SessionContinuation` | PM-02 turn 1, "+7 days · sandbox reclaimed", restore, turn 2, the two JSON outputs with the hash rows aligned | `showCancelledTurn?: boolean` |
| `PreviewReplay` | PM-03 the console Preview replaying turn 1 at the console's stream pace | |
| `RuntimeMatrix` | PM-04 runtime cards; a click filters the models; locked vendors in the product's "Provider key required" state | `defaultRuntimeId?: string` (default `acp-fallback`, OpenCode) |
| `RuntimeAvailability` | PM-05 the Providers page's runtime availability rows | |
| `KeyBoundary` | PM-08 SVG of the credential boundary, with the Environment-variables exception | |
| `ApiCall` | PM-11 the content-truth `curl`, highlighted, with Copy, and its 201 response | |
| `CodingAgentSetup` | PM-10 both onboarding lanes, the install command, the copyable setup prompt, the console steps | `progress?: "done" \| "todo"`, `heading?: boolean` |

`ConsoleIsland` is exported for compositions of your own; `exampleUniverse` exports the story's data (prompts, events, outputs, IDs).

## The island

- `console-island.css` comes with any component import. It declares the console's tokens on `[data-surface="console"]` and compiles its own Tailwind utilities nested under that selector, scanning this folder only, so the console's meaning of `bg-primary` (lime), `text-primary-foreground` (dark ink `#0f1a02`, where the website's bridge is a literal `#ffffff`), `text-brand`, `rounded-md` (6px) and the rest wins inside the island and nothing changes outside it. `tests/product-kit.test.mjs` compiles the island and fails on any unscoped rule or `:root` output; `preview/control.html` against `preview/?probes=1` compares website elements with and without the kit (no differences at the time of writing).
- Keyframes are renamed `console-*`; the console's reduced-motion branches are kept.
- Layout answers the island's width (container queries): below 36rem rows drop columns and panels stack; the key diagram switches to a stacked layout below 42rem.
- Sizes are the console's (13 to 14.5px UI text). To show a moment larger, scale a wrapper with CSS `zoom` (for example `zoom: 1.125`) rather than changing font sizes, so the 4px grid holds. `ApiCall` sets code at `--kit-code-size` (default `1rem`); set it to the page's body size.
- No file in this folder may spell a Tailwind theme variable name (font, ease, colour, radius and similar namespaces): Tailwind's scanner counts the string as a use and emits the variable on `:root`, over the website's own. The test checks this.

When you integrate, add one line to `apps/landing/src/shared/styles/app.css`:

```css
@source not "../../product-kit";
```

The website's own Tailwind build scans the whole app, so today it also emits global copies of the kit's utilities (about 2 KB gzip on every page, additions only). The island compiles everything it needs itself, so excluding the folder from the website build changes nothing in the kit.

## Data

- `data/example-universe.ts`: the story. Prompts, `input.csv`, the default instructions and the assertions are quoted from the script. IDs, timestamps, durations, token totals, tool inputs and the assistant replies are Example values in the product's formats (bare ULIDs whose time prefix encodes their timestamp; event types and contents as `process-draft.ts` writes them; durations as `session-process-events.service.ts` infers them). The output files are real: the Example agent code in the module was run on `input.csv` (Python 3.14.6, 2026-10-18) and wrote exactly these files; the hash is the sha256 of the random nonce that run made.
- `data/runtime-catalog.snapshot.json`: runtimes, vendors, preset models, model defaults, protocol labels and the server's availability strings.
- `data/console-strings.snapshot.json`: the console strings the kit quotes, verbatim, in en, zh-CN (as `zh`) and ja, plus the install command, the docs URL, the coding-agent tiles and the stream pacing constants.

Both snapshots record their source commit. Regenerate them from a mosoo checkout without touching it:

```sh
node scripts/export-mosoo-product-snapshot.mjs /path/to/mosoo --ref origin/main
```

## Preview

`npm run landing:dev`, then open `/src/product-kit/preview/` (dev only; not a build input). Query switches: `c` (`all` or one component id such as `turn-receipt`), `locale`, `animate=1`, `at=<ms>`, `w=<px>`, `probes=1`.

## Provenance

| Item | Source | License |
| --- | --- | --- |
| Component markup and class lists | `langgenius/mosoo` `apps/web/src` at `7cb9866cfc` (files named in each component's header) | Apache-2.0 (mosoo) |
| Island tokens, bridge, type roles, keyframes | `apps/web/src/shared/styles/app.css` at `7cb9866cfc` | Apache-2.0 (mosoo) |
| General glyphs (`components/icons.tsx`) | `@hugeicons/core-free-icons` 4.2.3, path data copied (the version mosoo locks) | MIT per the package's `license` field |
| Runtime, vendor and coding-agent marks | `@lobehub/icons-static-svg` (landing dependency) | MIT |
| `assets/pi.svg` | verbatim copy of `@lobehub/icons-static-svg` 1.94.0 `icons/pi.svg` (sha256 `d82978781b824273…`), the console's Pi mark | MIT |
| Snapshots | `scripts/export-mosoo-product-snapshot.mjs` against `origin/main` `7cb9866cfc` | Apache-2.0 (mosoo) |
| `chart.svg`, `report.md`, the JSON outputs | generated by `TURN_1_CODE` and `TURN_2_CODE` in `data/example-universe.ts` | (kit) |
| Fonts | none added; Geist and Geist Mono are the landing app's existing self-hosted files | SIL OFL 1.1 |

## Differences from the console, on purpose

- No `tailwind-merge`: variants spell out full class lists. Headings inside moments are `<p>`, so they add nothing to the page outline.
- `TurnReceipt` keeps the card expanded and shows the drawer's timeline inline instead of an "Open event details" button. `RuntimeMatrix` shows the model menu open and flat, and lists locked models (the console lists only available ones and names locked vendors in the link title, which the kit also prints).
- `CodingAgentSetup` shows both lanes at once instead of a toggle. Steps link to the console on cloud.mosoo.ai.
- The Preview's retention note uses the soft hairline; the console's bare `border-b` paints `currentColor` in Tailwind 4.
- A cancelled turn is shown by its run status ("cancelled ✗", "Run cancelled"): the event log records the runtime's `run.cancelled` as `run.completed`.
- The status labels in the model list ("Available", "Provider key required") are the server's English strings in every locale, as in the console.
- `KeyBoundary` is a diagram drawn for the site from SPEC section 5 and architecture section 4; the console has no such screen.
