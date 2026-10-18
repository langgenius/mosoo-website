import assert from "node:assert/strict";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const kit = join(root, "apps/landing/src/product-kit");
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

// The universe module has no runtime imports, so Node's type stripping loads
// it (on by default from Node 22.18 / 23.6; CI runs 24).
async function loadUniverse(t) {
  try {
    return await import(join(kit, "data/example-universe.ts"));
  } catch (error) {
    if (error?.code === "ERR_UNKNOWN_FILE_EXTENSION") {
      t.skip("this Node cannot strip TypeScript types");
      return null;
    }
    throw error;
  }
}

test("the CSV story adds up: 230, then 250, with one private nonce hash", async (t) => {
  const u = await loadUniverse(t);
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
  const u = await loadUniverse(t);
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

test("the API call stays within 80 columns", async (t) => {
  const u = await loadUniverse(t);
  if (u === null) return;

  for (const line of `${u.API_CALL.curl}\n${u.API_CALL.response}`.split("\n")) {
    assert.ok(line.length <= 80, `too long: ${line}`);
  }
  assert.doesNotThrow(() => JSON.parse(u.API_CALL.response));
});

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

// --- Island isolation -------------------------------------------------------

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
});

function kitFiles(directory) {
  return readdirSync(directory).flatMap((name) => {
    const path = join(directory, name);
    return statSync(path).isDirectory() ? kitFiles(path) : [path];
  });
}

test("kit sources never spell a Tailwind theme variable", () => {
  // Tailwind's scanner treats such a string as a use and emits the variable
  // on :root, over the website's own (see console-island.css).
  for (const path of kitFiles(kit)) {
    if (path.endsWith("console-island.css") || path.endsWith(".svg")) continue;
    const found = readFileSync(path, "utf8").match(THEME_NAME) ?? [];
    assert.deepEqual(found, [], relative(root, path));
  }
});

test("the island compiles to scoped utilities and no :root", async (t) => {
  let compile;
  let Scanner;
  try {
    ({ compile } = await import("@tailwindcss/node"));
    ({ Scanner } = await import("@tailwindcss/oxide"));
  } catch {
    t.skip("Tailwind's node packages are not installed");
    return;
  }

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
