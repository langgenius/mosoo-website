// The kit's one example universe: the CSV acceptance story of
// langgenius/mosoo scripts/public-api-session-workflow.ts (SPEC section 7) at
// 7cb9866cfc. Every product moment in the kit tells this story.
//
// Quoted from the script, verbatim: input.csv, the three prompts, the default
// instructions, the assertions (grand_total 230, then 250, the same
// private_nonce_sha256 in both turns) and the turn 3 cancellation.
//
// Example values in the product's real formats (label them "Example" on the
// page): IDs (bare ULIDs whose time prefix encodes their timestamp, the format
// of PLATFORM_ID_INPUT_PATTERN), timestamps, durations, token totals, tool
// inputs, assistant replies and the hash. The outputs are real: the Example
// agent code below was run on input.csv when the kit was built, and these are
// the files it wrote (the hash is the sha256 of the random 32-byte nonce that
// run generated). Event types and tool names are the console's
// (SESSION_PROCESS_EVENT_TYPES, domain.ts); contents follow
// pkgs/runtime-events/src/process-draft.ts (run.* carry the run ID,
// runtime timing lands as session.status, outputs scan as
// "Session files updated."), and durations follow
// apps/api/.../session-process-events.service.ts (time to the next event in
// the same run, 0 for the last).
//
// No runtime imports, so `node --test` can load this file with type stripping.

import type { SessionProcessEvent, SessionProcessEventType } from "../lib/session-events";

export const UNIVERSE_SOURCE = {
  commit: "7cb9866cfcf2010fe21917ed0a484faf2cc39235",
  repository: "langgenius/mosoo",
  script: "scripts/public-api-session-workflow.ts",
} as const;

export const INPUT_CSV = "region,revenue\nnorth,120\nsouth,80\nnorth,30\n";
export const APPENDED_ROW = "south,20";

export const PROMPTS = {
  turn1:
    "Use real Python tools to read the attached input.csv and copy it into the working directory for analysis. Generate a random private nonce in .private/nonce outside outputs. Write outputs/initial.json with grand_total and private_nonce_sha256 (hash the raw file bytes). Save outputs/report.md and outputs/chart.svg. Keep input.csv and the nonce for our next turn. Do not return success if any tool fails.",
  turn2:
    "Continue using our original input.csv and private nonce. Do not recreate them. Append south,20 to the CSV using a real tool, regenerate report.md and chart.svg, and write outputs/followup.json containing grand_total and private_nonce_sha256 using the original raw file bytes. Fail explicitly if our prior files are unavailable.",
  turn3:
    "Use a tool to sleep for 90 seconds, then say done. Do not change any files. This turn is a cancellation test.",
} as const;

// The script's default inline instructions; harness and model are the
// catalog defaults for OpenAI (MODEL_DEFAULTS.openai).
export const CONFIGURATION = {
  harness: "openai-runtime",
  instructions:
    "Use tools to analyze files, verify results and retain private working state for follow-up.",
  model: "gpt-5.5",
  provider: "openai",
  type: "inline",
} as const;

// Example: the Agent preset name the console Preview shows ("Testing {{name}}").
export const PREVIEW_AGENT_NAME = "CSV report";

export const EXAMPLE_IDS = {
  inputFile: "01M4QP7S669BBSX12Z2564J5F7",
  project: "01M3RN7Q004H111S446YV5ATC0",
  thread: "01M4QP7XQP74G0T7MAHPXVDNXW",
} as const;

export const THREAD_CREATED_AT = "2026-10-12T09:14:02.870Z";

// Example: the sha256 of the nonce the build run generated. Both turns hash the
// same raw bytes, which is what the script asserts.
export const NONCE_SHA256 = "f4607af8347daf9ce0d677ca14d1464af63c0c876a983b8fcc22fd0e7680620f";

export interface ExampleFile {
  readonly kind: "artifact" | "attachment";
  readonly name: string;
  readonly path: string;
  readonly text: string;
}

const REPORT_TURN_1 =
  "# Revenue by region\n\n| region | revenue |\n| --- | ---: |\n| north | 150 |\n| south | 80 |\n\ngrand_total: 230\n";
const REPORT_TURN_2 =
  "# Revenue by region\n\n| region | revenue |\n| --- | ---: |\n| north | 150 |\n| south | 100 |\n\ngrand_total: 250\n";

const CHART_TURN_1 =
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 360 132" font-family="system-ui, sans-serif" font-size="12" fill="#333"><text x="16" y="24" font-size="13" font-weight="600" fill="#1f1f1f">Revenue by region</text><text x="16" y="42" fill="#5c5c5c">grand_total 230</text><path d="M72.5 52v68" stroke="#d6d6d6"/><text x="64" y="72" text-anchor="end">north</text><path d="M72 58h236a4 4 0 0 1 4 4v12a4 4 0 0 1-4 4h-236z" fill="#454545"/><text x="318" y="72">150</text><text x="64" y="104" text-anchor="end">south</text><path d="M72 90h124a4 4 0 0 1 4 4v12a4 4 0 0 1-4 4h-124z" fill="#454545"/><text x="206" y="104">80</text></svg>\n';
const CHART_TURN_2 =
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 360 132" font-family="system-ui, sans-serif" font-size="12" fill="#333"><text x="16" y="24" font-size="13" font-weight="600" fill="#1f1f1f">Revenue by region</text><text x="16" y="42" fill="#5c5c5c">grand_total 250</text><path d="M72.5 52v68" stroke="#d6d6d6"/><text x="64" y="72" text-anchor="end">north</text><path d="M72 58h236a4 4 0 0 1 4 4v12a4 4 0 0 1-4 4h-236z" fill="#454545"/><text x="318" y="72">150</text><text x="64" y="104" text-anchor="end">south</text><path d="M72 90h156a4 4 0 0 1 4 4v12a4 4 0 0 1-4 4h-156z" fill="#454545"/><text x="238" y="104">100</text></svg>\n';

function jsonText(grandTotal: number): string {
  return `${JSON.stringify({ grand_total: grandTotal, private_nonce_sha256: NONCE_SHA256 }, null, 2)}\n`;
}

export const OUTPUTS = {
  chartTurn1: { kind: "artifact", name: "chart.svg", path: "outputs/chart.svg", text: CHART_TURN_1 },
  chartTurn2: { kind: "artifact", name: "chart.svg", path: "outputs/chart.svg", text: CHART_TURN_2 },
  followupJson: {
    kind: "artifact",
    name: "followup.json",
    path: "outputs/followup.json",
    text: jsonText(250),
  },
  initialJson: {
    kind: "artifact",
    name: "initial.json",
    path: "outputs/initial.json",
    text: jsonText(230),
  },
  inputCsv: { kind: "attachment", name: "input.csv", path: "input.csv", text: INPUT_CSV },
  reportTurn1: { kind: "artifact", name: "report.md", path: "outputs/report.md", text: REPORT_TURN_1 },
  reportTurn2: { kind: "artifact", name: "report.md", path: "outputs/report.md", text: REPORT_TURN_2 },
} as const satisfies Record<string, ExampleFile>;

// Example agent code: what the exec_command calls ran. Running TURN_1_CODE on
// input.csv, appending south,20, then running TURN_2_CODE writes OUTPUTS.
export const TURN_1_CODE = String.raw`import csv, hashlib, json, pathlib, secrets

rows = list(csv.DictReader(open("input.csv", newline="")))
totals = {}
for row in rows:
    totals[row["region"]] = totals.get(row["region"], 0) + int(row["revenue"])
grand_total = sum(totals.values())

pathlib.Path(".private").mkdir(exist_ok=True)
nonce = pathlib.Path(".private/nonce")
nonce.write_bytes(secrets.token_bytes(32))
digest = hashlib.sha256(nonce.read_bytes()).hexdigest()

out = pathlib.Path("outputs")
out.mkdir(exist_ok=True)
(out / "initial.json").write_text(json.dumps(
    {"grand_total": grand_total, "private_nonce_sha256": digest}, indent=2) + "\n")

table = "\n".join(f"| {r} | {v} |" for r, v in totals.items())
(out / "report.md").write_text(
    "# Revenue by region\n\n| region | revenue |\n| --- | ---: |\n"
    f"{table}\n\ngrand_total: {grand_total}\n")

def bar(y, w):
    return (f'<path d="M72 {y}h{w - 4}a4 4 0 0 1 4 4v12a4 4 0 0 1-4 4h-{w - 4}z"'
            ' fill="#454545"/>')

scale = 240 / max(totals.values())
marks = []
for i, (region, value) in enumerate(totals.items()):
    y, w = 58 + i * 32, round(value * scale)
    marks.append(
        f'<text x="64" y="{y + 14}" text-anchor="end">{region}</text>'
        f"{bar(y, w)}"
        f'<text x="{72 + w + 6}" y="{y + 14}">{value}</text>')
(out / "chart.svg").write_text(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 360 132" '
    'font-family="system-ui, sans-serif" font-size="12" fill="#333">'
    '<text x="16" y="24" font-size="13" font-weight="600" fill="#1f1f1f">'
    "Revenue by region</text>"
    f'<text x="16" y="42" fill="#5c5c5c">grand_total {grand_total}</text>'
    '<path d="M72.5 52v68" stroke="#d6d6d6"/>'
    + "".join(marks) + "</svg>\n")

print("grand_total", grand_total)
print("wrote outputs/initial.json outputs/report.md outputs/chart.svg")
`;

export const TURN_2_CODE = String.raw`import csv, hashlib, json, pathlib

nonce = pathlib.Path(".private/nonce")
if not nonce.exists() or not pathlib.Path("input.csv").exists():
    raise SystemExit("prior input.csv or .private/nonce is unavailable")

rows = list(csv.DictReader(open("input.csv", newline="")))
totals = {}
for row in rows:
    totals[row["region"]] = totals.get(row["region"], 0) + int(row["revenue"])
grand_total = sum(totals.values())
digest = hashlib.sha256(nonce.read_bytes()).hexdigest()

out = pathlib.Path("outputs")
(out / "followup.json").write_text(json.dumps(
    {"grand_total": grand_total, "private_nonce_sha256": digest}, indent=2) + "\n")

table = "\n".join(f"| {r} | {v} |" for r, v in totals.items())
(out / "report.md").write_text(
    "# Revenue by region\n\n| region | revenue |\n| --- | ---: |\n"
    f"{table}\n\ngrand_total: {grand_total}\n")

def bar(y, w):
    return (f'<path d="M72 {y}h{w - 4}a4 4 0 0 1 4 4v12a4 4 0 0 1-4 4h-{w - 4}z"'
            ' fill="#454545"/>')

scale = 240 / max(totals.values())
marks = []
for i, (region, value) in enumerate(totals.items()):
    y, w = 58 + i * 32, round(value * scale)
    marks.append(
        f'<text x="64" y="{y + 14}" text-anchor="end">{region}</text>'
        f"{bar(y, w)}"
        f'<text x="{72 + w + 6}" y="{y + 14}">{value}</text>')
(out / "chart.svg").write_text(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 360 132" '
    'font-family="system-ui, sans-serif" font-size="12" fill="#333">'
    '<text x="16" y="24" font-size="13" font-weight="600" fill="#1f1f1f">'
    "Revenue by region</text>"
    f'<text x="16" y="42" fill="#5c5c5c">grand_total {grand_total}</text>'
    '<path d="M72.5 52v68" stroke="#d6d6d6"/>'
    + "".join(marks) + "</svg>\n")

print("grand_total", grand_total)
print("private_nonce_sha256", digest)
print("wrote outputs/followup.json outputs/report.md outputs/chart.svg")
`;

// The runtime's tool call: the event title is the tool name, as in the
// product's own fixtures (apps/api/tests/public-thread-api.e2e.test.ts uses
// title "record_meal"); the command travels as the tool input.
export interface ExampleToolCall {
  readonly input: string;
  readonly output: string | null;
  readonly toolName: "exec_command";
}

const heredoc = (code: string): string => `python3 - <<'PY'\n${code}PY`;

export const TOOL_CALLS = {
  turn1Analyze: {
    input: heredoc(TURN_1_CODE),
    output: "grand_total 230\nwrote outputs/initial.json outputs/report.md outputs/chart.svg\n",
    toolName: "exec_command",
  },
  turn2Append: {
    input: "printf 'south,20\\n' >> input.csv && tail -n 2 input.csv",
    output: "north,30\nsouth,20\n",
    toolName: "exec_command",
  },
  turn2Recompute: {
    input: heredoc(TURN_2_CODE),
    output: `grand_total 250\nprivate_nonce_sha256 ${NONCE_SHA256}\nwrote outputs/followup.json outputs/report.md outputs/chart.svg\n`,
    toolName: "exec_command",
  },
  turn3Sleep: { input: "sleep 90", output: null, toolName: "exec_command" },
} as const satisfies Record<string, ExampleToolCall>;

// Assistant replies (Example), as markdown the console would render. Paths
// under outputs/ are artifact links in the console.
export const ASSISTANT_REPLIES = {
  turn1:
    "grand_total is 230 (north 150, south 80). I saved [outputs/report.md](outputs/report.md) and [outputs/chart.svg](outputs/chart.svg); `outputs/initial.json` holds the total and the private nonce hash. `input.csv` and `.private/nonce` stay in the working directory for our next turn.",
  turn2:
    "grand_total is now 250 after appending south,20. The private nonce hash matches turn 1, so this is the same working directory. I updated [outputs/report.md](outputs/report.md) and [outputs/chart.svg](outputs/chart.svg) and wrote `outputs/followup.json`.",
} as const;

// Inferred like finalizeProcessEventDurations: until the next event of the same
// run, capped at five minutes, and 0 for a run's last event.
const MAX_INFERRED_DURATION_MS = 5 * 60 * 1000;

interface RawEvent {
  readonly content: string;
  readonly id: string;
  readonly occurredAt: string;
  readonly tokens?: number;
  readonly type: SessionProcessEventType;
}

function withDurations(events: readonly RawEvent[]): SessionProcessEvent[] {
  return events.map((event, index) => {
    const next = events[index + 1];
    const gap = next === undefined ? 0 : Date.parse(next.occurredAt) - Date.parse(event.occurredAt);

    return {
      content: event.content,
      durationMs: gap >= 0 && gap <= MAX_INFERRED_DURATION_MS ? gap : 0,
      id: event.id,
      occurredAt: event.occurredAt,
      status: "available",
      tokens: event.tokens ?? null,
      type: event.type,
    };
  });
}

export type ExampleRunStatus = "cancelled" | "completed";

export interface ExampleTurn {
  readonly artifacts: readonly ExampleFile[];
  readonly assistantReply: string | null;
  readonly completedAt: string;
  readonly createdAt: string;
  readonly events: readonly SessionProcessEvent[];
  readonly index: 1 | 2 | 3;
  readonly prompt: string;
  readonly runId: string;
  readonly status: ExampleRunStatus;
  readonly toolCalls: readonly ExampleToolCall[];
}

const RUN_IDS = {
  turn1: "01M4QP7XRY69FVJXC5YPJF5ZVZ",
  turn2: "01M59QD3TSRN0A7SM90FT5PA0V",
  turn3: "01M59QGE36NNJX3SWW8S8ZS7SF",
} as const;

export const TURN_1: ExampleTurn = {
  artifacts: [OUTPUTS.initialJson, OUTPUTS.reportTurn1, OUTPUTS.chartTurn1],
  assistantReply: ASSISTANT_REPLIES.turn1,
  completedAt: "2026-10-12T09:14:18.252Z",
  createdAt: "2026-10-12T09:14:02.910Z",
  events: withDurations([
    {
      content: PROMPTS.turn1,
      id: "01M4QP7XW4CFWTRGD2DZ3WASAG",
      occurredAt: "2026-10-12T09:14:03.012Z",
      type: "user.message",
    },
    {
      content: RUN_IDS.turn1,
      id: "01M4QP7YFREYA47ZWXJ73SW2ZT",
      occurredAt: "2026-10-12T09:14:03.640Z",
      type: "run.started",
    },
    {
      content: "Runtime timing prepare_run: 2210 ms.",
      id: "01M4QP80MTHRT28MRC0732P8SR",
      occurredAt: "2026-10-12T09:14:05.850Z",
      type: "session.status",
    },
    {
      content: TOOL_CALLS.turn1Analyze.toolName,
      id: "01M4QP81WW23DTHSAYWS4S80Y8",
      occurredAt: "2026-10-12T09:14:07.132Z",
      type: "tool.use.started",
    },
    {
      content: TOOL_CALLS.turn1Analyze.toolName,
      id: "01M4QP86ARBSYTGGDDKYK1GTRH",
      occurredAt: "2026-10-12T09:14:11.672Z",
      type: "tool.use.completed",
    },
    {
      content: ASSISTANT_REPLIES.turn1,
      id: "01M4QP86SRRBH8AF7PAHQQ1MA1",
      occurredAt: "2026-10-12T09:14:12.152Z",
      type: "agent.message.delta",
    },
    {
      content: "Session files updated.",
      id: "01M4QP8A4MEC5T4ENQ2ENEX3JA",
      occurredAt: "2026-10-12T09:14:15.572Z",
      type: "session_files.updated",
    },
    {
      content: "Usage updated.",
      id: "01M4QP8CR0QB1W55AQFY941YZ5",
      occurredAt: "2026-10-12T09:14:18.240Z",
      tokens: 12906,
      type: "usage.updated",
    },
    {
      content: RUN_IDS.turn1,
      id: "01M4QP8CRC5FFPBXWFC5EPT7FD",
      occurredAt: "2026-10-12T09:14:18.252Z",
      type: "run.completed",
    },
  ]),
  index: 1,
  prompt: PROMPTS.turn1,
  runId: RUN_IDS.turn1,
  status: "completed",
  toolCalls: [TOOL_CALLS.turn1Analyze],
};

export const TURN_2: ExampleTurn = {
  artifacts: [OUTPUTS.followupJson, OUTPUTS.reportTurn2, OUTPUTS.chartTurn2, OUTPUTS.initialJson],
  assistantReply: ASSISTANT_REPLIES.turn2,
  completedAt: "2026-10-19T09:20:57.215Z",
  createdAt: "2026-10-19T09:20:41.305Z",
  events: withDurations([
    {
      content: PROMPTS.turn2,
      id: "01M59QD3TSS88V9PM9RZ1PVKBQ",
      occurredAt: "2026-10-19T09:20:41.305Z",
      type: "user.message",
    },
    {
      content: RUN_IDS.turn2,
      id: "01M59QD4BN864T7KH7A5S37XRX",
      occurredAt: "2026-10-19T09:20:41.845Z",
      type: "run.started",
    },
    {
      content: "Runtime timing prepare_run: 4820 ms.",
      id: "01M59QD9298TMKAN8EZRF814N3",
      occurredAt: "2026-10-19T09:20:46.665Z",
      type: "session.status",
    },
    {
      content: TOOL_CALLS.turn2Append.toolName,
      id: "01M59QD9PX74WRDXDDFJKJQ0A3",
      occurredAt: "2026-10-19T09:20:47.325Z",
      type: "tool.use.started",
    },
    {
      content: TOOL_CALLS.turn2Append.toolName,
      id: "01M59QDA33Y7285AJP9KCS3A1S",
      occurredAt: "2026-10-19T09:20:47.715Z",
      type: "tool.use.completed",
    },
    {
      content: TOOL_CALLS.turn2Recompute.toolName,
      id: "01M59QDAHS5RP6KXNQERGGNTY5",
      occurredAt: "2026-10-19T09:20:48.185Z",
      type: "tool.use.started",
    },
    {
      content: TOOL_CALLS.turn2Recompute.toolName,
      id: "01M59QDDHQ6ZE7S5NX7T2F7DNK",
      occurredAt: "2026-10-19T09:20:51.255Z",
      type: "tool.use.completed",
    },
    {
      content: ASSISTANT_REPLIES.turn2,
      id: "01M59QDDZFRSE8RDNK3HPT46D4",
      occurredAt: "2026-10-19T09:20:51.695Z",
      type: "agent.message.delta",
    },
    {
      content: "Session files updated.",
      id: "01M59QDGY5GG03CH8TSA8F1GKQ",
      occurredAt: "2026-10-19T09:20:54.725Z",
      type: "session_files.updated",
    },
    {
      content: "Usage updated.",
      id: "01M59QDKBH0ZGTAWE3CVGATVNT",
      occurredAt: "2026-10-19T09:20:57.201Z",
      tokens: 15244,
      type: "usage.updated",
    },
    {
      content: RUN_IDS.turn2,
      id: "01M59QDKBZ9XVYKY94B0VJTVA9",
      occurredAt: "2026-10-19T09:20:57.215Z",
      type: "run.completed",
    },
  ]),
  index: 2,
  prompt: PROMPTS.turn2,
  runId: RUN_IDS.turn2,
  status: "completed",
  toolCalls: [TOOL_CALLS.turn2Append, TOOL_CALLS.turn2Recompute],
};

// The script sends turn 3, then {"type":"user_interrupt"}, and waits for the
// run to end `cancelled`. process-draft.ts records the runtime's run.cancelled
// as a `run.completed` process event (content: the run ID), so the event log
// alone reads "Run completed"; the run status is what says cancelled, and the
// console shows it as "cancelled ✗" with "Run cancelled". No usage event.
export const TURN_3: ExampleTurn = {
  artifacts: [],
  assistantReply: null,
  completedAt: "2026-10-19T09:22:52.024Z",
  createdAt: "2026-10-19T09:22:30.118Z",
  events: withDurations([
    {
      content: PROMPTS.turn3,
      id: "01M59QGE361VSXVRREWJJK8FJM",
      occurredAt: "2026-10-19T09:22:30.118Z",
      type: "user.message",
    },
    {
      content: RUN_IDS.turn3,
      id: "01M59QGEK65NHH9P1RPM78N3VE",
      occurredAt: "2026-10-19T09:22:30.630Z",
      type: "run.started",
    },
    {
      content: "Runtime timing prepare_run: 540 ms.",
      id: "01M59QGF42A1FR21F84XTA9ZTQ",
      occurredAt: "2026-10-19T09:22:31.170Z",
      type: "session.status",
    },
    {
      content: TOOL_CALLS.turn3Sleep.toolName,
      id: "01M59QGGPEEVD389EG47ZW0PX7",
      occurredAt: "2026-10-19T09:22:32.782Z",
      type: "tool.use.started",
    },
    {
      content: RUN_IDS.turn3,
      id: "01M59QH3FRJJX26E6DR1VQA1ZM",
      occurredAt: "2026-10-19T09:22:52.024Z",
      type: "run.completed",
    },
  ]),
  index: 3,
  prompt: PROMPTS.turn3,
  runId: RUN_IDS.turn3,
  status: "cancelled",
  toolCalls: [TOOL_CALLS.turn3Sleep],
};

export const TURNS: readonly ExampleTurn[] = [TURN_1, TURN_2, TURN_3];

// The create call from the content-truth brief (section 4): fields from the
// v2 OpenAPI example, the OpenAI default model, an inline configuration.
export const API_CALL = {
  curl: `curl https://cloud.mosoo.ai/api/v2/projects/$PROJECT_ID/threads \\
  -H "Authorization: Bearer $MOSOO_API_KEY" \\
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
  }'`,
  // Example excerpt of the 201 body (CreateThreadResponse): two fields each
  // of `thread` and `run`; `links` and the other fields are left out.
  response: `{
  "thread": { "id": "01M59MGA6WS6HK4G8JDDMA8C6M", "agent_id": null },
  "run": { "id": "01M59MGA7N3D92488YKHH5JNX2", "status": "queued" }
}`,
  status: "201 Created",
} as const;
