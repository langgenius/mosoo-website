// Where the index cards cut their 11:8 window out of each 16:9 cover: the horizontal centre of the window, as a
// fraction of the cover's width. The window keeps 1237.5 of the cover's 1600 units, so the value must stay within
// 0.3867–0.6133 for the window to stay on the artwork; covers not listed are cut in the middle (0.5).
//
// Measured, not guessed (staging v5/blog/NOTES.md, "11:8 裁切"): the centred window cut real content off five covers
// (the status and artifact chips, "agents", "replaceable", the list numbers). Each value centres the cover's content
// box (live-SVG text and shapes plus the panels baked into cover-material.webp) in the window:
//   api-cli-skill        list numbers at x 152 → the window 52–1290 keeps them and drops the round "repeat"
//                        badge (1290–1428) whole instead of halving it; the terminal bleeds off both edges
//   headless-agent-api   content 328–1530 → window 310–1548; the dark panel (from 232) bleeds off the left
//   mosoo-computer       content 327–964 → centred, instead of sitting in the left half of the card
//   pet-and-cattle       content 294–1486 ("replaceable") → window 271–1509
//   responses-to-agents  "response" 253 … "agents" 1451 → window 233–1471; only the outer arcs are cut
// This belongs with the cover manifest (tools/soft-fluid/manifests/site-covers.json) once the pipeline emits it.
export const CARD_COVER_FOCUS: Readonly<Record<string, number>> = {
  "api-cli-skill": 0.42,
  "headless-agent-api": 0.58,
  "mosoo-computer": 0.403,
  "pet-and-cattle": 0.556,
  "responses-to-agents": 0.5325,
};

export function cardCoverFocus(cover: string | undefined): number {
  return (cover ? CARD_COVER_FOCUS[cover] : undefined) ?? 0.5;
}
