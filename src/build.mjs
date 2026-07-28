/* Builds every deliverable:
     dist/<slug>/<slug>-A4.pdf
     dist/<slug>/<slug>-US-Letter.pdf
     dist/<slug>/images/page-NN.png     -> Etsy listing photos
     dist/<slug>/images/hero.png        -> the thumbnail buyers see in search
     dist/complete-relief-bundle.zip

   Usage: npm run build          (everything)
          npm run build -- --preview   (images only, faster loop) */

import { mkdirSync, writeFileSync, rmSync, existsSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";
import { execSync, spawnSync } from "node:child_process";
import { products, bundle } from "./products.mjs";
import { renderProduct, FORMATS } from "./render.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const DIST = join(ROOT, "dist");
const PREVIEW_ONLY = process.argv.includes("--preview");

/* Playwright is installed globally in this environment, so fall back to the
   global npm root rather than requiring a local install. */
async function loadChromium() {
  try {
    return (await import("playwright")).chromium;
  } catch {
    const root = execSync("npm root -g").toString().trim();
    return createRequire(import.meta.url)(join(root, "playwright")).chromium;
  }
}

const A4_PX = { width: 794, height: 1123 };

async function buildProduct(browser, product) {
  const outDir = join(DIST, product.slug);
  const imgDir = join(outDir, "images");
  mkdirSync(imgDir, { recursive: true });

  const page = await browser.newPage({
    viewport: A4_PX,
    deviceScaleFactor: 2,
  });

  if (!PREVIEW_ONLY) {
    for (const [key, fmt] of Object.entries(FORMATS)) {
      await page.setContent(renderProduct(product, fmt), {
        waitUntil: "load",
      });
      const name = `${product.slug}-${key === "A4" ? "A4" : "US-Letter"}.pdf`;
      await page.pdf({
        path: join(outDir, name),
        preferCSSPageSize: true,
        printBackground: true,
      });
    }
  }

  // Listing photos come from the A4 rendering.
  await page.setContent(renderProduct(product, FORMATS.A4), {
    waitUntil: "load",
  });
  const sheets = await page.locator("section.page").all();
  for (let i = 0; i < sheets.length; i++) {
    await sheets[i].screenshot({
      path: join(imgDir, `page-${String(i + 1).padStart(2, "0")}.png`),
    });
  }

  await page.close();
  return { slug: product.slug, pages: sheets.length };
}

/* The hero image is the whole ballgame on a marketplace: it is the only thing
   a buyer sees before deciding whether to click. Three sheets, fanned. */
async function buildHero(browser, product) {
  const imgDir = join(DIST, product.slug, "images");
  const picks = [1, 3, 4]; // cover + two content sheets
  const shots = picks.map(
    (n) => `images/page-${String(n).padStart(2, "0")}.png`
  );
  const files = shots.map((s) => join(DIST, product.slug, s));
  if (!files.every(existsSync)) return;

  const html = `<!doctype html><html><head><meta charset="utf-8"><style>
    *{margin:0;padding:0;box-sizing:border-box}
    body{width:2000px;height:2000px;background:#f4f2ee;font-family:"Liberation Sans",Arial,sans-serif;
         display:flex;flex-direction:column;align-items:center;justify-content:center;overflow:hidden}
    .stage{position:relative;width:1500px;height:1120px;display:flex;align-items:center;justify-content:center}
    .stage img{position:absolute;width:700px;border:1px solid #ddd8d0;box-shadow:0 30px 60px rgba(40,35,28,.18);background:#fff}
    .stage img:nth-child(1){transform:translateX(-420px) rotate(-7deg);z-index:1}
    .stage img:nth-child(2){transform:translateX(420px) rotate(7deg);z-index:1}
    .stage img:nth-child(3){z-index:2;width:760px}
    h1{font-family:"Bitstream Charter",Georgia,serif;font-size:86px;color:#16181d;text-align:center;
       letter-spacing:-.02em;line-height:1.05;max-width:1500px;margin-top:40px}
    p{font-size:36px;color:#4b5563;margin-top:26px;text-align:center;max-width:1300px;line-height:1.4}
    .pill{margin-top:38px;display:flex;gap:18px}
    .pill span{border:2px solid #2c6e6a;color:#2c6e6a;border-radius:999px;padding:12px 30px;
               font-size:28px;font-weight:700;letter-spacing:.06em;text-transform:uppercase}
  </style></head><body>
    <div class="stage">
      <img src="${shots[1]}"><img src="${shots[2]}"><img src="${shots[0]}">
    </div>
    <h1>${product.title}</h1>
    <p>${product.pages.length + 2} printable pages · instant download</p>
    <div class="pill"><span>A4 + US Letter</span><span>PDF</span><span>Print unlimited</span></div>
  </body></html>`;

  const file = join(DIST, product.slug, "_hero.html");
  writeFileSync(file, html);
  const page = await browser.newPage({ viewport: { width: 2000, height: 2000 } });
  await page.goto(`file://${file}`, { waitUntil: "load" });
  await page.screenshot({ path: join(imgDir, "hero.png") });
  await page.close();
  rmSync(file);
}

async function main() {
  const chromium = await loadChromium();
  const browser = await chromium.launch();

  console.log(PREVIEW_ONLY ? "Building previews…" : "Building PDFs + images…");
  for (const product of products) {
    const r = await buildProduct(browser, product);
    await buildHero(browser, product);
    console.log(`  ${r.slug.padEnd(38)} ${r.pages} pages`);
  }

  if (!PREVIEW_ONLY) {
    const zip = join(DIST, `${bundle.slug}.zip`);
    rmSync(zip, { force: true });
    const pdfs = bundle.includes.flatMap((slug) =>
      readdirSync(join(DIST, slug))
        .filter((f) => f.endsWith(".pdf"))
        .map((f) => join(slug, f))
    );
    const res = spawnSync("zip", ["-q", "-j", zip, ...pdfs], { cwd: DIST });
    console.log(
      res.status === 0
        ? `  ${bundle.slug.padEnd(38)} ${pdfs.length} files zipped`
        : "  (zip unavailable — ship the folder instead)"
    );

    /* One archive to download and work from: every product PDF, the hero
       image for each listing, the bundle, and the listing copy. */
    const kit = join(DIST, "launch-kit.zip");
    rmSync(kit, { force: true });
    const kitFiles = [
      ...products.flatMap((p) => [
        `dist/${p.slug}/${p.slug}-A4.pdf`,
        `dist/${p.slug}/${p.slug}-US-Letter.pdf`,
        `dist/${p.slug}/images/hero.png`,
        `listings/${p.slug}.md`,
      ]),
      `dist/${bundle.slug}.zip`,
      `listings/${bundle.slug}.md`,
    ].filter((f) => existsSync(join(ROOT, f)));
    const kitRes = spawnSync("zip", ["-q", "dist/launch-kit.zip", ...kitFiles], {
      cwd: ROOT,
    });
    console.log(
      kitRes.status === 0
        ? `  ${"launch-kit".padEnd(38)} ${kitFiles.length} files zipped`
        : "  (launch kit skipped)"
    );
  }

  await browser.close();
  console.log("Done → dist/");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
