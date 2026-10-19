// Dev-only leak control: the same probes as preview.tsx, without importing
// the kit. Both pages print a computed-style report into #probe-report.

import "../../shared/styles/app.css";

import { useState } from "react";
import type { ReactElement } from "react";
import { createRoot } from "react-dom/client";

import { Probes, readProbeReport } from "./probes";

function Control(): ReactElement {
  const [report, setReport] = useState<string>("");

  return (
    <div data-theme="landing" style={{ background: "var(--bg)", padding: 16 }}>
      <div
        ref={(node) => {
          if (node !== null && report === "") {
            globalThis.requestAnimationFrame(() => {
              setReport(JSON.stringify(readProbeReport(node), null, 1));
            });
          }
        }}
      >
        <Probes />
        <pre id="probe-report" style={{ fontSize: 11, whiteSpace: "pre-wrap" }}>
          {report}
        </pre>
      </div>
    </div>
  );
}

const root = document.getElementById("root");

if (root !== null) {
  createRoot(root).render(<Control />);
}
