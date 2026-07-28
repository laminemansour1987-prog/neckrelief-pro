/* Marketplace copy generator.
   The page list in every description is read from products.mjs, so a product
   change can never silently leave the listing lying about what is inside.

   Run: npm run listings  ->  listings/<slug>.md */

import { mkdirSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { products, bundle } from "./products.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = join(ROOT, "listings");

/* Etsy limits: title 140 chars, 13 tags, each tag 20 chars max. Both are
   enforced below so a bad edit fails the build instead of the listing. */
const copy = {
  "neck-shoulder-pain-tracker": {
    etsyTitle:
      "Neck and Shoulder Pain Tracker Printable, Chronic Pain Journal PDF, Symptom Log with Body Map, Doctor Visit Prep, A4 + US Letter",
    tags: [
      "pain tracker",
      "neck pain journal",
      "chronic pain log",
      "symptom tracker",
      "printable planner",
      "pain journal pdf",
      "health tracker",
      "body map printable",
      "doctor visit prep",
      "shoulder pain",
      "pain management",
      "wellness planner",
      "medical binder",
    ],
    hook: "You know it hurts. You cannot remember whether it was worse last Tuesday, or what you were doing the day it flared. Neither can your doctor — and that is the reason appointments so often end with a shrug.",
    why: [
      "A body map you mark instead of describing, so location and type of pain are unambiguous",
      "A trigger log that pairs what you did with the pain that followed, which is how patterns actually surface",
      "A relief log so you stop repeating the treatments that never worked",
      "A one-page doctor prep sheet that turns thirty days of notes into something usable in a ten-minute appointment",
    ],
  },

  "chronic-pain-symptom-journal-90-day": {
    etsyTitle:
      "90 Day Chronic Pain and Symptom Journal Printable, Pain Tracker PDF, Fibromyalgia Arthritis Flare Log, Medical Binder, A4 + US Letter",
    tags: [
      "chronic pain",
      "symptom journal",
      "pain tracker pdf",
      "fibromyalgia",
      "flare up tracker",
      "chronic illness",
      "medical binder",
      "spoonie planner",
      "health journal",
      "pain diary",
      "printable journal",
      "arthritis tracker",
      "wellness tracker",
    ],
    hook: "Ninety days is the horizon most specialists want before they will call something a trend. This journal is built to survive that long — and to be handed over at the end of it.",
    why: [
      "Daily logs that capture pain, sleep, energy and mood on one page, because they move together",
      "A flare log you fill in during the flare, when the detail still exists",
      "A 90-day grid that makes a slow improvement visible when day-to-day memory says nothing has changed",
      "A single summary sheet to hand over, because nobody reads ninety pages",
    ],
  },

  "headache-migraine-log": {
    etsyTitle:
      "Headache and Migraine Log Printable, Migraine Tracker PDF, Attack Diary with Trigger and Aura Tracking, Neurologist Prep, A4 + Letter",
    tags: [
      "migraine tracker",
      "headache log",
      "migraine diary",
      "headache journal",
      "migraine printable",
      "trigger tracker",
      "chronic migraine",
      "health tracker",
      "symptom tracker",
      "pain diary",
      "medical binder",
      "aura tracker",
      "neurology prep",
    ],
    hook: "Migraine clinics ask two questions you probably cannot answer: how many headache days last month, and how many rescue doses. This log answers both without you having to remember anything.",
    why: [
      "One sheet per attack — timing, location, character, symptoms and what stopped it",
      "A prodrome and aura page, because catching the warning signs early is what buys you treatment time",
      "A monthly calendar that produces the headache-day count your neurologist will ask for",
      "A rescue-medication tally, since overuse is diagnosed from exactly this number",
    ],
  },

  "posture-desk-setup-kit": {
    etsyTitle:
      "Posture and Desk Setup Kit Printable, Ergonomic Workstation Checklist, 30 Day Posture Habit Tracker, Office Stretch Card, A4 + Letter",
    tags: [
      "posture tracker",
      "desk ergonomics",
      "habit tracker",
      "office printable",
      "work from home",
      "neck pain relief",
      "stretch routine",
      "posture checklist",
      "wellness planner",
      "desk setup",
      "back pain",
      "productivity print",
      "health tracker",
    ],
    hook: "Most desk pain is a geometry problem before it is a muscle problem. Fix the geometry once, then build the two or three habits that stop it coming back.",
    why: [
      "A proper twenty-minute desk audit — screen, chair, keyboard, body — with the measurements to record",
      "A 30-day tracker for three habits, small enough that you have no excuse",
      "A daily discomfort log that shows whether the changes actually worked",
      "A cut-out stretch card for the wall next to your monitor",
    ],
  },

  "physical-therapy-exercise-log": {
    etsyTitle:
      "Physical Therapy Exercise Log Printable, 12 Week PT Home Program Tracker, Rehab Journal with Range of Motion Chart, A4 + US Letter",
    tags: [
      "physical therapy",
      "exercise log",
      "rehab tracker",
      "pt printable",
      "injury recovery",
      "workout log",
      "physio journal",
      "range of motion",
      "recovery planner",
      "home exercise",
      "health tracker",
      "therapy notes",
      "fitness printable",
    ],
    hook: "Adherence is the single strongest predictor of whether physio works, and it is the one thing nobody measures. Twelve weeks of empty boxes are as informative as the full ones.",
    why: [
      "A programme sheet filled in with your therapist, not reconstructed from memory in the car park",
      "Pain rated before, after, and the next morning — the pattern that tells you if you are overdoing it",
      "A weekly range-of-motion chart, measured the same way each time",
      "A notes page that answers the questions your therapist asks at every session",
    ],
  },

  "doctor-visit-prep-pack": {
    etsyTitle:
      "Doctor Visit Prep Pack Printable, Medical Appointment Planner PDF, Symptom Summary Questions and Medication List, A4 + US Letter",
    tags: [
      "doctor visit prep",
      "medical planner",
      "appointment planner",
      "medication list",
      "health binder",
      "symptom summary",
      "medical printable",
      "patient advocate",
      "caregiver planner",
      "health organizer",
      "questions for doctor",
      "medical records",
      "health tracker",
    ],
    hook: "People forget roughly half of what is said in a medical appointment, and the appointment itself is ten minutes long. Writing it down beforehand and during is the entire trick.",
    why: [
      "A one-page symptom summary you can hand over instead of telling the story again",
      "A timeline built from your calendar and messages rather than memory",
      "A complete medication list including the supplements people forget to mention",
      "An after-visit plan filled in before you leave, while it is still fresh",
    ],
  },
};

const SHARED = (product) => `
**HOW IT WORKS**

1. Buy — the download link appears immediately, no waiting and nothing shipped.
2. Print the pages you want, at home or at a print shop. Print them as many times as you like.
3. Fill them in. Take them to your appointment.

**WHAT YOU GET**

Two PDF files, downloadable the moment your payment goes through:

- ${product.title} — A4 (${product.pages.length + 2} pages)
- ${product.title} — US Letter (${product.pages.length + 2} pages)

Nothing to unzip. Print whichever size your printer uses and ignore the other.

Pages included:

${product.pages.map((p, i) => `${i + 2}. ${p.title}`).join("\n")}
${product.pages.length + 2}. Before you start

**PRINTING**

Designed deliberately light on ink — no heavy backgrounds, no full-bleed colour. Prints cleanly in black and white on a home printer. Works on plain paper, and the sheets fit a standard ring binder or disc-bound planner.

**DELIVERY & TERMS**

Instant digital download. Nothing physical is shipped. Because the files are delivered immediately, this purchase is non-refundable — but message me if anything is wrong with the files and I will fix it.

For personal use only. Print unlimited copies for yourself and your household. Please do not resell, redistribute or share the files.

**PLEASE NOTE**

This is a record-keeping tool, not a medical device. It does not diagnose anything and nothing in it is medical advice. See a qualified healthcare professional about any new, severe or worsening symptom.
`;

function checkLimits(slug, c) {
  const errs = [];
  if (c.etsyTitle.length > 140)
    errs.push(`title is ${c.etsyTitle.length} chars (max 140)`);
  if (c.tags.length !== 13) errs.push(`${c.tags.length} tags (need 13)`);
  c.tags.forEach((t) => {
    if (t.length > 20) errs.push(`tag "${t}" is ${t.length} chars (max 20)`);
  });
  if (errs.length) throw new Error(`${slug}: ${errs.join("; ")}`);
}

function listingFor(product) {
  const c = copy[product.slug];
  checkLimits(product.slug, c);
  return `# ${product.title}

Ready to paste into Etsy. Nothing here needs rewriting — the page list is generated from the product itself.

---

## Title

\`\`\`
${c.etsyTitle}
\`\`\`

${c.etsyTitle.length} / 140 characters.

## Price

**€${product.price.eur.toFixed(2)}** (about $${product.price.usd.toFixed(
    2
  )}). Digital download, no shipping profile needed.

## Tags

Paste one per tag field:

${c.tags.map((t) => `- ${t}`).join("\n")}

## Category & attributes

- Category: Paper & Party Supplies → Paper → Stationery → Design & Templates → Templates
- Type: Digital download
- Files: upload the 2 PDFs separately (A4 + US Letter) — do not zip them
- Digital download: yes — automatic delivery

## Description

${c.hook}

${c.why.map((w) => `- ${w}`).join("\n")}
${SHARED(product)}
## Listing photos

Upload from \`dist/${product.slug}/images/\` in this order:

1. \`hero.png\` — the thumbnail buyers see in search results
2. \`page-01.png\` — the cover
3. \`page-03.png\` onwards — three or four of the most useful interior pages
4. \`page-02.png\` — the how-to page, which answers "is this actually usable"

Etsy allows ten photos. Use at least seven; listings with more photos convert better.
`;
}

function bundleListing() {
  const total = products.reduce((n, p) => n + p.pages.length + 2, 0);
  const single = products.reduce((n, p) => n + p.price.eur, 0);
  return `# ${bundle.title}

The bundle is where the revenue is. Price it so it reads as obviously better value than two singles.

---

## Title

\`\`\`
Complete Chronic Pain Tracker Bundle Printable, 6 Health Journals PDF, Migraine Posture Physio and Doctor Visit Prep, A4 + US Letter
\`\`\`

## Price

**€${bundle.price.eur.toFixed(2)}** — against €${single.toFixed(
    2
  )} bought separately (${Math.round(
    (1 - bundle.price.eur / single) * 100
  )}% less). ${total} pages in total.

## Tags

- pain tracker bundle
- printable bundle
- chronic pain
- health planner
- symptom tracker
- migraine tracker
- medical binder
- wellness bundle
- physical therapy
- posture tracker
- health journal
- doctor visit prep
- chronic illness

## Description

Six complete trackers, ${total} pages, one download. Everything in the shop for less than the price of three.

Included:

${products
  .map(
    (p) =>
      `- **${p.title}** (${p.pages.length + 2} pages) — ${p.tagline}`
  )
  .join("\n")}

Each comes as both A4 and US Letter. All ${
    products.length * 2
  } PDFs arrive in a single ZIP — Etsy caps a listing at five files, so this is the one product that has to be zipped.

**DELIVERY & TERMS**

Instant digital download. Nothing physical is shipped, so the purchase is non-refundable — message me if a file is wrong and I will fix it. Personal use only; print unlimited copies for yourself, but please do not resell or share the files.

**PLEASE NOTE**

These are record-keeping tools, not medical devices. Nothing here is medical advice. See a qualified healthcare professional about any new, severe or worsening symptom.

## Listing photos

Use \`dist/*/images/hero.png\` from each product as photos 2–7, and build photo 1 as a grid of all six covers.
`;
}

mkdirSync(OUT, { recursive: true });
for (const p of products) {
  writeFileSync(join(OUT, `${p.slug}.md`), listingFor(p));
  console.log(`  listings/${p.slug}.md`);
}
writeFileSync(join(OUT, `${bundle.slug}.md`), bundleListing());
console.log(`  listings/${bundle.slug}.md`);
