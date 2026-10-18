# Product kit

Console product moments for the website, ported from the mosoo console. All of them tell one story: the CSV acceptance run from `langgenius/mosoo` `scripts/public-api-session-workflow.ts`. Upload `input.csv`, start a Session with it (`grand_total` 230), the sandbox is reclaimed, a follow-up seven days later appends `south,20` (`grand_total` 250, the same private nonce hash), then a turn is cancelled. No page imports the kit yet.

## Use

```tsx
import { ApiCall, SessionContinuation, TurnReceipt } from "@/product-kit";

<TurnReceipt locale="en" animate scale={1.2} />
<SessionContinuation locale="zh" animate showCancelledTurn />
<ApiCall locale="ja" />
```

Every moment takes the `MomentProps`:

| Prop | Default | |
| --- | --- | --- |
| `locale` | (required) | `"en" \| "zh" \| "ja"`; sets `lang` on the island (`zh` is `zh-CN`) |
| `animate` | `false` | replay the last step once (3 to 5 s) the first time the moment is half visible, unless the visitor prefers reduced motion; a "Replay" control then shows |
| `exclusive` | `true` | take turns with the page's other replays; `false` only where a direction pairs two moments on purpose |
| `replayAt` | none | render the replay frozen at this many ms (stills, docs) |
| `scale` | `1` | CSS `zoom` on the island root; use 1.2 or more in a hero so the console's 10px chips read at 12px |

| Component | Moment | Extra props |
| --- | --- | --- |
| `TurnReceipt` | PM-01 turn card, timeline bar, legend and event rows (turn 1) | `turn?: 1 \| 2` |
| `SessionContinuation` | PM-02 turn 1, "7 days later · Sandbox reclaimed while idle", "Restored from the last checkpoint · Same thread.id", turn 2, the two JSON outputs with the hash rows aligned | `showCancelledTurn?: boolean` |
| `PreviewReplay` | PM-03 the console Preview replaying turn 1 at the console's stream pace | |
| `RuntimeMatrix` | PM-04 runtime cards; a click filters the models; locked providers in the product's "Provider key required" state | `defaultRuntimeId?: string` (default `acp-fallback`, OpenCode) |
| `RuntimeAvailability` | PM-05 the Providers page's runtime availability rows | |
| `KeyBoundary` | PM-08 diagram of the credential boundary, with the Environment variables exception | |
| `ApiCall` | PM-11 the two calls that start the story: upload `input.csv`, then create the Session with it attached; each with Copy and its 201 response | `upload?: boolean` (default `true`) |
| `CodingAgentSetup` | PM-10 both onboarding lanes, the install command, the copyable setup prompt, the console steps | `progress?: "done" \| "todo"`, `heading?: boolean` |

`ConsoleIsland` and `ExampleValues` are exported for compositions of your own; `exampleUniverse` exports the story's data (prompts, events, outputs, IDs, the API calls).

Every moment renders its final state first, so the end state is in the first render, in screenshots and for reduced-motion visitors. It renders its own `[data-surface="console"]` root (`role="group"`, named after the moment and "Example values"), a polite live region, and no outer frame: put it in your stage shell. `data-replaying` is on the root while its replay runs.

## Placing a moment

- Widths: below a 36rem island rows drop columns and panels stack. Give `KeyBoundary` at least 47rem (752px) of island for the wide diagram; below that it stacks, at most 380px wide. Its labels stay at 12px or more from a 354px island (a 390px phone with 16px gutters gives 358px).
- Size: the console's own sizes are 10 to 14.5px. To show a moment larger, pass `scale` rather than changing font sizes; container queries then see the unzoomed width, so a 760px island at 1.2 lays out like a 633px one.
- Code: `ApiCall` sets code at `--kit-code-size` (default `1rem`); set it to the page's body size. Lines wrap only at spaces and after the `/` of a URL, strings of up to 24 characters never break, and a longer token that cannot fit (an ID on a phone) scrolls inside the block.
- Loading: import below-the-fold moments lazily, the way the home page loads `LandingBelowFold`, from the component's own module: `lazy(() => import("@/product-kit/components/key-boundary").then((m) => ({ default: m.KeyBoundary })))`. A lazy import of the index cannot drop the other moments' data (44.5 kB instead of 34.6 kB for that chunk). Measured in probe builds: a static `TurnReceipt` adds 49.2 kB JS (16.2 kB gzip), all eight moments 127.3 kB (39.0 kB gzip); the island CSS adds 40.0 kB (6.1 kB gzip) to the page's stylesheet, or 43.3 kB (7.8 kB gzip) as a lazy chunk's own file, whichever moments are used.
- No JavaScript: `node scripts/export-product-kit-markup.mjs <out.json>` writes every moment's final markup in en, zh and ja (Vite SSR with the landing app's own dependencies). The page that embeds it must also load the island CSS.

## The island

- `console-island.css` comes with any component import. It declares the console's tokens on `[data-surface="console"]` and compiles its own Tailwind utilities nested under that selector, scanning this folder only, so the console's meaning of `bg-primary` (lime), `text-primary-foreground` (dark ink `#0f1a02`, where the website's bridge is a literal `#ffffff`), `text-brand`, `rounded-md` (6px) and the rest wins inside the island and nothing changes outside it. The root's text styles sit in `@layer base`, so a utility on the island root itself still applies.
- The website's `app.css` has `@source not "../../product-kit"`: its build is byte-identical to one without the kit (sha256 checked against an origin/main build), and `tests/product-kit.test.mjs` checks the same in Node. Without the line every page's CSS grows from 68.0 to 80.7 kB (12.7 to 14.9 kB gzip).
- Keyframes are renamed `console-*`; the console's reduced-motion branches are kept.
- No file in this folder may spell a Tailwind theme variable name (font, ease, colour, radius and similar namespaces): Tailwind's scanner counts the string as a use and emits the variable on `:root`, over the website's own. The test checks this.
- `preview/control.html` against `preview/?probes=1` compares website elements with and without the kit (no differences at the time of writing).

## Data

- `data/example-universe.ts`: the story. Prompts, `input.csv`, the default instructions and the assertions are quoted from the script. IDs, timestamps, durations, token totals, tool inputs and the assistant replies are Example values in the product's formats (bare ULIDs whose time prefix encodes their timestamp; event types and contents as `process-draft.ts` writes them; durations as `session-process-events.service.ts` infers them). The output files are real: the Example agent code in the module was run on `input.csv` (Python 3.14.6, 2026-10-18) and wrote exactly these files; the hash is the sha256 of the random nonce that run made. The API calls use the script's endpoints and the docs' variables (`$MOSOO_PROJECT_ID`, `$MOSOO_API_TOKEN`); their responses carry the story's file, thread and run IDs.
- `data/setup-prompt.ts`: the setup prompt the website copies, verbatim from copy deck section 13 (the same text as redesign/v1-truth's `setup-prompt.ts`). It drops the console prompt's publish step and links the v2 quickstart and API reference. At integration keep one of the two files and re-export it from the other.
- `data/runtime-catalog.snapshot.json`: runtimes, vendors, preset models, model defaults, protocol labels and the server's availability strings.
- `data/console-strings.snapshot.json`: the console strings the kit renders, and no others, verbatim, in en, zh-CN (as `zh`) and ja, plus the install command, the docs URL, the coding-agent tiles and the stream pacing constants.

Both snapshots record their source commit. Regenerate them from a mosoo checkout without touching it:

```sh
node scripts/export-mosoo-product-snapshot.mjs /path/to/mosoo --ref origin/main
```

## Example values

Hashes, IDs, times, durations, token totals and the finished checklist are Example values. Each moment says so with an outline "Example values" badge (copy deck `visual.example`) next to the data: in the turn header, next to the Thread ID and the hash claim, after the Preview's status pill, next to the Example Project's keys, in each API response header, and above the ticked checklist. `KeyBoundary` states a fact and carries none.

## Copy deviations (文案偏离)

Kit copy lives in `i18n.ts`. Verbatim from the copy deck: "Example values", "Copy request", "Request copied", "Command copied", "Start a Session" (section 18); "Sandbox reclaimed while idle", "Restored from the last checkpoint", "Same thread.id" (section 3); "Keys stay outside the sandbox" (F5); the Environment variables sentence (FAQ 6); the setup prompt (section 13). Console strings come from the snapshot. The rest is kit copy, for the content track to adopt or replace:

| Key | en | Why |
| --- | --- | --- |
| `daysLater` | 7 days later | Copy deck section 3 says "2 days later" for its sales story; the one story's turn 2 comes seven days after turn 1, the figure of F3 and claim C15. |
| `uploadInputCsv`, `response` | Upload input.csv, Response | Labels for the upload call and the response panes; the deck has "Request" only. |
| `projectKeys` | Project with Anthropic and OpenAI keys | Which keys the Example Project has, next to "Example values" (zh 项目, ja プロジェクト, per the deck's term table). |
| `sameNonceHash` | Same private_nonce_sha256 | The script's continuity check, worded like the deck's "Same thread.id". |
| `priorCommitKept` | Turn 2 stays the last committed checkpoint. | F4 and C21 applied to the story's turn 3. |
| `boundary*` | diagram labels | Short labels for SPEC section 5 parts (proxies, vault, grants), using the deck's terms (模型供应商密钥, プロバイダーキー, 工作目录, 注入, 付与). |
| `thread` | Thread | The label before the Thread ID. |

The user prompts and assistant replies stay in the script's English in every locale (marked `lang="en"`); copy deck section 3 localizes its own sales-story prompts, which would need content-track translations of the script's.

## Differences from the console, on purpose

- No `tailwind-merge`: variants spell out full class lists. Headings inside moments are `<p>`, so they add nothing to the page outline.
- `TurnReceipt` keeps the card expanded and shows the drawer's timeline inline instead of an "Open event details" button. The timeline bar is a picture of the rows (hidden from assistive technology, not focusable; a pointer still highlights the row). Turn headers have no expand chevron, since nothing expands.
- `RuntimeMatrix` shows the model menu open and flat, lists locked models (the console lists only available ones and names locked vendors in the link title, which the kit also prints), and uses the server's English "Provider key required" in the lock line too, so one state reads one way. The scrolling model list is focusable and named "Available models".
- `CodingAgentSetup` shows both lanes at once instead of a toggle, as an ordered list rather than a `nav`. Steps link to the console on cloud.mosoo.ai. It copies the copy deck's setup prompt, not the console's.
- Copy buttons keep their names ("Copy request: Start a Session", "Copy command") and their visible label; the result is spoken through the island's live region, and when the clipboard is refused the setup prompt's text area takes focus.
- Drawn controls (the Preview's composer, Reset chat) have the console's look without hover, pressed or focus states. Artifact links are named after the visible path ("Preview outputs/report.md") and control the inline preview.
- The cancelled turn's "Run cancelled" title uses danger-fg (`#b91c1c`): the console's danger (`#dc2a2a`) is 4.3:1 on the notice's tint. The Preview's composer placeholder uses fg-3.
- The Preview's retention note uses the soft hairline; the console's bare `border-b` paints `currentColor` in Tailwind 4.
- A cancelled turn is shown by its run status ("cancelled ✗", "Run cancelled"): the event log records the runtime's `run.cancelled` as `run.completed`.
- Pi is a text mark, as on redesign/v1-truth: the icon package version the site ships has no Pi mark. At integration, read runtime marks from the site's `@/shared/ui/brand-icons` (v1-truth) and keep only the coding-agent tiles here.
- `KeyBoundary` is a diagram drawn for the site from SPEC section 5 and architecture section 4; the console has no such screen.

## Preview

`npm run landing:dev`, then open `/src/product-kit/preview/` (dev only; not a build input). Query switches: `c` (`all` or one component id such as `turn-receipt`), `locale`, `animate=1`, `at=<ms>`, `scale=<zoom>`, `w=<px>`, `probes=1`.

## Provenance

| Item | Source | License |
| --- | --- | --- |
| Component markup and class lists | `langgenius/mosoo` `apps/web/src` at `7cb9866cfc` (files named in each component's header) | Apache-2.0 (mosoo) |
| Island tokens, bridge, type roles, keyframes | `apps/web/src/shared/styles/app.css` at `7cb9866cfc` | Apache-2.0 (mosoo) |
| General glyphs (`components/icons.tsx`) | `@hugeicons/core-free-icons` 4.2.3, path data copied (the version mosoo locks) | MIT per the package's `license` field |
| Runtime and coding-agent marks | `@lobehub/icons-static-svg` (landing dependency); Pi is a text mark | MIT |
| Snapshots | `scripts/export-mosoo-product-snapshot.mjs` against `origin/main` `7cb9866cfc` | Apache-2.0 (mosoo) |
| Setup prompt | v1 copy deck section 13, adapted from the console's `projectOverview.setupPrompt` | Apache-2.0 (mosoo), website copy |
| `chart.svg`, `report.md`, the JSON outputs | generated by `TURN_1_CODE` and `TURN_2_CODE` in `data/example-universe.ts` | (kit) |
| Fonts | none added; Geist and Geist Mono are the landing app's existing self-hosted files | SIL OFL 1.1 |
