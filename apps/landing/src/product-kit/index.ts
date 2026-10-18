// Product kit: console product moments for the website, telling the one CSV
// example story. Every component renders inside its own
// [data-surface="console"] island (console-island.css comes with it), takes
// `locale` ("en" | "zh" | "ja") and `animate`, renders its final state first,
// and replays its last step once, 3 to 5 s, when `animate` is on, the visitor
// has not asked for reduced motion, and it is first half visible.

export { ApiCall } from "./components/api-call";
export type { ApiCallProps } from "./components/api-call";
export { CodingAgentSetup, buildSetupPrompt } from "./components/coding-agent-setup";
export type { CodingAgentSetupProps } from "./components/coding-agent-setup";
export { ConsoleIsland } from "./components/island";
export { KeyBoundary } from "./components/key-boundary";
export type { KeyBoundaryProps } from "./components/key-boundary";
export { PreviewReplay } from "./components/preview-replay";
export type { PreviewReplayProps } from "./components/preview-replay";
export {
  EXAMPLE_CONFIGURED_VENDORS,
  RuntimeAvailability,
  RuntimeMatrix,
} from "./components/runtime-matrix";
export type { RuntimeAvailabilityProps, RuntimeMatrixProps } from "./components/runtime-matrix";
export { SessionContinuation } from "./components/session-continuation";
export type { SessionContinuationProps } from "./components/session-continuation";
export { TurnReceipt } from "./components/turn-receipt";
export type { TurnReceiptProps } from "./components/turn-receipt";
export * as exampleUniverse from "./data/example-universe";
export type { KitLocale } from "./i18n";
export { KIT_LOCALES } from "./i18n";
export { CATALOG_SOURCE, RUNTIMES, PRESET_MODELS, VENDORS } from "./lib/runtime-catalog";
