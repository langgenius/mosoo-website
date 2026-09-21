// Drafts never ship. `astro build` leaves every `draft: true` entry out; `astro dev`
// lists them so a pre-publication article can be reviewed locally, clearly labelled.
// The RSS feed always uses production rules.
export const SHOW_DRAFTS: boolean = import.meta.env.DEV;

export const isListed = (data: { draft: boolean }): boolean => !data.draft || SHOW_DRAFTS;

export const draftLabel = { en: "Draft · local only", zh: "草稿 · 仅本地预览", ja: "下書き · ローカルのみ" } as const;
