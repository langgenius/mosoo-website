import type { ReactElement } from "react";

import { mountFlipSlot } from "@/effects/flip-slot";

import { copy } from "./home-copy";
import {
  Bracketed,
  CornerCrosses,
  EnvironmentGlyph,
  ProviderKeyGlyph,
  RuntimeGlyph,
} from "./instrument-ui";

// The four harnesses, by runtime catalog id (pkgs/runtime-catalog in the main
// repo; the names are the console's display names).
const HARNESSES = [
  { id: "openai-runtime", name: "OpenAI Codex" },
  { id: "claude-agent-sdk", name: "Claude Agent SDK" },
  { id: "acp-fallback", name: "OpenCode" },
  { id: "pi", name: "Pi" },
] as const;

/**
 * 03 The spec table (UI-FORMS U10, dark skin): a13n's typed spec table
 * (refs/devices/crops/a13n-spec-table.jpg). Five rows, each value written a
 * different way; the Harness value is the one large value and turns over
 * every 2.4s. Corner crosses on the frame from ACE (issue #96).
 */
export function SpecSection(): ReactElement {
  const rest = HARNESSES.slice(1)
    .map((harness) => harness.name)
    .join(" · ");

  return (
    <section
      id="parts"
      aria-labelledby="spec-title"
      className="i-section i-spec"
    >
      <h2 id="spec-title" className="i-display i-h2 i-spec-title">
        <Bracketed lines={copy.spec.title} />
      </h2>
      <div className="i-spec-frame" data-product-ui="">
        <CornerCrosses />
        <dl className="i-spec-table">
          <div className="i-spec-row i-spec-row-lead">
            <dt>{copy.spec.rows.harness}</dt>
            <dd>
              <span
                className="i-flip"
                data-flip=""
                ref={(element) =>
                  element ? mountFlipSlot(element) : undefined
                }
              >
                {HARNESSES.map((harness, index) => (
                  <span
                    key={harness.id}
                    className="i-flip-item"
                    data-flip-item=""
                    hidden={index !== 0}
                  >
                    <RuntimeGlyph runtimeId={harness.id} size={28} />
                    <span className="i-display i-spec-big">{harness.name}</span>
                  </span>
                ))}
              </span>
              <span className="i-flip-rest">{rest}</span>
            </dd>
          </div>
          <div className="i-spec-row">
            <dt>{copy.spec.rows.model}</dt>
            <dd>
              <ProviderKeyGlyph />
              {copy.spec.model}
            </dd>
          </div>
          <div className="i-spec-row">
            <dt>{copy.spec.rows.sandbox}</dt>
            <dd>
              <EnvironmentGlyph />
              {copy.spec.sandbox}
            </dd>
          </div>
          <div className="i-spec-row">
            <dt>{copy.spec.rows.files}</dt>
            <dd>
              <code className="i-token" translate="no">
                {copy.spec.file}
              </code>
            </dd>
          </div>
          <div className="i-spec-row">
            <dt>{copy.spec.rows.resume}</dt>
            <dd>{copy.spec.resume}</dd>
          </div>
        </dl>
      </div>
    </section>
  );
}
