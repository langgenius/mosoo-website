// Repo-local adaptation of the soft-fluid material + native SVG build.
// Static OG is rendered offline from the same scene, with outlined Shantell text.
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";
import { createLive } from "../lib/live.mjs";
import { createText } from "../lib/fonts.mjs";
import { createMaterials } from "../lib/materials.mjs";
import { createDefs } from "../lib/svg.mjs";

const kit = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const [, , modulePath, siteRoot] = process.argv;
if (!modulePath || !siteRoot) throw new Error("Usage: build-site-cover.mjs <module> <website-root>");
const tokens = JSON.parse(readFileSync(join(kit, "tokens/tokens.json"), "utf8"));
const mod = await import(new URL(`../../${modulePath}`, import.meta.url));
const { id, slug } = mod.meta;
const W = 1600;
const H = 900;
const outlinedText = createText(tokens, "static");

function render(staticText = false) {
  const materialDefs = createDefs(`${id}-m`);
  const liveDefs = createDefs(`cv-${id}`);
  const m = createMaterials({ tokens, defs: materialDefs, seed: `site:${id}:v1`, width: W, height: H });
  const L = createLive({ tokens });
  if (staticText) {
    L.text = ({ cls, spacing, hook, ...props }) => outlinedText({
      ...props,
      role: cls === "cv-hand" ? "hand" : cls === "cv-mono" ? "mono" : "sans",
      letterSpacing: spacing ?? 0,
      attrs: { "data-el": hook, ...props.attrs },
    });
  }
  const scene = mod.default({ tokens, m, L, defs: liveDefs });
  return { scene, materialDefs: materialDefs.render(), liveDefs: liveDefs.render() };
}

const live = render();
const materialSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">${live.materialDefs}${live.scene.material}</svg>`;
const liveSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid slice" class="cv-svg" aria-hidden="true" focusable="false">${live.liveDefs}${live.scene.structure}</svg>\n`;
const still = render(true);
const staticSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">${still.materialDefs}${still.liveDefs}${still.scene.material}${still.scene.structure}</svg>`;

const publicDir = join(siteRoot, "apps/blog/public/blog", slug);
const coverDir = join(siteRoot, "apps/blog/src/covers/generated");
const exportsDir = join(kit, "exports/site-covers");
for (const dir of [publicDir, coverDir, exportsDir]) mkdirSync(dir, { recursive: true });
const webp = await sharp(Buffer.from(materialSvg)).webp({ quality: 84, effort: 6 }).toBuffer();
const jpg = await sharp(Buffer.from(staticSvg)).jpeg({ quality: 90, mozjpeg: true }).toBuffer();
writeFileSync(join(publicDir, "cover-material.webp"), webp);
writeFileSync(join(publicDir, "cover.jpg"), jpg);
writeFileSync(join(coverDir, `${id}.svg`), liveSvg);
writeFileSync(join(coverDir, `${id}.motion.json`), `${JSON.stringify(live.scene.motion, null, 2)}\n`);
writeFileSync(join(exportsDir, `${id}.material.svg`), materialSvg);
writeFileSync(join(exportsDir, `${id}.static.svg`), staticSvg);
const sha = (b) => createHash("sha256").update(b).digest("hex").slice(0, 16);
console.log(JSON.stringify({ id, materialBytes: webp.length, materialSha: sha(webp), liveSvgBytes: liveSvg.length, liveSha: sha(liveSvg), staticJpgBytes: jpg.length, staticSha: sha(jpg) }));
