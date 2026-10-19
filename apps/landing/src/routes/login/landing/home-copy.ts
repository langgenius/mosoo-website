import { locale } from "@/shared/locale";
import type { Locale } from "@/shared/locale";

// PROVISIONAL copy for the instrument home (v4a, stage 1: UI lock). Every
// string sits in a slot whose size is locked in v4a/UI-LOCK.md; the content
// stage rewrites them to those sizes and checks each claim against the main
// repo. zh and ja reuse en until then.

export type TranscriptLine =
  | { kind: "prompt"; text: string; at: number; rulerAt: number }
  | { kind: "step"; verb: string; arg: string; result?: string; at: number; rulerAt: number }
  | { kind: "gap"; at: number; rulerAt: number };

export type FaqItem = { question: string; answer: string };

const EN = {
  hero: {
    // Slot H1-A / H1-B: 1 x 18 characters each.
    title: ["The Agent runtime", "for your backend."],
    // Slot H-L: 2 x 44 characters.
    lead: "One API call starts a sandboxed Session. Continue it seven days later.",
    primary: "Try mosoo",
    // U12 in the hero: window name, the prompt, two steps (the second running).
    windowName: "codex — ~/reports",
    lines: [
      { kind: "prompt", text: "Chart the totals in input.csv.", at: 0, rulerAt: 0 },
      { kind: "step", verb: "Read", arg: "input.csv", result: "parsed", at: 0, rulerAt: 0 },
      { kind: "step", verb: "Bash", arg: "python chart.py", at: 0, rulerAt: 0 },
    ] satisfies TranscriptLine[],
  },
  stage: {
    title: ["Reply in a minute", "or in seven days."],
    lead: "The sandbox may be reclaimed. Files and conversation come back from the last checkpoint.",
    windowName: "codex — ~/reports",
    ruler: ["+0", "+1 min", "+1 hour", "+1 day", "+7 days"],
    lines: [
      { kind: "prompt", text: "Read input.csv, chart the totals, save a report.", at: 0, rulerAt: 0 },
      { kind: "step", verb: "Read", arg: "input.csv", result: "parsed", at: 0.07, rulerAt: 0.04 },
      { kind: "step", verb: "Bash", arg: "python chart.py", result: "exit 0", at: 0.15, rulerAt: 0.12 },
      { kind: "step", verb: "Write", arg: "outputs/report.md", result: "session_files.updated", at: 0.23, rulerAt: 0.22 },
      { kind: "gap", at: 0.33, rulerAt: 0.44 },
      { kind: "prompt", text: "Add last quarter to the report.", at: 0.7, rulerAt: 0.96 },
      { kind: "step", verb: "Read", arg: "outputs/report.md", result: "restored", at: 0.79, rulerAt: 0.965 },
      { kind: "step", verb: "Write", arg: "outputs/report.md", result: "run.completed", at: 0.88, rulerAt: 0.97 },
    ] satisfies TranscriptLine[],
  },
  spec: {
    title: ["One Session, five parts.", "Swap the harness, keep the rest."],
    rows: {
      harness: "Harness",
      model: "Model",
      sandbox: "Sandbox",
      files: "Files",
      resume: "Resume",
    },
    model: "Your provider key",
    sandbox: "Isolated, one per Session",
    file: "outputs/report.md",
    resume: "A minute or seven days later",
  },
  faq: {
    title: ["Questions", "before you wire it in."],
    items: [
      {
        question: "Is mosoo hosted or open source?",
        answer:
          "Both. The hosted console runs at cloud.mosoo.ai. The source is on GitHub under Apache-2.0, and the README covers local development. mosoo is in Alpha, so public APIs may still change.",
      },
      {
        question: "Whose agent does it run?",
        answer:
          "Yours. One request carries the harness, provider, model, instructions and input, so no Agent has to be created first. mosoo runs it on OpenAI Codex, Claude Agent SDK, OpenCode or Pi.",
      },
      {
        question: "Why not call a model API directly?",
        answer:
          "A model API returns text. mosoo runs the whole agent turn: tools in a sandbox, files under outputs/, a stream of events, and a checkpoint, so the same Session can continue later.",
      },
      {
        question: "What is Pi?",
        answer:
          "One of the four harnesses mosoo runs, next to OpenAI Codex, Claude Agent SDK and OpenCode. Choose it per Session. It takes text input.",
      },
      {
        question: "What happens when I reply days later?",
        answer:
          "The reply continues the same Session. If the sandbox was reclaimed, mosoo restores the working directory and the conversation from the last committed checkpoint. Live processes are not carried over.",
      },
      {
        question: "Who pays for model usage?",
        answer:
          "You do, directly. Provider keys belong to your Project, and the provider bills your account. Keys stay outside the sandbox; mosoo’s proxies add them to each request.",
      },
    ] satisfies FaqItem[],
  },
  closing: {
    title: ["Start a Session", "from your agent."],
    legend: "Paste to any agent",
    prompt: "Set up mosoo in this repo and start my first Session.",
    copy: "Copy",
    copied: "Copied",
    note: "Works in Codex, Claude Code and Cursor.",
  },
  end: {
    event: "run.completed",
    status: "waiting for the next turn",
  },
  footer: {
    askTitle: "Want the short version?",
    askLead: "Ask an assistant to sum up mosoo: one API that runs your agent in a sandboxed Session.",
    askPrompt: "Summarize mosoo (https://mosoo.ai), the open-source Agent runtime for app backends.",
    columns: {
      product: "Product",
      source: "Source",
      company: "Company",
    },
    links: {
      docs: "Docs",
      quickstart: "Quickstart",
      api: "API reference",
      pricing: "Pricing",
      status: "Status",
      github: "GitHub",
      releases: "Releases",
      license: "Apache-2.0",
      blog: "Blog",
      useCases: "Use cases",
      llms: "llms.txt",
    },
    credit: "© 2026 LangGenius, Inc.",
    language: "Language",
  },
  nav: {
    home: "mosoo home",
    docs: "Docs",
    blog: "Blog",
    github: "mosoo on GitHub",
    signIn: "Sign in",
    try: "Try mosoo",
    skip: "Skip to content",
  },
};

export type HomeCopy = typeof EN;

const COPY: Record<Locale, HomeCopy> = { en: EN, zh: EN, ja: EN };

export const copy: HomeCopy = COPY[locale];
