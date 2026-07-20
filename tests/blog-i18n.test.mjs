import assert from "node:assert/strict";
import test from "node:test";

import {
  getIndexHreflangAlternates,
  getPostHreflangAlternates,
} from "../apps/blog/src/lib/seo.mjs";

const posts = [
  { id: "guide.mdx", data: { locale: "en", permalink: "guide", translationKey: "guide" } },
  { id: "guide-zh.mdx", data: { locale: "zh", permalink: "guide", translationKey: "guide" } },
  { id: "guide-ja.mdx", data: { locale: "ja", permalink: "guide", translationKey: "guide" } },
];

test("blog indexes expose every language plus an English default", () => {
  assert.deepEqual(getIndexHreflangAlternates("/blog"), {
    en: "/blog",
    "zh-CN": "/blog/zh",
    ja: "/blog/ja",
    "x-default": "/blog",
  });
});

test("translated posts expose reciprocal hreflang links", () => {
  assert.deepEqual(getPostHreflangAlternates(posts[1], posts, "/blog"), {
    en: "/blog/guide",
    "zh-CN": "/blog/zh/guide",
    ja: "/blog/ja/guide",
    "x-default": "/blog/guide",
  });
});

test("unpaired posts do not claim unavailable translations", () => {
  const single = {
    id: "standalone.mdx",
    data: { locale: "en", permalink: "standalone", translationKey: "standalone" },
  };
  assert.equal(getPostHreflangAlternates(single, [single], "/blog"), undefined);
});
