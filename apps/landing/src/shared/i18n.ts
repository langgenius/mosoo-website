import { locale } from "./locale";

// Strings for the site shell every landing page renders: the topbar, the mobile
// menu, the Products menu and the footer. Copy source: the v1 copy deck §1, §12
// and §18 (nav and footer microcopy). The bar's Products panel, language switch
// and phone menu (owner 2026-10-20 17:15) say what the home's bar says
// (src/home/copy/nav.json): "Language" is production's label (origin/main
// shared/i18n.ts L4 / L32); "Language ({lang})" names the switch with the short
// name it shows in place of {lang} (WCAG 2.5.3); the product lines are the
// home's, the ja mosoo line in the home's shorter wording so it keeps to one
// line in the 464px panel.
const ZH_MESSAGES = {
  "Skip to content": "跳到正文",
  "mosoo home": "mosoo 首页",
  Products: "产品",
  "Open-source Agent runtime for application backends.": "面向应用后端的开源 Agent runtime。",
  "A persistent cloud computer for agents.": "为 Agent 准备的持久云端计算机。",
  Docs: "文档",
  "Use cases": "用例",
  Blog: "博客",
  "Change language": "切换语言",
  Language: "语言",
  "Language ({lang})": "语言（{lang}）",
  Menu: "菜单",
  "mosoo on GitHub": "mosoo 的 GitHub 主页",
  "mosoo on X": "mosoo 的 X 主页",
  "Sign in": "登录",
  "Try mosoo": "试用 mosoo",
  "Open menu": "打开菜单",
  "Close menu": "关闭菜单",
  Main: "主导航",
  Footer: "页脚",
  "An open-source, API-first managed Agent runtime for application backends.":
    "开源、API 优先的托管 Agent runtime，面向应用后端。",
  Product: "产品",
  Developers: "开发者",
  "Open source": "开源",
  Community: "社区",
  "mosoo console": "mosoo 控制台",
  Status: "状态",
  Quickstart: "快速开始",
  "API reference v2": "API 参考 v2",
  Changelog: "更新日志",
  Releases: "版本发布",
  "Product spec": "产品规格",
  License: "许可证",
  Security: "安全",
  "Incident postmortems": "事故复盘",
} as const;

type Message = keyof typeof ZH_MESSAGES;

const JA_MESSAGES = {
  "Skip to content": "本文へスキップ",
  "mosoo home": "mosoo ホーム",
  Products: "プロダクト",
  "Open-source Agent runtime for application backends.": "アプリのバックエンド向けオープンソース Agent runtime。",
  "A persistent cloud computer for agents.": "Agent のための永続的なクラウドコンピューター。",
  Docs: "ドキュメント",
  "Use cases": "ユースケース",
  Blog: "ブログ",
  "Change language": "言語を切り替える",
  Language: "言語",
  "Language ({lang})": "言語（{lang}）",
  Menu: "メニュー",
  "mosoo on GitHub": "mosoo の GitHub",
  "mosoo on X": "mosoo の X",
  "Sign in": "ログイン",
  "Try mosoo": "mosoo を試す",
  "Open menu": "メニューを開く",
  "Close menu": "メニューを閉じる",
  Main: "メインナビゲーション",
  Footer: "フッター",
  "An open-source, API-first managed Agent runtime for application backends.":
    "バックエンド向け、OSS で API ファーストなマネージド Agent runtime。",
  Product: "プロダクト",
  Developers: "開発者向け",
  "Open source": "オープンソース",
  Community: "コミュニティ",
  "mosoo console": "mosoo コンソール",
  Status: "稼働状況",
  Quickstart: "クイックスタート",
  "API reference v2": "API リファレンス v2",
  Changelog: "更新履歴",
  Releases: "リリース",
  "Product spec": "製品仕様",
  License: "ライセンス",
  Security: "セキュリティ",
  "Incident postmortems": "インシデントの事後分析",
} satisfies Record<Message, string>;

const MESSAGES = { zh: ZH_MESSAGES, ja: JA_MESSAGES };

export function t(message: Message): string {
  return locale === "en" ? message : MESSAGES[locale][message];
}
