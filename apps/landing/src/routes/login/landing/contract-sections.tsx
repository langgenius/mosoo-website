import type { ReactElement } from "react";

import { ApiCall } from "@/product-kit/components/api-call";
import { SessionContinuation } from "@/product-kit/components/session-continuation";
import { locale } from "@/shared/locale";

import {
  docsUrl,
  MOSOO_CLOUD_URL,
  MOSOO_GITHUB_URL,
  MOSOO_INCIDENTS_URL,
  MOSOO_INSTALL_COMMAND,
  MOSOO_INSTALL_SCRIPT_URL,
  MOSOO_RELEASES_URL,
  MOSOO_SPEC_URL,
  pathToUseCases,
  statusPath,
} from "../links";
import { ContractSection, Exhibit, Inline } from "./contract-ui";
import { CopyButton } from "./copy-button";
import { FAQ_MESSAGES, t } from "./i18n";
import { SETUP_PROMPT } from "./setup-prompt";

// The document below the title block, in the v2b order: the boundary, then
// durability, execution and keys, the runtime matrix, what is promised and
// what is not provided, what you can check, the questions, and how to start.
// Section ids are the anchors the static fallback (scripts/landing-home.mjs)
// uses, so a link works with and without JavaScript.

/** Copy deck §7: SPEC §1's split, in its order. */
function Boundary(): ReactElement {
  const appRows = [
    [t("Business logic"), t("What the task is for and what happens to the result")],
    [t("End-user authentication"), t("mosoo never signs your users in")],
    [t("Business queues"), t("When work starts and in what order")],
    [t("Result validation"), t("You decide whether the report is right")],
    [t("Business storage"), t("Keep the `thread.id` and whatever you extract")],
    [t("UI"), t("Your product, your screens")],
  ] as const;
  const mosooRows = [
    [t("Agent execution"), t("The harness runs each turn: model calls, code, tools")],
    [t("Sandboxing"), t("One sandbox per Session, never shared")],
    [t("Durable continuation"), t("Follow-ups restore the last checkpoint")],
    [t("Input files and artifacts"), t("Attachments in, `outputs/` out")],
    [t("Events"), t("Saved first, then streamed over SSE")],
    [t("Usage measurement"), t("One record per model call")],
    [t("Runtime cleanup"), t("Idle sandboxes are reclaimed; the Session’s state stays")],
  ] as const;

  const column = (title: string, rows: readonly (readonly [string, string])[]): ReactElement => (
    <div className="ct-ledger-col">
      <h3 className="ct-h3">{title}</h3>
      <dl>
        {rows.map(([term, detail]) => (
          <div key={term} className="ct-ledger-row">
            <dt>{term}</dt>
            <dd>
              <Inline text={detail} />
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );

  return (
    <ContractSection
      id="your-app-and-mosoo"
      title={t("Your app keeps its users. mosoo runs the Agent.")}
      cites={["s1"]}
    >
      <div className="ct-ledger">
        {column(t("Your app keeps"), appRows)}
        {column(t("mosoo runs"), mosooRows)}
      </div>
      <p className="ct-footnote">
        <Inline
          text={t(
            "mosoo doesn’t authenticate your end users. If your MCP servers need to know who asked, label the Thread with your own `userId`.",
          )}
        />
      </p>
    </ContractSection>
  );
}

const SPEC_QUOTE = "Model or tool execution ending is not success.";

/** F3 and F4, the spec's own sentence, then Exhibit 2. */
function Durability(): ReactElement {
  return (
    <ContractSection
      id="durability"
      title={t("A reply seven days later continues the same Session.")}
      cites={["s4"]}
    >
      <div className="ct-prose">
        <p>
          {t(
            "Follow-ups continue the same Session, even after the sandbox was reclaimed. The working directory, conversation, and files return from the last checkpoint.",
          )}
        </p>
        <p>
          {t(
            "If that checkpoint can’t be restored, the follow-up fails with an error. API Sessions have no inactivity deadline.",
          )}
        </p>
      </div>

      <blockquote className="ct-quote">
        <p lang="en">“{SPEC_QUOTE}”</p>
        {locale === "en" ? null : <p className="ct-quote-tr">{t(SPEC_QUOTE)}</p>}
        <footer className="ct-ui ct-muted">
          <a href={`${MOSOO_SPEC_URL}#checkpoint-gate`} lang="en" translate="no">
            SPEC §4, Checkpoint gate
          </a>
        </footer>
      </blockquote>

      <div className="ct-prose">
        <p>
          {t(
            "Completion means the events, usage, and a checkpoint were committed together. A failed or cancelled turn never overwrites the last good state.",
          )}
        </p>
      </div>

      <Exhibit
        label={t("Exhibit 2.")}
        caption={t(
          "The same Session seven days later. The sandbox was reclaimed while idle, turn 2 restored the last checkpoint, and both outputs carry the same private_nonce_sha256. Turn 3 was cancelled, so turn 2 stays the last committed checkpoint.",
        )}
      >
        <div className="ct-zoom">
          <SessionContinuation locale={locale} showCancelledTurn />
        </div>
      </Exhibit>
    </ContractSection>
  );
}

/** F5, the Project key, then the two calls behind Exhibit 1. */
function Keys(): ReactElement {
  return (
    <ContractSection id="keys" title={t("Provider keys never enter the sandbox.")} cites={["s5", "s2"]}>
      <div className="ct-prose">
        <p>
          {t(
            "The harness writes code and runs tools in the Session’s own sandbox. Your keys stay outside it.",
          )}{" "}
          {t(
            "Provider keys and MCP credentials never enter the sandbox. The runtime reaches models and tools through mosoo’s proxies, which add the credential per request.",
          )}
        </p>
        <p>
          {t(
            "The sandbox only gets expiring grants. Environment variables are different. Code in the sandbox can read them.",
          )}
        </p>
        <p>
          <Inline
            text={t(
              "Add a provider key to your Project, then create a Project API key. It starts with `msp_` and is shown once.",
            )}
          />
        </p>
      </div>

      <Exhibit
        label={t("Exhibit 3.")}
        caption={t(
          "The two requests behind Exhibit 1: upload input.csv, then start a Session with the file attached.",
        )}
        after={
          <p className="ct-exhibit-note ct-ui">
            {t("Model IDs change often. Check the models available in your Project before you copy this.")}{" "}
            <a href={docsUrl("api-reference-v2/")}>{t("Open the v2 API reference")}</a>
          </p>
        }
      >
        <div className="ct-code">
          <ApiCall locale={locale} />
        </div>
      </Exhibit>
    </ContractSection>
  );
}

const PROTOCOLS = ["Chat Completions", "Responses", "Anthropic Messages", "Google Gemini"] as const;
type Protocol = (typeof PROTOCOLS)[number];

// The runtime catalog (product kit snapshot of mosoo's catalog.ts):
// supportedModelProtocols per runtime.
const RUNTIMES: readonly {
  name: string;
  id: string;
  protocols: readonly Protocol[];
  note?: "Anthropic models" | "Text input";
}[] = [
  { name: "OpenAI Codex", id: "openai-runtime", protocols: ["Responses"] },
  {
    name: "Claude Agent SDK",
    id: "claude-agent-sdk",
    protocols: ["Anthropic Messages"],
    note: "Anthropic models",
  },
  { name: "OpenCode", id: "acp-fallback", protocols: PROTOCOLS },
  { name: "Pi", id: "pi", protocols: PROTOCOLS, note: "Text input" },
];

const PROVIDERS = [
  "Anthropic",
  "OpenAI",
  "DeepSeek",
  "Gemini",
  "Qwen",
  "Kimi",
  "Zhipu",
  "MiniMax",
  "OpenCode Zen",
] as const;

/** Copy deck §4 as a runtime × protocol matrix. */
function Runtimes(): ReactElement {
  const separator = locale === "en" ? ", " : "、";
  const end = locale === "en" ? "." : "。";
  return (
    <ContractSection
      id="runtimes"
      title={t("Each Session freezes its runtime, model, and protocol.")}
      cites={["s3"]}
    >
      <div className="ct-prose">
        <p>
          {t(
            "4 runtimes, the providers below, or any OpenAI-compatible HTTPS endpoint. mosoo checks the runtime, model, and protocol before anything runs.",
          )}
        </p>
      </div>

      <div className="ct-table-wrap">
        <table className="ct-table">
          <caption className="ct-sr">{t("Model protocols")}</caption>
          <thead>
            <tr>
              <th scope="col">{t("Runtimes")}</th>
              {PROTOCOLS.map((protocol) => (
                <th key={protocol} scope="col" translate="no">
                  {protocol}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {RUNTIMES.map((runtime) => (
              <tr key={runtime.id}>
                <th scope="row">
                  <span translate="no">{runtime.name}</span>
                  <span className="ct-id" translate="no">
                    {runtime.id}
                  </span>
                  {runtime.note === undefined ? null : <span className="ct-note">{t(runtime.note)}</span>}
                </th>
                {PROTOCOLS.map((protocol) =>
                  runtime.protocols.includes(protocol) ? (
                    <td key={protocol} className="ct-cell">
                      <span aria-hidden="true">✓</span>
                      <span className="ct-sr">{t("Supported")}</span>
                    </td>
                  ) : (
                    <td key={protocol} className="ct-cell">
                      <span className="ct-sr">{t("Not supported")}</span>
                    </td>
                  ),
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Phones: the same facts as a list, one runtime per entry. */}
      <dl className="ct-matrix-list">
        {RUNTIMES.map((runtime) => (
          <div key={runtime.id}>
            <dt>
              <span translate="no">{runtime.name}</span>{" "}
              <code translate="no">{runtime.id}</code>
            </dt>
            <dd>
              <span translate="no">{runtime.protocols.join(separator)}</span>
              {runtime.note === undefined ? null : <span className="ct-note">{t(runtime.note)}</span>}
            </dd>
          </div>
        ))}
      </dl>

      <p className="ct-p ct-after-table">
        <strong>{t("Model providers (your keys)")}</strong>{" "}
        <span translate="no">{PROVIDERS.join(separator)}</span>
        {separator}
        {t("Custom OpenAI-compatible endpoint")}
        {end}
      </p>
      <p className="ct-footnote">
        {t("Provider keys belong to your Project, and the provider bills your account directly.")}{" "}
        {t("Names and logos identify compatible services and don’t imply a partnership or endorsement.")}
      </p>
    </ContractSection>
  );
}

/** Copy deck §5 (titles and proof lines) beside §9 (gaps and what to do instead). */
function PromisesAndLimits(): ReactElement {
  const promises = [
    [
      t("Start a Session without creating an Agent"),
      t(
        "`configuration.type: \"inline\"` on `POST /api/v2/projects/{projectId}/threads`. Saved presets are optional.",
      ),
    ],
    [
      t("Choose the runtime per Session"),
      t("A runtime and model protocol that don’t match are rejected before anything runs."),
    ],
    [
      t("Reply 1 minute or 7 days later"),
      t(
        "If that checkpoint can’t be restored, the follow-up fails with an error. API Sessions have no inactivity deadline.",
      ),
    ],
    [
      t("A turn succeeds only when its results are saved"),
      t("From the product spec: “Model or tool execution ending is not success.”"),
    ],
    [
      t("Keys stay outside the sandbox"),
      t(
        "The sandbox only gets expiring grants. Environment variables are different. Code in the sandbox can read them.",
      ),
    ],
    [
      t("Attach files, stream events, download results"),
      t(
        "Events are saved before they’re sent, and stable IDs let a client reconnect without duplicates. There are no Webhooks.",
      ),
    ],
  ] as const;
  const gaps = [
    [t("Webhooks"), t("Stream events over SSE, or read the saved history.")],
    [t("Interactive tool approvals"), t("Agents run with full access inside the Session’s own sandbox.")],
    [
      t("Models, credits, billing, or a spending cap"),
      t("Use your own provider key. The provider bills you, and the usage API lists every model call."),
    ],
    [
      t("Git mounting, private repository access, or branch and PR workflows"),
      t("Pass a public URL with an exact commit, or upload the files."),
    ],
    [
      t("Your own runtimes, a connector marketplace, or local MCP servers"),
      t("Pick one of the 4 runtimes and connect remote HTTPS MCP servers."),
    ],
    [t("An online file editor or file manager"), t("Upload inputs and download artifacts through the API.")],
    [t("Chat channels or a personal cloud computer"), t("That’s Mosoo Computer, a separate product.")],
  ] as const;

  const column = (
    title: string,
    rows: readonly (readonly [string, string])[],
    tone?: "soil",
  ): ReactElement => (
    <div className="ct-ledger-col" data-tone={tone}>
      <h3 className="ct-h3">{title}</h3>
      <ul>
        {rows.map(([term, detail]) => (
          <li key={term} className="ct-ledger-row">
            <p className="ct-ledger-term">{term}</p>
            <p className="ct-ledger-detail">
              <Inline text={detail} />
            </p>
          </li>
        ))}
      </ul>
    </div>
  );

  return (
    <ContractSection
      id="limits"
      title={t("The spec lists what mosoo promises and what it doesn’t do.")}
      cites={["s8"]}
    >
      <div className="ct-ledger">
        {column(t("Promised"), promises)}
        {column(t("Not provided"), gaps, "soil")}
      </div>
      <p className="ct-footnote ct-ui">
        <a href={MOSOO_SPEC_URL}>{t("Read the product spec")}</a>
      </p>
    </ContractSection>
  );
}

/** Copy deck §8: only what a visitor can check. */
function Proof(): ReactElement {
  const releases = [
    ["v0.7.0", "2026-10-09", t("Smaller codebase. The public Thread API v1 and v2 did not change.")],
    [
      "v0.5.1",
      "2026-10-08",
      t(
        "Custom providers declare a model protocol, and mismatched runtime and model pairs are rejected before a run.",
      ),
    ],
    ["v0.5.0", "2026-10-08", t("Pi joins as the fourth runtime.")],
    ["v0.4.0", "2026-09-30", t("Sessions start straight from a Project, with no Agent required.")],
  ] as const;

  return (
    <ContractSection
      id="proof"
      title={t("The source, the releases, and the postmortems are public.")}
      cites={["s7"]}
    >
      <div className="ct-prose">
        <p>
          {t(
            "mosoo is in Alpha. What you can check today is the code, the releases, production status, and two projects built on it.",
          )}
        </p>
      </div>
      <dl className="ct-proof">
        <div>
          <dt>{t("Source")}</dt>
          <dd>
            {t(
              "The runtime, console, and API are Apache 2.0 on GitHub. The stack: Cloudflare Workers, Durable Objects, D1, R2, and Containers.",
            )}
            <span className="ct-links ct-ui">
              <a href={MOSOO_GITHUB_URL}>{t("View source")}</a>
              <a href={MOSOO_SPEC_URL}>{t("Read the product spec")}</a>
            </span>
          </dd>
        </div>
        <div>
          <dt>{t("Releases")}</dt>
          <dd>
            <ol className="ct-releases" aria-label={t("Releases")}>
              {releases.map(([version, date, change]) => (
                <li key={version}>
                  <span>
                    <span className="ct-version" translate="no">
                      {version}
                    </span>
                    <br />
                    <time dateTime={date}>{date}</time>
                  </span>
                  <span>{change}</span>
                </li>
              ))}
            </ol>
            <span className="ct-links ct-ui">
              <a href={MOSOO_RELEASES_URL}>{t("View all releases")}</a>
            </span>
          </dd>
        </div>
        <div>
          <dt>{t("Production status")}</dt>
          <dd>
            {t(
              "mosoo.ai/health is built from production Worker outcomes and real Run completions. A runtime without production samples shows Unknown.",
            )}
            <span className="ct-links ct-ui">
              <a href={statusPath()}>{t("Open the status page")}</a>
            </span>
          </dd>
        </div>
        <div>
          <dt>{t("Postmortems")}</dt>
          <dd>
            {t(
              "6 incident postmortems from July to September 2026 are in the repo. Newer incidents are tracked as GitHub issues.",
            )}
            <span className="ct-links ct-ui">
              <a href={MOSOO_INCIDENTS_URL}>{t("Read the postmortems")}</a>
            </span>
          </dd>
        </div>
        <div>
          <dt translate="no">Codex Pet</dt>
          <dd>
            {t("Built by the mosoo team.")}{" "}
            {t(
              "An uploaded avatar comes back as a validated ZIP with all 9 Codex pet animation states. The backend calls mosoo through the Thread API, and the token never reaches the browser.",
            )}
            <span className="ct-links ct-ui">
              <a href={pathToUseCases("codex-pet")}>{t("Read the Codex Pet use case")}</a>
            </span>
          </dd>
        </div>
        <div>
          <dt translate="no">ghfind</dt>
          <dd>
            {t("Built by AsperforMias.")}{" "}
            {t(
              "For each public GitHub repository, ghfind’s Go worker starts a Thread and turns the 3 artifacts the Agent saves (analysis JSON, evidence JSON, and a Markdown report) into its own result page.",
            )}
            <span className="ct-links ct-ui">
              <a href={pathToUseCases("ghfind")}>{t("Read the ghfind use case")}</a>
              <a href="https://ghfind.com">{t("Open ghfind")}</a>
            </span>
          </dd>
        </div>
      </dl>
      <p className="ct-footnote ct-ui">
        <a href={pathToUseCases()}>{t("See all use cases")}</a>
      </p>
    </ContractSection>
  );
}

// API names styled as code inside the answers. Presentation only: the text
// stays identical to the FAQPage JSON-LD and llms.txt answers.
const FAQ_CODE = /(\/api\/v[12]\b|outputs\/|Idempotency-Key|runtime\.capacity_exhausted)/;

function FaqAnswer({ text }: { text: string }): ReactElement {
  const parts = text.split(FAQ_CODE);
  return (
    <>
      {parts.map((part, index) =>
        index % 2 === 1 ? (
          // Fragments of a static string: the index is a stable key.
          <code key={index} translate="no">
            {part}
          </code>
        ) : (
          part
        ),
      )}
    </>
  );
}

/**
 * Copy deck §10: ten questions, every answer visible without a click, so the
 * visible FAQ, the FAQPage structured data and the crawlable fallback match.
 * id="faq" is the fragment the FAQPage @id points at (https://mosoo.ai/en#faq).
 */
function Faq(): ReactElement {
  return (
    <ContractSection id="faq" title={t("Questions to ask before you build on mosoo")} cites={["all"]}>
      <div className="ct-faq">
        {FAQ_MESSAGES.map((faq) => (
          <div key={faq.q} className="ct-qa">
            <h3 className="ct-h3">{t(faq.q)}</h3>
            <p>
              <FaqAnswer text={t(faq.a)} />
            </p>
          </div>
        ))}
      </div>
    </ContractSection>
  );
}

/** Copy deck §11: what happens on click, then the console's two ways in. */
function Start(): ReactElement {
  const setupPrompt = SETUP_PROMPT[locale];
  return (
    <ContractSection id="start" title={t("Your first sign-in creates a Default Project.")} cites={["s2"]}>
      <div className="ct-lanes">
        <div className="ct-lane">
          <h3 className="ct-h3">{t("In the console")}</h3>
          <p>{t("Sign in with email or Google. Add a provider key, then start a Session.")}</p>
          <div className="ct-actions">
            <a href={MOSOO_CLOUD_URL} className="ct-button">
              {t("Try mosoo")}
            </a>
          </div>
        </div>
        <div className="ct-lane">
          <h3 id="agent-lane-title" className="ct-h3">
            {t("In your coding agent")}
          </h3>
          <p>
            {t(
              "Paste the setup prompt into Codex, Claude Code, OpenCode, Cursor, or Cline. It installs the CLI and asks you for your provider key, the one value it can’t create for you.",
            )}
          </p>
          <div className="ct-command ct-ui">
            <code translate="no">{MOSOO_INSTALL_COMMAND}</code>
            <CopyButton
              getText={() => MOSOO_INSTALL_COMMAND}
              label={t("Copy command")}
              copiedLabel={t("Command copied")}
              failedLabel={t("Copy failed.")}
              variant="compact"
            />
          </div>
          <p className="ct-ui">
            <a href={MOSOO_INSTALL_SCRIPT_URL}>{t("Read the install script")}</a>
          </p>
          <pre tabIndex={0} aria-labelledby="agent-lane-title" className="ct-prompt">
            {setupPrompt}
          </pre>
          <div className="ct-copy-prompt">
            <CopyButton
              getText={() => setupPrompt}
              label={t("Copy setup prompt")}
              copiedLabel={t("Setup prompt copied")}
              failedLabel={t("Copy failed. Select and copy the prompt above.")}
            />
          </div>
        </div>
      </div>
      <p className="ct-footnote ct-ui">{t("mosoo is in Alpha. Public APIs may still change.")}</p>
    </ContractSection>
  );
}

export function ContractBelowFold(): ReactElement {
  return (
    <>
      <Boundary />
      <Durability />
      <Keys />
      <Runtimes />
      <PromisesAndLimits />
      <Proof />
      <Faq />
      <Start />
    </>
  );
}
