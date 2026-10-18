#!/usr/bin/env node
// Regenerates the product kit's two snapshots from a mosoo checkout:
//
//   node scripts/export-mosoo-product-snapshot.mjs <path-to-mosoo-checkout> [--ref <git-ref>]
//
// - apps/landing/src/product-kit/data/runtime-catalog.snapshot.json
//   runtimes, vendors, preset models, model defaults and protocol labels from
//   pkgs/runtime-catalog/src/catalog.ts, plus the server-side model
//   availability strings from apps/api/.../available-models.ts.
// - apps/landing/src/product-kit/data/console-strings.snapshot.json
//   the console i18n strings the kit quotes (en, zh-CN, ja), verbatim, plus
//   the onboarding constants and the stream pacing constants.
//
// With --ref (for example `--ref origin/main`) every file is read with
// `git show <ref>:<path>`, so the checkout is never modified. Without it the
// working tree is read and the snapshot records HEAD, flagging edited files.
// catalog.ts is transpiled with the TypeScript compiler already installed for
// the landing app and imported from a data: URL; it must keep type-only imports.

import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import ts from "typescript";

const KIT_DATA = resolve(
  dirname(fileURLToPath(import.meta.url)),
  "../apps/landing/src/product-kit/data",
);

const FILES = {
  availableModels: "apps/api/src/modules/vendor-credentials/application/available-models.ts",
  catalog: "pkgs/runtime-catalog/src/catalog.ts",
  externalLinks: "apps/web/src/shared/config/external-links.ts",
  i18n: {
    en: "apps/web/src/shared/i18n/translations/en.json",
    ja: "apps/web/src/shared/i18n/translations/ja.json",
    zh: "apps/web/src/shared/i18n/translations/zh-CN.json",
  },
  onboardingPrompt: "apps/web/src/routes/project-overview/onboarding-setup-prompt.ts",
  onboardingSteps: "apps/web/src/routes/project-overview/onboarding-steps.tsx",
  protocolLabels: "apps/web/src/domains/vendor-credential/model/provider-model-protocol.ts",
  runtimeCatalog: "pkgs/runtime-catalog/src/runtime-catalog.ts",
  streamScheduler: "apps/web/src/domains/runtime/session-stream/session-stream-render-scheduler.ts",
};

// Console i18n keys the kit renders. Every key must exist in all three catalogs.
const CONSOLE_KEYS = [
  "agent.addProviderKey",
  "agent.availableModels",
  "agent.manageProviders",
  "agent.model",
  "agent.pillReady",
  "agent.pillWorking",
  "agent.previewRetention",
  "agent.providerKeyRequired",
  "agent.replay",
  "agent.resetChat",
  "agent.runtime",
  "agent.testing",
  "chat.attachFile",
  "chat.describeTask",
  "chat.noOutput",
  "chat.send",
  "chat.stopGenerating",
  "chat.thinking",
  "chat.toolRunning",
  "common.copied",
  "common.copy",
  "common.copyCommand",
  "common.done",
  "common.error",
  "environments.envVars",
  "files.artifact",
  "files.attachment",
  "nav.mcpServers",
  "nav.providers",
  "onboarding.addProviderKey",
  "onboarding.createAgent",
  "onboarding.createApiToken",
  "onboarding.docsDescription",
  "onboarding.harnesses",
  "onboarding.inCodingAgent",
  "onboarding.inConsole",
  "onboarding.optional",
  "onboarding.quickstartDescription",
  "onboarding.readDocs",
  "onboarding.setupDescription",
  "onboarding.setupPromptCopied",
  "onboarding.setupWithAgent",
  "onboarding.steps",
  "onboarding.subtitle",
  "onboarding.title",
  "projectOverview.copyPromptFailed",
  "projectOverview.setupPrompt",
  "projectOverview.setupPromptLabel",
  "providers.customProviderRequired",
  "providers.modelProtocol",
  "providers.needsKeyAdd",
  "providers.noMatchingModels",
  "providers.or",
  "providers.readyConfigured",
  "providers.runtimeAvailability",
  "providers.runtimeAvailabilityDescription",
  "sessionEvents.domainAgent",
  "sessionEvents.domainSession",
  "sessionEvents.domainSpan",
  "sessionEvents.domainUser",
  "sessionEvents.eventApprovalRequested",
  "sessionEvents.eventAssistantMessage",
  "sessionEvents.eventFileChanged",
  "sessionEvents.eventRunCompleted",
  "sessionEvents.eventRunFailed",
  "sessionEvents.eventRunStarted",
  "sessionEvents.eventSessionFiles",
  "sessionEvents.eventSessionStatus",
  "sessionEvents.eventThinking",
  "sessionEvents.eventToolResult",
  "sessionEvents.eventToolUse",
  "sessionEvents.eventUsageUpdated",
  "sessionEvents.eventUserMessage",
  "sessionEvents.selectEvent",
  "sessionEvents.statusError",
  "sessionEvents.statusOk",
  "sessionEvents.statusUnsupported",
  "sessionEvents.turn",
  "sessionEvents.turnStatusRunning",
  "threads.activity",
  "threads.agentReply",
  "threads.completed",
  "threads.directInvocation",
  "threads.events",
  "threads.failed",
  "threads.followUp",
  "threads.previewFile",
  "threads.runCancelledMessage",
  "threads.runCancelledTitle",
  "threads.showProcess",
  "threads.statusCancelled",
  "threads.statusDone",
  "threads.userComment",
  "threads.userRequest",
  "threads.viewProcess",
];

function fail(message) {
  console.error(`export-mosoo-product-snapshot: ${message}`);
  process.exit(1);
}

function git(checkout, args) {
  return execFileSync("git", ["-C", checkout, ...args], { encoding: "utf8" }).trim();
}

function parseArgs(argv) {
  const positional = [];
  let ref = null;

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--ref") {
      ref = argv[index + 1] ?? fail("--ref needs a value, for example --ref origin/main.");
      index += 1;
    } else {
      positional.push(arg);
    }
  }

  if (positional.length !== 1) {
    fail("usage: node scripts/export-mosoo-product-snapshot.mjs <path-to-mosoo-checkout> [--ref <git-ref>]");
  }

  return { checkout: resolve(positional[0]), ref };
}

function createReader(checkout, ref) {
  const isGit = existsSync(join(checkout, ".git"));

  if (ref !== null && !isGit) {
    fail(`--ref needs a git checkout; ${checkout} has no .git.`);
  }

  const read = (path) =>
    ref === null
      ? readFileSync(join(checkout, path), "utf8")
      : execFileSync("git", ["-C", checkout, "show", `${ref}:${path}`], {
          encoding: "utf8",
          maxBuffer: 16 * 1024 * 1024,
        });

  const revision = ref ?? "HEAD";
  const commit = isGit ? git(checkout, ["rev-parse", revision]) : null;
  const committedAt = isGit ? git(checkout, ["log", "-1", "--format=%cI", revision]) : null;

  const describe = (paths) => {
    const source = {
      repository: "langgenius/mosoo",
      ref: ref ?? "working tree",
      commit,
      committedAt,
      files: paths,
    };

    if (ref === null && isGit) {
      const edited = git(checkout, ["status", "--porcelain", "--", ...paths]);
      if (edited.length > 0) {
        source.uncommittedChanges = edited.split("\n").map((line) => line.slice(3));
      }
    }

    return source;
  };

  return { describe, read };
}

async function loadCatalog(read) {
  const output = ts.transpileModule(read(FILES.catalog), {
    compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
    fileName: "catalog.ts",
  }).outputText;

  if (/^\s*import\s/m.test(output)) {
    fail(`${FILES.catalog} now has a runtime import; extend this script to resolve it.`);
  }

  return import(`data:text/javascript;base64,${Buffer.from(output).toString("base64")}`);
}

function matchOne(text, pattern, what) {
  const match = pattern.exec(text);
  if (match === null) {
    fail(`could not find ${what}; the source changed shape, update this script.`);
  }
  return match;
}

// `${vendorLabel}` style template fields become the kit's {{name}} placeholders.
function toPlaceholders(template, names) {
  return template.replaceAll(/\$\{([A-Za-z.]+)\}/g, (_, field) => {
    const name = names[field];
    if (name === undefined) {
      fail(`unexpected template field \${${field}} in an availability string.`);
    }
    return `{{${name}}}`;
  });
}

function functionBody(text, name) {
  return matchOne(
    text,
    new RegExp(`function ${name}\\([\\s\\S]*?\\n\\}`, "u"),
    `function ${name}() in ${FILES.availableModels}`,
  )[0];
}

function readAvailabilityStrings(read) {
  const text = read(FILES.availableModels);
  const catalogText = read(FILES.runtimeCatalog);
  const label = (body, what) => matchOne(body, /statusLabel: "([^"]+)"/u, what)[1];
  const detail = (body, what) => matchOne(body, /statusDetail: `([^`]+)`/u, what)[1];

  const available = functionBody(text, "availableStatus");
  const needsKey = functionBody(text, "needsKeyStatus");
  const wrongRuntime = functionBody(text, "wrongRuntimeStatus");
  const wrongProtocol = functionBody(text, "wrongProtocolStatus");
  const protocolMessage = matchOne(
    catalogText,
    /code: "protocol-unsupported",\s*message: `([^`]+)`/u,
    `the protocol-unsupported message in ${FILES.runtimeCatalog}`,
  )[1];

  return {
    available: { statusLabel: label(available, "availableStatus label") },
    needsKey: {
      reason: "needs-key",
      statusDetail: toPlaceholders(detail(needsKey, "needsKeyStatus detail"), {
        vendorLabel: "vendor",
      }),
      statusLabel: label(needsKey, "needsKeyStatus label"),
    },
    wrongProtocol: {
      reason: "wrong-protocol",
      statusDetail: toPlaceholders(protocolMessage, {
        modelProtocol: "protocol",
        "runtime.runtimeId": "runtimeId",
      }),
      statusLabel: label(wrongProtocol, "wrongProtocolStatus label"),
    },
    wrongRuntime: {
      reason: "wrong-runtime",
      runtimeFallback: matchOne(wrongRuntime, /\?\? "([^"]+)"/u, "wrongRuntimeStatus fallback")[1],
      statusDetail: toPlaceholders(detail(wrongRuntime, "wrongRuntimeStatus detail"), {
        target: "runtime",
        vendorLabel: "vendor",
      }),
      statusLabel: label(wrongRuntime, "wrongRuntimeStatus label"),
    },
  };
}

function readProtocolLabels(read) {
  const text = read(FILES.protocolLabels);
  const labels = [...text.matchAll(/\{ label: "([^"]+)", value: "([^"]+)" \}/gu)].map((match) => ({
    id: match[2],
    label: match[1],
  }));
  if (labels.length === 0) {
    fail(`no protocol labels found in ${FILES.protocolLabels}.`);
  }
  return labels;
}

function flatten(object, prefix = "") {
  const entries = {};
  for (const [key, value] of Object.entries(object)) {
    const path = prefix.length > 0 ? `${prefix}.${key}` : key;
    if (value !== null && typeof value === "object") {
      Object.assign(entries, flatten(value, path));
    } else {
      entries[path] = value;
    }
  }
  return entries;
}

function readConsoleStrings(read) {
  const strings = {};
  for (const [locale, path] of Object.entries(FILES.i18n)) {
    const catalog = flatten(JSON.parse(read(path)));
    strings[locale] = {};
    for (const key of CONSOLE_KEYS) {
      if (typeof catalog[key] !== "string") {
        fail(`${path} has no string for ${key}.`);
      }
      strings[locale][key] = catalog[key];
    }
  }
  return strings;
}

function readConsoleConstants(read) {
  const prompt = read(FILES.onboardingPrompt);
  const links = read(FILES.externalLinks);
  const steps = read(FILES.onboardingSteps);
  const scheduler = read(FILES.streamScheduler);
  const constant = (name) =>
    Number(matchOne(scheduler, new RegExp(`const ${name} = (\\d+);`, "u"), `${name} in ${FILES.streamScheduler}`)[1]);
  const harnessBlock = matchOne(
    steps,
    /const CODING_AGENT_HARNESSES = \[([\s\S]*?)\] as const;/u,
    `CODING_AGENT_HARNESSES in ${FILES.onboardingSteps}`,
  )[1];

  return {
    codingAgentHarnesses: [
      ...harnessBlock.matchAll(/\{ label: "([^"]+)", runtimeId: "([^"]+)" \}/gu),
    ].map((match) => ({ label: match[1], runtimeId: match[2] })),
    docsBaseUrl: matchOne(links, /MOSOO_DOCS_BASE_URL = "([^"]+)"/u, "MOSOO_DOCS_BASE_URL")[1],
    installCommand: matchOne(prompt, /INSTALL_COMMAND = "([^"]+)"/u, "INSTALL_COMMAND")[1],
    streamPacing: {
      maxGraphemesPerSecond: constant("MAX_PACED_GRAPHEMES_PER_SECOND"),
      maxPendingGraphemes: constant("MAX_PENDING_PACED_GRAPHEMES"),
      minGraphemesPerSecond: constant("MIN_PACED_GRAPHEMES_PER_SECOND"),
      timeConstantMs: constant("PACING_TIME_CONSTANT_MS"),
    },
  };
}

function writeJson(fileName, value) {
  const path = join(KIT_DATA, fileName);
  writeFileSync(path, `${JSON.stringify(value, null, 2)}\n`);
  console.log(`wrote ${path}`);
}

const { checkout, ref } = parseArgs(process.argv.slice(2));
const { describe, read } = createReader(checkout, ref);
const catalog = await loadCatalog(read);
const generator = "scripts/export-mosoo-product-snapshot.mjs";

writeJson("runtime-catalog.snapshot.json", {
  generator,
  source: describe([
    FILES.catalog,
    FILES.runtimeCatalog,
    FILES.availableModels,
    FILES.protocolLabels,
  ]),
  protocols: readProtocolLabels(read),
  vendors: catalog.VENDORS.map((vendor) => ({
    iconKey: vendor.iconKey,
    label: vendor.label,
    vendorId: vendor.vendorId,
  })),
  runtimes: catalog.RUNTIMES.map((runtime) => ({
    acceptsCustomProvider: runtime.acceptsCustomProvider,
    color: runtime.display.color ?? null,
    defaultModel: runtime.defaultModel,
    defaultProvider: runtime.defaultProvider,
    iconKey: runtime.display.iconKey,
    label: runtime.label,
    providerLabel: runtime.display.providerLabel,
    runtimeId: runtime.runtimeId,
    supportedModelProtocols: [...runtime.supportedModelProtocols],
    transport: runtime.transport,
    vendorIds: runtime.vendors.map((vendor) => vendor.vendorId),
  })),
  presetModels: catalog.PRESET_MODELS.map((model) => ({
    displayName: model.displayName,
    modelId: model.modelId,
    protocol: model.protocol,
    vendorId: model.vendor.vendorId,
  })),
  modelDefaults: { ...catalog.MODEL_DEFAULTS },
  availability: readAvailabilityStrings(read),
});

writeJson("console-strings.snapshot.json", {
  generator,
  source: describe([
    ...Object.values(FILES.i18n),
    FILES.onboardingPrompt,
    FILES.externalLinks,
    FILES.onboardingSteps,
    FILES.streamScheduler,
  ]),
  constants: readConsoleConstants(read),
  strings: readConsoleStrings(read),
});
