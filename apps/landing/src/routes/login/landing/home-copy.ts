// PROVISIONAL home copy (UI lock stage). Every string sits in a slot whose
// size is fixed in staging v4d/UI-LOCK.md; the content stage rewrites these
// to fit, checks them against the main repo, and adds zh/ja. Until then zh
// and ja reuse en.

import type { Locale } from "@/shared/locale";
import { locale } from "@/shared/locale";

export type Satellite = { key: string; value: string; runtime?: string };
export type SupplyCard = { name: string; badge: string; value: string; label: string; status: string; live?: boolean; runtime: string };
export type Faq = { q: string; a: string };

type HomeCopy = {
  hero: { h1a: string; h1b: string; lead: string; primary: string; secondary: string };
  object: { line: string; from: string; to: string; satellites: readonly Satellite[] };
  verbs: readonly { verb: string; desc: string }[];
  stack: { label: string; token: string; status: string; title: string; desc: string };
  supply: { a: string; b: string; cards: readonly SupplyCard[] };
  faq: { label: string; a: string; b: string; items: readonly Faq[] };
  close: { a: string; b: string; legend: string; prompt: string; button: string; done: string; fine: string };
};

const EN: HomeCopy = {
  hero: {
    h1a: "Run Agents from your backend.",
    h1b: "Continue them days later.",
    lead: "Open source and hosted. One sandbox per Session, your model key.",
    primary: "Try mosoo",
    secondary: "Read the quickstart",
  },
  object: {
    line: "Same session.",
    from: "run.completed",
    to: "run.started",
    satellites: [
      { key: "Sandbox", value: "Fresh, isolated" },
      { key: "Harness", value: "OpenAI Codex", runtime: "openai-runtime" },
      { key: "File", value: "report.md" },
      { key: "Next turn", value: "Next week" },
    ],
  },
  verbs: [
    { verb: "Call.", desc: "One request starts a Session in a fresh sandbox." },
    { verb: "Watch.", desc: "Events and files stream back while the agent works." },
    { verb: "Return.", desc: "Send the next turn to the same Session, days later." },
  ],
  stack: {
    label: "Turn 2",
    token: "+7 days",
    status: "Restored from the last turn",
    title: "Same Session, a week later.",
    desc: "The next turn starts with the last turn's files and history.",
  },
  supply: {
    a: "Four harnesses.",
    b: "One Session API.",
    cards: [
      { name: "Runtimes", badge: "pick", value: "4", label: "harnesses behind one API", status: "Chosen per Session", runtime: "acp-fallback" },
      { name: "Resume", badge: "same", value: "7 days", label: "later, same Session", status: "Waiting for the next turn", live: true, runtime: "claude-agent-sdk" },
      { name: "Keys", badge: "byok", value: "0", label: "keys inside the sandbox", status: "Proxied on every request", runtime: "openai-runtime" },
    ],
  },
  faq: {
    label: "FAQ",
    a: "Questions",
    b: "before you wire it in.",
    items: [
      {
        q: "Is it hosted, or do I run it?",
        a: "Use the hosted one at cloud.mosoo.ai. The source is on GitHub under Apache-2.0, and the README shows how to run it locally for development. mosoo is in Alpha.",
      },
      {
        q: "Whose Agent does it run?",
        a: "Yours. Your backend sends the instructions and picks the harness and model, on your own provider key. You don't create or publish an Agent first.",
      },
      {
        q: "Why not call a model API directly?",
        a: "A model API returns a reply. mosoo runs the Agent around it: tools in an isolated sandbox, files in and out, streamed events, recorded usage, and a working directory kept between turns.",
      },
      {
        q: "What is Pi?",
        a: "One of the four harnesses mosoo runs. Pi works with any supported provider, including a custom OpenAI-compatible HTTPS endpoint.",
      },
      {
        q: "What happens when I reply days later?",
        a: "The reply continues the same Session, even after the sandbox was reclaimed. mosoo restores the working directory and the native conversation from the last committed checkpoint. A cold start can take longer.",
      },
      {
        q: "Do my keys enter the sandbox?",
        a: "No. Provider keys and MCP credentials stay outside. The runtime reaches models through mosoo's proxies, which add the credential per request. Environment variables are the exception: sandbox code can read them.",
      },
    ],
  },
  close: {
    a: "Start a Session",
    b: "from your agent.",
    legend: "Paste to any agent",
    prompt: "Set up mosoo in this repo and start my first Session.",
    button: "Copy",
    done: "Copied",
    fine: "Works in Claude Code, Codex and Cursor.",
  },
};

const COPY: Record<Locale, HomeCopy> = { en: EN, zh: EN, ja: EN };

export const home = COPY[locale];
