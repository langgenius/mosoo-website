// Home copy for the v4c "Stage" layout, keyed by the slots in
// mosoo-website-redesign-staging/v4c/UI-LOCK.md (slot ids in the comments).
//
// PROVISIONAL: the UI stage filled every slot with the UI-FORMS board's sample content or the c-stage
// proposal's copy, each string no longer than its slot. The content stage rewrites these strings to the
// slot sizes; it never adds a key (a string that does not fit is rewritten, not given a new slot).
// zh and ja reuse en until the content stage translates them.

export type HomeLocale = "en" | "zh" | "ja";

export type FaqItem = { q: string; a: string };

export type FeedCard = {
  /** C: relative time, 1x8, Fragment Mono 12. */
  time: string;
  /** D: event name from MAIN pkgs/contracts/src/session/session.contract.ts, 1x22. */
  event: string;
  /** E: 1x42, Inter 15/600. */
  title: string;
  /** F: 1x66, Inter 13. */
  result: string;
  live?: boolean;
};

export type HomeCopy = {
  meta: { title: string; description: string };
  nav: { docs: string; github: string; cta: string; skip: string };
  hero: {
    /** S1-A / S1-B: H1, two lines, 1x22 each, display 78. */
    lineA: string;
    lineB: string;
    /** S1-C: 2x44 (<=14 words), Inter 19. */
    lead: string;
    /** S1-D: 1x12, ink pill. */
    cta: string;
  };
  act1: {
    /** S2.1-A: 2x36 two-value title, display 40 (second part ink-3). */
    titleA: string;
    titleB: string;
    /** S2.1-B: row labels x5, 1x12. */
    rows: readonly [string, string, string, string, string];
    /** S2.1-C: harness names, 1x18 each, rotated in this order. */
    harnesses: readonly [string, string, string, string];
    /** S2.1-D: the other four values, 1x40 each (Files is one mono token). */
    model: string;
    sandbox: string;
    files: string;
    resume: string;
  };
  act2: {
    /** S2.2-A: 1x13, display 64. S2.2-B: 1x17. */
    halfA: string;
    halfB: string;
    /** S2.2-C..F: five cards, newest first. */
    cards: readonly FeedCard[];
  };
  act3: {
    /** S2.3-A: 2x36 two-value title, display 40 on night. */
    titleA: string;
    titleB: string;
    /** S2.3-L: tick labels x5, 1x10, Fragment Mono 11 uppercase. */
    ticks: readonly [string, string, string, string, string];
    /** S2.3-B: 1x60; the first sentence is set in 500. */
    noteStrong: string;
    note: string;
  };
  statement: {
    /** S3-A: 3x26 (<=84 chars, <=16 words) around four glyph circles (G). Parts are joined by glyphs. */
    parts: readonly [string, string, string, string, string];
  };
  faq: {
    /** S4-A: 1x10, display 44. */
    title: string;
    /** S4-B: question 1-2x44; S4-C: answer <=40 words. Exactly six. */
    items: readonly FaqItem[];
  };
  closing: {
    /** S5-A: 2x18, display 48. */
    lineA: string;
    lineB: string;
    /** S5-B legend 1x18; S5-C instruction 1x56; S5-D button 1x8; S5-E fine print 1x40. */
    legend: string;
    prompt: string;
    copy: string;
    copied: string;
    fine: string;
  };
  footer: {
    /** S6-A: 1x24, display 32. S6-B: 2x55. S6-C: assistant pills, 1x14 each. */
    askTitle: string;
    askNote: string;
    askPrompt: string;
    links: readonly { label: string; href: string }[];
    languageLabel: string;
    credit: string;
  };
};

const CONSOLE = "https://cloud.mosoo.ai";
const GITHUB = "https://github.com/langgenius/mosoo";
const DOCS = "https://mosoo.ai/docs/";

const EN: HomeCopy = {
  meta: {
    title: "Open-source Agent runtime for application backends | mosoo",
    // README L8 sentence goes here at the content stage (decision 7).
    description:
      "mosoo is an open-source Agent runtime for app backends. Run OpenAI Codex, Claude Agent SDK, OpenCode, and Pi behind one API, with a sandbox per Session.",
  },
  nav: { docs: "Docs", github: "GitHub", cta: "Try mosoo", skip: "Skip to content" },
  hero: {
    lineA: "Agent Sessions",
    lineB: "for your backend.",
    lead: "One request starts a Session in its own sandbox. Events and files come back.",
    cta: "Try mosoo",
  },
  act1: {
    titleA: "One Session, five parts.",
    titleB: "Swap the harness, keep the rest.",
    rows: ["Harness", "Model", "Sandbox", "Files", "Resume"],
    harnesses: ["OpenAI Codex", "Claude Agent SDK", "OpenCode", "Pi"],
    model: "Your provider key",
    sandbox: "Isolated, one per Session",
    files: "outputs/report.md",
    resume: "A minute or seven days later",
  },
  act2: {
    halfA: "Same session,",
    halfB: "a week later.",
    cards: [
      { time: "+7 days", event: "run.started", title: "You: add Q3 to the report", result: "Picked up where the last turn stopped.", live: true },
      { time: "+2 min", event: "run.completed", title: "Turn 1 done", result: "Sandbox recycled after idle; the Session stays." },
      { time: "+1 min", event: "session_files.updated", title: "outputs/report.md written", result: "Two files changed in the sandbox." },
      { time: "+40 s", event: "tool.use.completed", title: "bash · python analyze.py", result: "exit 0" },
      { time: "+0", event: "run.started", title: "You: analyze input.csv", result: "Codex started in a fresh sandbox." },
    ],
  },
  act3: {
    titleA: "Reply a minute or seven days later.",
    titleB: "Same Session.",
    ticks: ["+0", "+1 min", "+1 hour", "+1 day", "+7 days"],
    noteStrong: "Sandbox recycled, Session kept.",
    note: "The next turn starts where the last one ended.",
  },
  statement: {
    parts: ["Codex", "Claude,", "OpenCode", "or Pi", "— one API runs each one in its own sandbox."],
  },
  faq: {
    title: "FAQs",
    items: [
      {
        q: "Is it hosted, or do I run it myself?",
        a: "The quickest way is the hosted console at cloud.mosoo.ai. The source is on GitHub under Apache-2.0, and the README explains how to run it locally for development.",
      },
      {
        q: "Whose Agent does it run?",
        a: "Yours. One request carries the harness, provider, model, instructions and input. Nothing to publish first; you need a saved Agent preset only to attach Skills or MCP servers.",
      },
      {
        q: "Why not call a model API directly?",
        a: "A model call returns tokens. A Session runs a whole Agent turn: the harness, its tools and files in a sandbox, saved events, and a checkpoint you can continue from.",
      },
      {
        q: "What is Pi?",
        a: "One of the four runtimes, next to OpenAI Codex, Claude Agent SDK and OpenCode. Its API id is pi and it takes text input only. You pick the runtime per Session.",
      },
      {
        q: "Who pays for model usage?",
        a: "You do, directly. Model keys belong to your Project and the provider bills your account. mosoo supplies no models and sets no spending cap.",
      },
      {
        q: "Do my keys enter the sandbox?",
        a: "No. Provider keys and MCP credentials stay outside; mosoo's proxies add them on each request. Environment variables are different: code in the sandbox can read them.",
      },
    ],
  },
  closing: {
    lineA: "Start a Session",
    lineB: "from your agent.",
    legend: "Paste to any agent",
    prompt: "Set up mosoo in this repo and start my first Session.",
    copy: "Copy",
    copied: "Copied",
    fine: "Works in Claude Code, Codex and Cursor.",
  },
  footer: {
    askTitle: "Want the short version?",
    askNote: "Ask an assistant to summarize mosoo, with links back to the docs and the repo.",
    askPrompt: "Summarize mosoo (https://mosoo.ai) for a backend developer: what it runs, how a Session works, and where the docs are.",
    links: [
      { label: "Docs", href: DOCS },
      { label: "API reference", href: `${DOCS}api-reference-v2/` },
      { label: "GitHub", href: GITHUB },
      { label: "Console", href: CONSOLE },
      { label: "Pricing", href: "/pricing" },
      { label: "Status", href: "/status" },
      { label: "Use cases", href: "/use-cases" },
    ],
    languageLabel: "Language",
    credit: "© 2026 LangGenius, Inc.",
  },
};

export const HOME_COPY: Record<HomeLocale, HomeCopy> = { en: EN, zh: EN, ja: EN };

export const LINKS = { console: CONSOLE, github: GITHUB, docs: DOCS } as const;
