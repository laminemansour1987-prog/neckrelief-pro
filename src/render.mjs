/* Turns declarative page/block definitions into printable HTML.
   Every product in products.mjs is just data; this file is the only place
   that knows what the ink looks like. */

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const HERE = dirname(fileURLToPath(import.meta.url));
const CSS = readFileSync(join(HERE, "theme.css"), "utf8");

export const FORMATS = {
  A4: { w: "210mm", h: "297mm", label: "A4" },
  LETTER: { w: "215.9mm", h: "279.4mm", label: "US Letter" },
};

const esc = (s) =>
  String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/* ---------------------------------------------------------------- blocks */

const blocks = {
  text: (b) => `<p class="text">${esc(b.v)}</p>`,

  note: (b) => `<div class="note">${esc(b.v)}</div>`,

  fields: (b) =>
    `<div class="blk">${title(b)}<div class="fields">${b.items
      .map(
        (f) =>
          `<div class="field" style="flex-grow:${f.w || 1}"><div class="lbl">${esc(
            f.label
          )}</div><div class="slot"></div></div>`
      )
      .join("")}</div></div>`,

  scale: (b) => {
    const min = b.min ?? 0;
    const max = b.max ?? 10;
    const cells = [];
    for (let i = min; i <= max; i++) {
      cells.push(
        `<div class="cell${i % 5 === 0 ? " mark" : ""}">${i}</div>`
      );
    }
    return `<div class="blk">${title(b)}<div class="scale">${cells.join(
      ""
    )}</div><div class="scale-ends"><span>${esc(
      b.low || "none"
    )}</span><span>${esc(b.high || "worst")}</span></div></div>`;
  },

  table: (b) => {
    const rowH = b.rowH || 8;
    const cols = b.head.length;
    const widths = b.widths || Array(cols).fill(1);
    const total = widths.reduce((a, c) => a + c, 0);
    const colgroup = widths
      .map((w) => `<col style="width:${((w / total) * 100).toFixed(2)}%">`)
      .join("");
    const rows = Array.from({ length: b.rows }, (_, i) => {
      const cells = Array.from(
        { length: cols },
        () => `<td style="height:${rowH}mm"></td>`
      ).join("");
      return `<tr${b.zebra && i % 2 === 1 ? ' class="alt"' : ""}>${cells}</tr>`;
    }).join("");
    return `<div class="blk">${title(b)}<table>${colgroup}<thead><tr>${b.head
      .map((h) => `<th>${esc(h)}</th>`)
      .join("")}</tr></thead><tbody>${rows}</tbody></table></div>`;
  },

  checklist: (b) =>
    `<div class="blk">${title(b)}<div class="check" style="grid-template-columns:repeat(${
      b.cols || 1
    },1fr)">${b.items
      .map(
        (i) =>
          `<div class="item"><div class="box"></div><div>${esc(i)}</div></div>`
      )
      .join("")}</div></div>`,

  /* grow:true lets the block eat whatever vertical space is left on the page,
     drawing its rules with a repeating gradient instead of fixed divs. Without
     it, light pages end in an awkward slab of white. */
  lines: (b) =>
    `<div class="blk${b.grow ? " grow" : ""}">${title(b)}<div class="lines${
      b.grow ? " grow" : ""
    }" style="--lh:${b.h || 7}mm">${
      b.grow
        ? ""
        : Array.from(
            { length: b.n },
            () => `<div class="ln" style="height:${b.h || 7}mm"></div>`
          ).join("")
    }</div></div>`,

  grid: (b) => {
    const cols = b.cols || 7;
    const hdr = b.dayNames
      ? ["M", "T", "W", "T", "F", "S", "S"]
          .map((d) => `<div class="hdr">${d}</div>`)
          .join("")
      : "";
    const cells = Array.from({ length: b.n }, (_, i) => {
      const n = b.numbered === false ? "" : `<div class="n">${i + 1}</div>`;
      return `<div class="cell">${n}</div>`;
    }).join("");
    return `<div class="blk">${title(
      b
    )}<div class="grid" style="grid-template-columns:repeat(${cols},1fr)">${hdr}${cells}</div></div>`;
  },

  legend: (b) =>
    `<div class="blk">${title(b)}<div class="legend">${b.items
      .map(
        (i) =>
          `<div class="k"><div class="sw">${esc(i.key)}</div><div>${esc(
            i.v
          )}</div></div>`
      )
      .join("")}</div></div>`,

  bodymap: (b) =>
    `<div class="blk">${title(b)}<div class="bodymap">${(b.views || [
      "Front",
      "Back",
    ])
      .map(
        (v) =>
          `<figure>${figure(b.h || 105)}<figcaption>${esc(v)}</figcaption></figure>`
      )
      .join("")}</div></div>`,

  cols: (b) =>
    `<div class="cols">${b.items
      .map((col) => `<div>${col.map(render).join("")}</div>`)
      .join("")}</div>`,

  spacer: () => `<div class="fill"></div>`,
};

function title(b) {
  if (!b.title) return "";
  return `<div class="blk-title">${esc(b.title)}${
    b.hint ? `<span>${esc(b.hint)}</span>` : ""
  }</div>`;
}

/* Human outline used for "shade where it hurts". Deliberately schematic:
   it has to stay legible at 105mm tall on a home printer. */
const SILHOUETTE =
  "M110,8 C126,8 137,22 137,40 C137,52 131,63 124,68 L124,78 " +
  "C146,82 165,90 172,102 C179,116 183,142 186,170 C188,192 190,212 190,230 " +
  "C190,238 186,242 181,242 C176,242 173,238 172,230 C169,208 165,186 160,166 " +
  "C157,152 154,142 150,134 L150,196 C150,214 148,232 145,250 " +
  "C142,272 139,300 137,330 C136,352 135,378 134,398 C134,406 130,410 124,410 " +
  "C118,410 115,406 115,398 C114,370 112,340 110,318 C108,340 106,370 105,398 " +
  "C105,406 102,410 96,410 C90,410 86,406 86,398 C85,378 84,352 83,330 " +
  "C81,300 78,272 75,250 C72,232 70,214 70,196 L70,134 " +
  "C66,142 63,152 60,166 C55,186 51,208 48,230 C47,238 44,242 39,242 " +
  "C34,242 30,238 30,230 C30,212 32,192 34,170 C37,142 41,116 48,102 " +
  "C55,90 74,82 96,78 L96,68 C89,63 83,52 83,40 C83,22 94,8 110,8 Z";

function figure(hMm) {
  return `<svg viewBox="0 0 220 420" height="${hMm}mm"><path d="${SILHOUETTE}"/>
    <line class="guide" x1="110" y1="78" x2="110" y2="250"/>
    <line class="guide" x1="70" y1="134" x2="150" y2="134"/>
    <line class="guide" x1="70" y1="196" x2="150" y2="196"/></svg>`;
}

function render(b) {
  const fn = blocks[b.t];
  if (!fn) throw new Error(`Unknown block type: ${b.t}`);
  return fn(b);
}

/* ----------------------------------------------------------------- pages */

function coverPage(product, fmt) {
  const contents = product.pages
    .map(
      (p, i) =>
        `<li><span class="n">${String(i + 2).padStart(2, "0")}</span>${esc(
          p.title
        )}</li>`
    )
    .join("");
  return `<section class="page cover">
    <div class="band"></div>
    <div class="mark">Steady Press</div>
    <h1>${esc(product.title)}</h1>
    <div class="tag">${esc(product.tagline)}</div>
    <div class="spacer"></div>
    <div class="contents">
      <b>Inside</b>
      <ul>${contents}<li><span class="n">${String(
    product.pages.length + 2
  ).padStart(2, "0")}</span>Before you start</li></ul>
    </div>
    <div class="rule"></div>
    <div class="meta">
      <div><b>Format</b>${fmt.label}</div>
      <div><b>Pages</b>${product.pages.length + 2}</div>
      <div><b>Use</b>Print as many copies as you need</div>
    </div>
  </section>`;
}

function contentPage(page, product, i, total) {
  /* A page that ends in writing lines should end at the bottom edge, not
     halfway down. Promote the trailing block rather than hand-tuning counts. */
  const blocks = page.blocks.map((b, idx) =>
    idx === page.blocks.length - 1 && b.t === "lines" ? { ...b, grow: true } : b
  );
  return `<section class="page">
    <div class="head">
      <div class="kicker">${esc(page.kicker || product.shortTitle)}</div>
      <h2>${esc(page.title)}</h2>
      ${page.sub ? `<div class="sub">${esc(page.sub)}</div>` : ""}
    </div>
    <div class="body">${blocks.map(render).join("")}</div>
    <div class="foot"><span>Steady Press</span><span>${esc(
      product.shortTitle
    )} — ${i} / ${total}</span></div>
  </section>`;
}

const DISCLAIMER = {
  title: "Before you start",
  kicker: "Please read",
  blocks: [
    {
      t: "text",
      v: "These pages are a personal record-keeping tool. They are not a medical device, they do not diagnose anything, and nothing here is medical advice.",
    },
    {
      t: "text",
      v: "Tracking is useful because it turns vague memory into specifics you can hand to a professional: when it started, what makes it worse, what you already tried. It is not a substitute for seeing one.",
    },
    {
      t: "text",
      v: "See a qualified healthcare professional about any new, severe, or worsening symptom. Seek urgent care for chest pain, numbness or weakness in a limb, loss of bladder or bowel control, severe headache of sudden onset, pain following an accident, fever with neck stiffness, or any symptom that frightens you.",
    },
    { t: "spacer" },
    {
      t: "text",
      v: "Personal use only. You may print unlimited copies for yourself and your household. Reselling, redistributing, or sharing the files is not permitted.",
    },
    { t: "text", v: "© Steady Press. All rights reserved." },
  ],
};

export function renderProduct(product, fmt) {
  const pages = [...product.pages, DISCLAIMER];
  const total = pages.length + 1; // the cover counts as page 1
  const html = [
    coverPage(product, fmt),
    ...pages.map((p, i) => contentPage(p, product, i + 2, total)),
  ].join("\n");

  return `<!doctype html><html><head><meta charset="utf-8">
<title>${esc(product.title)}</title>
<style>
@page { size: ${fmt.w} ${fmt.h}; margin: 0; }
:root { --pw: ${fmt.w}; --ph: ${fmt.h}; }
${CSS}
</style></head><body>${html}</body></html>`;
}
