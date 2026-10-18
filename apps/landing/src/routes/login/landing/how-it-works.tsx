import type { ReactElement, ReactNode } from "react";

import { docsUrl } from "../links";
import { CopyButton } from "./copy-button";
import { t } from "./i18n";
import { ArrowLink, SectionHeading, WithCode } from "./ui";

// Copy deck §6. The request body is the OpenAPI v2 inline example
// (POST /projects/{projectId}/threads) with the model set to the catalog's
// OpenAI default, gpt-5.5; the variable names match the docs quickstart and
// the console's setup prompt.
const START_SESSION_REQUEST = `curl https://cloud.mosoo.ai/api/v2/projects/$MOSOO_PROJECT_ID/threads \\
  -H "Authorization: Bearer $MOSOO_API_TOKEN" \\
  -H "Content-Type: application/json" \\
  -H "Idempotency-Key: report-001" \\
  -d '{
    "configuration": {
      "type": "inline",
      "harness": "openai-runtime",
      "provider": "openai",
      "model": "gpt-5.5",
      "instructions": "Analyze the supplied material and save the results."
    },
    "input": {
      "type": "user.message",
      "content": [{ "type": "text", "text": "Create an analysis report." }]
    }
  }'`;

const SHELL_TOKEN = /^curl|\s-[Hd](?=\s)|\$[A-Z_]+|"[^"]*"/g;

function withVariables(text: string): ReactNode[] {
  return text.split(/(\$[A-Z_]+)/).map((piece, index) =>
    piece.startsWith("$") ? (
      // Pieces of a fixed string: the index is a stable key.
      <span key={index} className="text-amber">
        {piece}
      </span>
    ) : (
      piece
    ),
  );
}

/** Light syntax colouring for the one fixed sample: command and flags,
    environment variables, JSON keys and string values. */
function highlightShellLine(line: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  let cursor = 0;

  for (const match of line.matchAll(SHELL_TOKEN)) {
    const token = match[0];
    const start = match.index;
    if (start > cursor) {
      nodes.push(line.slice(cursor, start));
    }

    if (token === "curl" || token.trimStart().startsWith("-")) {
      nodes.push(
        <span key={start} className="font-semibold text-green-300">
          {token}
        </span>,
      );
    } else if (token.startsWith("$")) {
      nodes.push(
        <span key={start} className="text-amber">
          {token}
        </span>,
      );
    } else {
      const isKey = line.slice(start + token.length).trimStart().startsWith(":");
      nodes.push(
        <span key={start} className={isKey ? "text-paper-100" : "text-green-200"}>
          {withVariables(token)}
        </span>,
      );
    }
    cursor = start + token.length;
  }

  if (cursor < line.length) {
    nodes.push(line.slice(cursor));
  }
  return nodes;
}

function steps(): readonly { title: string; body: string; input: string; output: string }[] {
  return [
    {
      title: t("Add your model key."),
      body: t(
        "Add a provider key to your Project, then create a Project API key. It starts with `msp_` and is shown once.",
      ),
      input: t("your provider key"),
      output: t("a Project API key"),
    },
    {
      title: t("Start a Session."),
      body: t(
        "Send one request with the harness, provider, model, instructions, input, and any files. Save the `thread.id` you get back.",
      ),
      input: t("one request"),
      output: t("a `thread.id`"),
    },
    {
      title: t("mosoo runs the turn."),
      body: t("The harness writes code and runs tools in the Session’s own sandbox. Your keys stay outside it."),
      input: t("the turn"),
      output: t("events, artifacts, usage, and a checkpoint"),
    },
    {
      title: t("Follow, download, continue."),
      body: t(
        "Stream events over SSE, download files from `outputs/`, and read the usage of every model call. Reply to the same Thread whenever you’re ready.",
      ),
      input: t("a follow-up, now or days later"),
      output: t("the next turn in the same Session"),
    },
  ];
}

export function HowItWorks(): ReactElement {
  return (
    <section aria-labelledby="how-title" className="px-4 py-20 md:px-6 md:py-24">
      <div className="grid grid-cols-1 gap-12 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-14">
        <div>
          <SectionHeading
            id="how-title"
            title={t("From one request to a finished report")}
            intro={t(
              "Say your backend needs a research report. It calls mosoo over HTTPS with a Project API key, and the report comes back as a file.",
            )}
          />
          <ol className="border-border-strong mt-10 border-t">
            {steps().map((step, index) => (
              <li
                key={step.title}
                className="border-border-strong grid grid-cols-[2rem_minmax(0,1fr)] gap-x-3 border-b py-6"
              >
                <span aria-hidden="true" className="text-ink-500 pt-[3px] font-mono text-[14px]">
                  {index + 1}
                </span>
                <div>
                  <h3 className="text-ink-900 text-[18px] leading-[1.35] font-semibold">{step.title}</h3>
                  <p className="text-ink-500 mt-2 text-[16px] leading-[1.6]">
                    <WithCode text={step.body} />
                  </p>
                  <dl className="mt-4 grid gap-x-6 gap-y-1.5 text-[16px] leading-[1.5] sm:grid-cols-2">
                    <div className="flex gap-2">
                      <dt className="text-ink-900 shrink-0 font-semibold">{t("In")}</dt>
                      <dd className="text-ink-700">
                        <WithCode text={step.input} />
                      </dd>
                    </div>
                    <div className="flex gap-2">
                      <dt className="text-ink-900 shrink-0 font-semibold">{t("Out")}</dt>
                      <dd className="text-ink-700">
                        <WithCode text={step.output} />
                      </dd>
                    </div>
                  </dl>
                </div>
              </li>
            ))}
          </ol>
        </div>

        <div className="self-start lg:sticky lg:top-24">
          <div className="bg-ink-900 overflow-hidden rounded-[14px]">
            <div className="border-paper-100/10 flex items-center justify-between gap-3 border-b px-4 py-2.5">
              <p id="how-code-title" className="text-paper-100 text-[14px] font-semibold">
                {t("Start a Session")}
              </p>
              <CopyButton
                getText={() => START_SESSION_REQUEST}
                label={t("Copy request")}
                copiedLabel={t("Request copied")}
                failedLabel={t("Copy failed.")}
                variant="dark"
              />
            </div>
            {/* Scrolls sideways on narrow screens instead of wrapping the
                command; focusable so keyboard users can scroll it too. */}
            <pre
              tabIndex={0}
              aria-labelledby="how-code-title"
              translate="no"
              className="text-paper-100 focus-visible:ring-paper-100 m-0 overflow-x-auto p-4 font-mono text-[13px] leading-[1.7] lg:text-[12.5px] outline-none focus-visible:ring-2 focus-visible:ring-inset md:p-5"
            >
              <code>
                {START_SESSION_REQUEST.split("\n").map((codeLine, index) => (
                  // Lines of a fixed sample: the index is a stable key.
                  <span key={index} className="block">
                    {highlightShellLine(codeLine)}
                  </span>
                ))}
              </code>
            </pre>
          </div>
          <div className="mt-5 flex flex-col gap-2">
            <ArrowLink href={docsUrl("api-reference-v2/")} className="self-start">
              {t("Open the v2 API reference")}
            </ArrowLink>
            <p className="text-ink-500 text-[16px] leading-[1.6]">
              {t("Model IDs change often. Check the models available in your Project before you copy this.")}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
