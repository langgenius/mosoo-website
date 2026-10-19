import assert from "node:assert/strict";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join, relative } from "node:path";
import test from "node:test";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const landing = join(root, "apps/landing");
const kit = join(landing, "src/product-kit");
const read = (path) => readFileSync(join(kit, path), "utf8");

// langgenius/mosoo pkgs/contracts/src/session/session.contract.ts at the
// commit the kit was built from (SESSION_PROCESS_EVENT_TYPES).
const SESSION_PROCESS_EVENT_TYPES = new Set([
  "agent.message.delta",
  "agent.thinking.delta",
  "file.changed",
  "run.completed",
  "run.failed",
  "run.started",
  "session.status",
  "session_files.updated",
  "tool.confirmation.required",
  "tool.use.completed",
  "tool.use.started",
  "usage.updated",
  "user.message",
]);
// Tool names the console's chip tones recognise (apps/web/src/shared/ui/session-events/domain.ts).
const KNOWN_TOOL_NAMES = new Set(["bash", "exec_command", "shell", "web_fetch", "web_search"]);
const ULID = /^[0-7][0-9A-HJKMNP-TV-Z]{25}$/;
const CROCKFORD = "0123456789ABCDEFGHJKMNPQRSTVWXYZ";

function ulidTime(id) {
  return Array.from(id.slice(0, 10)).reduce((value, char) => value * 32 + CROCKFORD.indexOf(char), 0);
}

function csvTotal(text) {
  return text
    .trim()
    .split("\n")
    .slice(1)
    .reduce((sum, line) => sum + Number(line.split(",")[1]), 0);
}

// Kit modules without runtime imports load through Node's type stripping (on
// by default from Node 22.18 / 23.6; CI runs 24). Only an older local Node may
// skip these tests; in CI they must run.
async function loadTs(t, path) {
  try {
    return await import(pathToFileURL(join(kit, path)).href);
  } catch (error) {
    if (error?.code === "ERR_UNKNOWN_FILE_EXTENSION" && !process.env.CI) {
      t.skip("this Node cannot strip TypeScript types");
      return null;
    }
    throw error;
  }
}

// Tailwind's compiler and scanner, resolved the way the landing build gets
// them: from @tailwindcss/vite, a declared landing dependency. Never skipped.
async function loadTailwind() {
  const landingRequire = createRequire(join(landing, "package.json"));
  const viteRequire = createRequire(landingRequire.resolve("@tailwindcss/vite"));
  const { compile, optimize } = await import(pathToFileURL(viteRequire.resolve("@tailwindcss/node")).href);
  const { Scanner } = await import(pathToFileURL(viteRequire.resolve("@tailwindcss/oxide")).href);
  return { compile, optimize, Scanner };
}

// --- The example universe ------------------------------------------------------

test("the CSV story adds up: 230, then 250, with one private nonce hash", async (t) => {
  const u = await loadTs(t, "data/example-universe.ts");
  if (u === null) return;

  assert.equal(csvTotal(u.INPUT_CSV), 230);
  assert.equal(csvTotal(`${u.INPUT_CSV}${u.APPENDED_ROW}\n`), 250);

  const initial = JSON.parse(u.OUTPUTS.initialJson.text);
  const followup = JSON.parse(u.OUTPUTS.followupJson.text);
  assert.equal(initial.grand_total, 230);
  assert.equal(followup.grand_total, 250);
  assert.match(initial.private_nonce_sha256, /^[0-9a-f]{64}$/);
  assert.equal(followup.private_nonce_sha256, initial.private_nonce_sha256);
  assert.equal(initial.private_nonce_sha256, u.NONCE_SHA256);

  assert.match(u.OUTPUTS.chartTurn1.text, /^<svg /);
  assert.match(u.OUTPUTS.chartTurn2.text, /^<svg /);
  assert.match(u.OUTPUTS.reportTurn1.text, /grand_total: 230\n$/);
  assert.match(u.OUTPUTS.reportTurn2.text, /grand_total: 250\n$/);
  assert.match(u.ASSISTANT_REPLIES.turn1, /\b230\b/);
  assert.match(u.ASSISTANT_REPLIES.turn2, /\b250\b/);
});

test("events use only real event types and tool names, in the product's shapes", async (t) => {
  const u = await loadTs(t, "data/example-universe.ts");
  if (u === null) return;

  for (const turn of u.TURNS) {
    assert.equal(turn.prompt, turn.events[0].content, `turn ${turn.index} starts with its prompt`);
    assert.equal(turn.events[0].type, "user.message");

    for (const [index, event] of turn.events.entries()) {
      assert.ok(SESSION_PROCESS_EVENT_TYPES.has(event.type), `unknown event type ${event.type}`);
      assert.ok(["available", "error", "unsupported"].includes(event.status));
      assert.match(event.id, ULID);
      assert.equal(ulidTime(event.id), Date.parse(event.occurredAt), `event ${event.id} time prefix`);

      const next = turn.events[index + 1];
      const gap = next === undefined ? 0 : Date.parse(next.occurredAt) - Date.parse(event.occurredAt);
      assert.ok(gap >= 0, "events are in time order");
      assert.equal(event.durationMs, gap, "duration runs to the next event of the run");

      if (event.type === "tool.use.started" || event.type === "tool.use.completed") {
        assert.ok(KNOWN_TOOL_NAMES.has(event.content), `unknown tool ${event.content}`);
      }
      if (event.type === "run.started" || event.type === "run.completed") {
        assert.equal(event.content, turn.runId, "run events carry the run ID");
      }
      if (event.type === "usage.updated") {
        assert.ok(Number.isInteger(event.tokens) && event.tokens > 0);
      } else {
        assert.equal(event.tokens, null, "only usage events carry tokens");
      }
    }

    assert.match(turn.runId, ULID);
    assert.equal(ulidTime(turn.runId), Date.parse(turn.createdAt), `run ${turn.index} time prefix`);
    assert.ok(turn.toolCalls.every((call) => KNOWN_TOOL_NAMES.has(call.toolName)));
  }

  assert.match(u.EXAMPLE_IDS.thread, ULID);
  assert.equal(ulidTime(u.EXAMPLE_IDS.thread), Date.parse(u.THREAD_CREATED_AT));
  assert.deepEqual(
    u.TURNS.map((turn) => turn.status),
    ["completed", "completed", "cancelled"],
  );

  const reclaimedFor = Date.parse(u.TURN_2.createdAt) - Date.parse(u.TURN_1.completedAt);
  assert.ok(reclaimedFor >= 7 * 24 * 60 * 60 * 1000, "turn 2 comes seven days after turn 1");
  assert.ok(u.TOOL_CALLS.turn2Append.input.includes("south,20"));
  assert.ok(u.TOOL_CALLS.turn2Recompute.input.includes(".private/nonce"));
});

// The body between -d ' and the closing ' of a curl command.
function curlBody(request) {
  const start = request.indexOf("-d '");
  assert.ok(start !== -1, "the request sends a JSON body");
  return JSON.parse(request.slice(start + 4, request.lastIndexOf("'")));
}

test("the API calls start the same story: upload input.csv, then create its thread", async (t) => {
  const u = await loadTs(t, "data/example-universe.ts");
  if (u === null) return;
  const { create, upload } = u.API_CALLS;

  // Copy deck D15: the docs quickstart's and the setup prompt's variable names.
  for (const call of [create, upload]) {
    assert.match(call.request, /\/projects\/\$MOSOO_PROJECT_ID\//);
    assert.match(call.request, /Bearer \$MOSOO_API_TOKEN"/);
    assert.doesNotMatch(call.request, /\$PROJECT_ID|\$MOSOO_API_KEY/);
    assert.equal(call.status, "201 Created");
  }

  assert.match(upload.request, /\/files \\\n/);
  assert.match(upload.request, /-F "file=@input\.csv"$/);
  const uploaded = JSON.parse(upload.response);
  assert.equal(uploaded.file.id, u.EXAMPLE_IDS.inputFile);
  assert.equal(uploaded.file.name, u.OUTPUTS.inputCsv.name);
  assert.equal(ulidTime(u.EXAMPLE_IDS.inputFile), Date.parse(u.INPUT_FILE_UPLOADED_AT));
  assert.ok(Date.parse(u.INPUT_FILE_UPLOADED_AT) < Date.parse(u.THREAD_CREATED_AT), "uploaded first");

  const body = curlBody(create.request);
  assert.deepEqual(body.configuration, { ...u.CONFIGURATION });
  assert.deepEqual(body.input, { content: [{ text: u.PROMPTS.turn1, type: "text" }], type: "user.message" });
  assert.deepEqual(body.resources, [{ file_id: u.EXAMPLE_IDS.inputFile, type: "file" }]);

  const created = JSON.parse(create.response);
  assert.equal(created.thread.id, u.EXAMPLE_IDS.thread);
  assert.equal(created.thread.agent_id, null, "inline configuration, no Agent");
  assert.equal(created.run.id, u.TURN_1.runId);
  assert.equal(created.run.status, "queued");
});

test("the API calls stay within 80 columns, except the two prose strings", async (t) => {
  const u = await loadTs(t, "data/example-universe.ts");
  if (u === null) return;

  // These lines hold one prose string each, which the page wraps at spaces.
  const prose = /^ *"(?:instructions": "[^"]+"|content": \[\{ "type": "text", "text": "[^"]+" \}\])$/;

  for (const call of Object.values(u.API_CALLS)) {
    for (const line of `${call.request}\n${call.response}`.split("\n")) {
      assert.ok(line.length <= 80 || prose.test(line), `too long: ${line}`);
    }
  }
});

// --- The setup prompt ----------------------------------------------------------

test("the copied setup prompt is the copy deck's: no publish step, v2 docs links", async (t) => {
  const { SETUP_PROMPT } = (await loadTs(t, "data/setup-prompt.ts")) ?? {};
  if (SETUP_PROMPT === undefined) return;

  assert.deepEqual(Object.keys(SETUP_PROMPT).sort(), ["en", "ja", "zh"]);
  for (const [locale, prompt] of Object.entries(SETUP_PROMPT)) {
    assert.doesNotMatch(prompt, /publish|发布|公開/i, `${locale} asks to publish`);
    assert.match(prompt, /MOSOO_DOCS_URL\/quickstart\b/, `${locale} links the quickstart`);
    assert.match(prompt, /MOSOO_DOCS_URL\/api-reference-v2\b/, `${locale} links the v2 API reference`);
    assert.doesNotMatch(prompt, /MOSOO_DOCS_URL\/(?:coding-agents|api-reference(?!-v2))/, `${locale} links v1 docs`);
    assert.doesNotMatch(prompt, /threads\?compose=1/, `${locale} sends to the published-Agent composer`);
    assert.match(prompt, /^MOSOO_CONSOLE_URL=https:\/\/cloud\.mosoo\.ai$/m);
    assert.match(prompt, /^MOSOO_DOCS_URL=https:\/\/mosoo\.ai\/docs$/m);
    assert.match(prompt, /curl -fsSL https:\/\/install\.mosoo\.ai\/install\.sh \| bash/);
    assert.match(prompt, /MOSOO_API_TOKEN/);
  }

  // The console's version is no longer in the kit's strings.
  const strings = JSON.parse(read("data/console-strings.snapshot.json"));
  assert.equal(strings.strings.en["projectOverview.setupPrompt"], undefined);
  assert.doesNotMatch(read("index.ts"), /buildSetupPrompt/);
});

// --- Snapshots -----------------------------------------------------------------

function kitFiles(directory) {
  return readdirSync(directory).flatMap((name) => {
    const path = join(directory, name);
    return statSync(path).isDirectory() ? kitFiles(path) : [path];
  });
}

test("snapshots name their source commit and agree across locales", () => {
  const strings = JSON.parse(read("data/console-strings.snapshot.json"));
  const catalog = JSON.parse(read("data/runtime-catalog.snapshot.json"));

  for (const snapshot of [strings, catalog]) {
    assert.match(snapshot.source.commit, /^[0-9a-f]{40}$/);
    assert.equal(snapshot.source.repository, "langgenius/mosoo");
    assert.equal(snapshot.source.uncommittedChanges, undefined);
  }

  const keys = Object.keys(strings.strings.en).sort();
  for (const locale of ["zh", "ja"]) {
    assert.deepEqual(Object.keys(strings.strings[locale]).sort(), keys, `${locale} keys`);
  }
  for (const locale of ["en", "zh", "ja"]) {
    for (const [key, value] of Object.entries(strings.strings[locale])) {
      assert.ok(value.trim().length > 0, `${locale} ${key} is empty`);
    }
  }

  const vendorIds = new Set(catalog.vendors.map((vendor) => vendor.vendorId));
  const protocols = new Set(catalog.protocols.map((protocol) => protocol.id));
  assert.equal(catalog.runtimes.length, 4);
  for (const runtime of catalog.runtimes) {
    assert.ok(runtime.vendorIds.every((id) => vendorIds.has(id)), runtime.runtimeId);
    assert.ok(runtime.supportedModelProtocols.every((id) => protocols.has(id)), runtime.runtimeId);
  }
  for (const model of catalog.presetModels) {
    assert.ok(vendorIds.has(model.vendorId), model.modelId);
    assert.ok(protocols.has(model.protocol), model.modelId);
  }
  for (const [vendorId, modelId] of Object.entries(catalog.modelDefaults)) {
    assert.ok(
      catalog.presetModels.some((model) => model.vendorId === vendorId && model.modelId === modelId),
      `default ${vendorId}/${modelId} is a preset`,
    );
  }
  assert.equal(catalog.availability.needsKey.statusLabel, "Provider key required");
});

test("every console string the snapshot carries is used by the kit", () => {
  const strings = JSON.parse(read("data/console-strings.snapshot.json"));
  const sources = kitFiles(kit)
    .filter((path) => /\.tsx?$/.test(path) && !path.includes(`${join("product-kit", "preview")}`))
    .map((path) => readFileSync(path, "utf8"))
    .join("\n");

  for (const key of Object.keys(strings.strings.en)) {
    assert.ok(sources.includes(`"${key}"`), `${key} is exported but unused; drop it from CONSOLE_KEYS`);
  }
});

// --- Island isolation ----------------------------------------------------------

function stripComments(css) {
  return css.replaceAll(/\/\*[\s\S]*?\*\//g, "");
}

// Top-level statements: [prelude, body | null].
function topLevel(css) {
  const blocks = [];
  let depth = 0;
  let start = 0;
  let prelude = "";

  for (let index = 0; index < css.length; index += 1) {
    const char = css[index];
    if (char === "{") {
      if (depth === 0) {
        prelude = css.slice(start, index).trim();
        start = index + 1;
      }
      depth += 1;
    } else if (char === "}") {
      depth -= 1;
      if (depth === 0) {
        blocks.push([prelude, css.slice(start, index)]);
        start = index + 1;
      }
    } else if (char === ";" && depth === 0) {
      blocks.push([css.slice(start, index).trim(), null]);
      start = index + 1;
    }
  }

  return blocks;
}

const ISLAND = '[data-surface="console"]';
const THEME_NAME = /--(?:font|ease|color|radius|shadow|tracking|animate|spacing|text|leading|container|breakpoint|default)-[\w-]*/g;

function assertScoped(blocks, where) {
  for (const [prelude, body] of blocks) {
    if (body === null) {
      assert.match(prelude, /^@(layer|import|source)\b/, `${where}: statement ${prelude}`);
      continue;
    }
    if (prelude.startsWith("@theme inline")) continue;
    if (prelude.startsWith("@font-face")) {
      assert.match(body, /font-family:\s*"Geist Fallback"/, `${where}: only the fallback face`);
      continue;
    }
    if (prelude.startsWith("@keyframes")) {
      assert.match(prelude, /^@keyframes console-/, `${where}: keyframes are renamed`);
      continue;
    }
    if (prelude.startsWith("@property")) continue;
    if (prelude.startsWith("@media") || prelude.startsWith("@layer") || prelude.startsWith("@supports")) {
      if (prelude === "@layer properties") continue;
      assertScoped(topLevel(body), `${where} > ${prelude}`);
      continue;
    }
    for (const selector of prelude.split(",")) {
      assert.ok(selector.trim().startsWith(ISLAND), `${where}: unscoped selector ${selector.trim()}`);
    }
  }
}

test("console-island.css scopes every rule to the island", () => {
  const css = stripComments(read("console-island.css"));
  assertScoped(topLevel(css), "console-island.css");

  const outsideTheme = topLevel(css)
    .filter(([prelude]) => !prelude.startsWith("@theme"))
    .map(([prelude, body]) => `${prelude}{${body ?? ""}}`)
    .join("\n");
  assert.deepEqual(outsideTheme.match(THEME_NAME) ?? [], [], "no theme names outside @theme");

  for (const block of css.match(/@theme inline \{[^}]*\}/g) ?? []) {
    for (const [, name, value] of block.matchAll(/(--[\w-]+):\s*([^;]+);/g)) {
      assert.ok(!value.includes(`var(${name})`), `${name} must not read itself`);
    }
  }

  // The root's text styles sit in the base layer, under any utility on the root.
  const base = topLevel(css).find(([prelude]) => prelude === "@layer base");
  assert.ok(base !== undefined, "an @layer base block");
  assert.match(base[1], /\[data-surface="console"\] \{[^}]*font-size:/);
});

test("kit sources never spell a Tailwind theme variable", () => {
  // Tailwind's scanner treats such a string as a use and emits the variable
  // on :root, over the website's own (see console-island.css).
  for (const path of kitFiles(kit)) {
    if (path.endsWith("console-island.css") || path.endsWith(".svg")) continue;
    const found = readFileSync(path, "utf8").match(THEME_NAME) ?? [];
    assert.deepEqual(found, [], relative(root, path));
  }
});

test("the island compiles to scoped utilities and no :root", async () => {
  const { compile, Scanner } = await loadTailwind();

  const compiler = await compile(read("console-island.css"), { base: kit, onDependency() {} });
  const scanner = new Scanner({
    sources: compiler.sources.map(({ base, negated, pattern }) => ({ base, negated, pattern })),
  });
  const output = stripComments(compiler.build(scanner.scan()));

  assert.doesNotMatch(output, /:root|:host/);
  assert.match(
    output,
    /\[data-surface="console"\] \{[\s\S]*\.text-primary-foreground \{\s*color: var\(--action-primary-fg\);/,
    "the literal #ffffff bridge is overridden inside the island",
  );
  assertScoped(topLevel(output), "compiled island");
});

// As @tailwindcss/vite builds a stylesheet for production: the CSS file's
// folder as base, the Vite root for automatic sources, then optimized and
// minified. `extraSources` adds scanner sources outside the CSS.
async function buildWebsiteCss(tailwind, css, extraSources = []) {
  const stylesDir = join(landing, "src/shared/styles");
  const compiler = await tailwind.compile(css, { base: stylesDir, onDependency() {} });
  const sources = [
    ...(compiler.root === "none"
      ? []
      : compiler.root === null
        ? [{ base: landing, negated: false, pattern: "**/*" }]
        : [{ ...compiler.root, negated: false }]),
    ...compiler.sources.map(({ base, negated, pattern }) => ({ base, negated, pattern })),
    ...extraSources,
  ];
  const scanner = new tailwind.Scanner({ sources });
  const built = compiler.build(scanner.scan());
  return { css: tailwind.optimize(built, { minify: true }).code, files: scanner.files };
}

test("the website's app.css is the same as without the kit until a page imports it", async () => {
  const appCss = readFileSync(join(landing, "src/shared/styles/app.css"), "utf8");
  // The kit's exclusion: the directive right after the Tailwind import, with its comment.
  const exclusion = /(?<=^@import "tailwindcss";\n)(?:\/\*[\s\S]*?\*\/\n)?@source not "\.\.\/\.\.\/product-kit";\n/m;
  assert.match(appCss, exclusion);
  const mainCss = appCss.replace(exclusion, "");

  const tailwind = await loadTailwind();
  const inKit = (file) => file.startsWith(`${kit}/`);

  const committed = await buildWebsiteCss(tailwind, appCss);
  assert.ok(committed.files.length > 0, "app.css scans the landing app");
  assert.ok(!committed.files.some(inKit), "app.css scans no kit file");

  // Main's stylesheet over the landing app without the kit folder (left out
  // of the scan here, as if it did not exist) builds the same CSS, byte for byte.
  const kitAbsent = { base: join(landing, "src"), negated: true, pattern: "product-kit" };
  const main = await buildWebsiteCss(tailwind, mainCss, [kitAbsent]);
  assert.ok(!main.files.some(inKit));
  assert.equal(committed.css, main.css);

  // And the exclusion matters: main's stylesheet scanning the kit grows.
  const scanningKit = await buildWebsiteCss(tailwind, mainCss);
  assert.ok(scanningKit.files.some(inKit));
  assert.ok(scanningKit.css.length > committed.css.length, "the kit would add CSS to every page");
});

// --- KeyBoundary label sizes ---------------------------------------------------

test("KeyBoundary labels render at 12px or more from a 354px island", async (t) => {
  const layout = await loadTs(t, "components/key-boundary-layout.ts");
  if (layout === null) return;
  const { FIT, LABEL_SIZE, MIN_READABLE_ISLAND_PX, NARROW, WIDE, fitDiagram } = layout;

  // The component's classes are the ones FIT describes.
  const source = read("components/key-boundary.tsx");
  const wideFrom = `@min-[${FIT.wideFromPx / 16}rem]`;
  for (const className of ["p-4", "@xl:p-6", `${wideFrom}:block`, `${wideFrom}:hidden`, `max-w-[${FIT.narrowMaxPx}px]`, `max-w-[${FIT.wideMaxPx}px]`]) {
    assert.ok(source.includes(className), `key-boundary.tsx uses ${className}`);
  }
  assert.equal(FIT.paddingWideFromPx, 36 * 16, "@xl is 36rem");
  const diagram = source.slice(source.indexOf("function Diagram("), source.indexOf("export function KeyBoundaryView("));
  assert.doesNotMatch(diagram, /text-\[\d/, "SVG labels take their size from LABEL_SIZE");

  const sizes = Object.values(LABEL_SIZE);
  for (let island = MIN_READABLE_ISLAND_PX; island <= 1600; island += 1) {
    const { layout: used, scale } = fitDiagram(island);
    const smallest = Math.min(...sizes) * scale;
    const largest = Math.max(...sizes) * scale;
    assert.ok(smallest >= 12, `${island}px island (${used}): ${smallest.toFixed(2)}px labels`);
    assert.ok(largest <= 18, `${island}px island (${used}): ${largest.toFixed(2)}px labels`);
  }
  assert.ok(Math.min(...sizes) * fitDiagram(MIN_READABLE_ISLAND_PX - 1).scale < 12, "the minimum is tight");
  assert.equal(fitDiagram(358).layout, "narrow", "a 390px phone with 16px gutters");
  assert.equal(NARROW.width, 360);
  assert.equal(WIDE.width, 780);
});

// --- No-JS fallback markup -----------------------------------------------------

test("the static markup export carries the story's facts in every locale", async () => {
  const { renderProductKitMarkup } = await import(
    pathToFileURL(join(root, "scripts/export-product-kit-markup.mjs")).href
  );
  const { moments } = await renderProductKitMarkup();
  const u = await import(pathToFileURL(join(kit, "data/example-universe.ts")).href);

  for (const locale of ["en", "zh", "ja"]) {
    const continuation = moments["session-continuation"][locale];
    assert.match(continuation, /&quot;grand_total&quot;<\/span>[\s\S]*?230/);
    assert.match(continuation, /&quot;grand_total&quot;<\/span>[\s\S]*?250/);
    assert.equal(continuation.split(u.NONCE_SHA256).length - 1, 2, "the same hash in both outputs");
    assert.ok(continuation.includes(u.EXAMPLE_IDS.thread));
    assert.match(moments["turn-receipt"][locale], /grand_total is 230/);
    assert.ok(moments["api-call"][locale].includes(u.EXAMPLE_IDS.inputFile));

    for (const [id, byLocale] of Object.entries(moments)) {
      const html = byLocale[locale];
      assert.match(html, /^<div[^>]* data-surface="console"/, `${id} renders its island`);
      assert.doesNotMatch(html, /\binvisible\b/, `${id} hides nothing in its final state`);
      assert.doesNotMatch(html, /aria-label="(?:Replay|重放|リプレイ)/, `${id} has no Replay control`);
    }
  }
});

// The example's timings are made up, so no island the website renders may
// state one: no turn duration, no timeline 0:00 or total, no "prepare_run" ms.
// Clock times (09:14:03 AM) are example timestamps, not durations.
test("no kit island states a duration in seconds or milliseconds", async () => {
  const { renderProductKitMarkup } = await import(
    pathToFileURL(join(root, "scripts/export-product-kit-markup.mjs")).href
  );
  const { moments } = await renderProductKitMarkup();
  const u = await import(pathToFileURL(join(kit, "data/example-universe.ts")).href);
  // The script's own prompts are quoted verbatim (turn 3 asks for a long sleep).
  const prompts = u.TURNS.map((turn) => turn.prompt);
  const timing = /(?<![\w.])\d+(?:[.:]\d+)?\s?(?:ms|s|sec|seconds|秒|ミリ秒|毫秒)(?![\w])|(?<![:\d])\d{1,2}:\d\d(?![:\d])|prepare_run/;
  for (const [id, byLocale] of Object.entries(moments)) {
    for (const [locale, html] of Object.entries(byLocale)) {
      const decoded = html
        .replace(/<[^>]+>/g, " ")
        .replaceAll("&quot;", '"')
        .replaceAll("&#x27;", "'")
        .replaceAll("&#39;", "'")
        .replaceAll("&lt;", "<")
        .replaceAll("&gt;", ">")
        .replaceAll("&amp;", "&");
      const text = prompts.reduce((rest, prompt) => rest.replaceAll(prompt, " "), decoded);
      const match = text.match(timing);
      assert.equal(match, null, `${id} (${locale}) states a timing: ${match?.[0]}`);
    }
  }
});

// The no-JS home page (scripts/landing-home.mjs) prints the story's two calls
// as plain text; they must stay the kit's calls, character for character.
test("the static home page shows the kit's upload and create calls verbatim", async (t) => {
  const u = await loadTs(t, "data/example-universe.ts");
  if (u === null) return;
  const { renderHomeFallback } = await import(pathToFileURL(join(root, "scripts", "landing-home.mjs")).href);
  const unescape = (html) =>
    html.replaceAll("&lt;", "<").replaceAll("&gt;", ">").replaceAll("&quot;", '"').replaceAll("&#39;", "'").replaceAll("&amp;", "&");
  for (const locale of ["en", "zh", "ja"]) {
    const blocks = [...renderHomeFallback(locale).matchAll(/<pre translate="no"><code>([\s\S]*?)<\/code><\/pre>/g)].map(
      (match) => unescape(match[1]),
    );
    assert.ok(blocks.includes(u.API_CALLS.upload.request), `${locale}: the upload call`);
    assert.ok(blocks.includes(u.API_CALLS.create.request), `${locale}: the create call`);
    const shortHash = `${u.NONCE_SHA256.slice(0, 8)}…${u.NONCE_SHA256.slice(-8)}`;
    assert.equal(renderHomeFallback(locale).split(shortHash).length - 1, 2, `${locale}: both outputs show the kit's short hash`);
  }
});
