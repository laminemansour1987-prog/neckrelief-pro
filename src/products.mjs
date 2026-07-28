/* The catalogue. Every product is data — add a new one here and it ships
   as A4 + US Letter PDFs plus marketplace copy on the next build. */

const PAIN_LEGEND = {
  t: "legend",
  title: "Marking key",
  hint: "write the letter on the spot that hurts",
  items: [
    { key: "A", v: "Aching / dull" },
    { key: "S", v: "Sharp / stabbing" },
    { key: "B", v: "Burning" },
    { key: "T", v: "Tingling / numb" },
    { key: "R", v: "Radiating (draw an arrow)" },
    { key: "St", v: "Stiff / restricted" },
  ],
};

const DISCLAIMER_NOTE = {
  t: "note",
  v: "This is a record-keeping tool, not medical advice. Bring it to a professional rather than using it to self-diagnose.",
};

const howToPage = (bullets, closing) => ({
  kicker: "Start here",
  title: "How to use this journal",
  sub: "Five minutes a day is enough. Consistency beats detail — a half-filled page every day is worth more than a perfect page once a week.",
  blocks: [
    { t: "checklist", title: "The routine", items: bullets },
    {
      t: "text",
      v: "Rate pain on the same 0–10 scale every time. The absolute number matters far less than the direction it moves over weeks.",
    },
    {
      t: "scale",
      title: "The scale you will use",
      low: "No pain",
      high: "Worst imaginable",
    },
    {
      t: "legend",
      title: "What the numbers mean",
      items: [
        { key: "1", v: "Noticeable, easy to ignore" },
        { key: "3", v: "Annoying, does not stop you" },
        { key: "5", v: "Hard to concentrate through" },
        { key: "7", v: "Limits what you can do" },
        { key: "9", v: "Unable to function" },
      ],
    },
    { t: "text", v: closing },
    DISCLAIMER_NOTE,
    { t: "lines", title: "What I want to get out of this", n: 4, h: 8 },
  ],
});

const notesPage = (title = "Notes") => ({
  kicker: "Free space",
  title,
  sub: "Anything the structured pages did not capture.",
  blocks: [
    { t: "fields", items: [{ label: "Date", w: 1 }, { label: "Topic", w: 2 }] },
    { t: "lines", n: 24, h: 8 },
  ],
});

const doctorPrepPage = {
  kicker: "Appointment",
  title: "Doctor visit prep",
  sub: "Fill this in the day before. Most appointments are short — walking in with this changes what you get out of it.",
  blocks: [
    {
      t: "fields",
      items: [
        { label: "Date of visit", w: 1 },
        { label: "Seeing", w: 1.6 },
      ],
    },
    {
      t: "lines",
      title: "In one sentence, what is the problem?",
      n: 2,
      h: 8,
    },
    {
      t: "table",
      title: "The facts",
      head: ["Question", "Your answer"],
      widths: [1, 1.7],
      rows: 7,
      rowH: 9,
    },
    {
      t: "checklist",
      title: "Have you already tried",
      cols: 3,
      items: [
        "Rest",
        "Heat",
        "Ice",
        "Stretching",
        "Painkillers",
        "Physio",
        "Massage",
        "New pillow",
        "Desk changes",
      ],
    },
    { t: "lines", title: "Questions I want answered", n: 5, h: 8 },
    { t: "lines", title: "What was decided", n: 4, h: 8 },
  ],
};

const weeklyReviewPage = {
  kicker: "Every Sunday",
  title: "Weekly review",
  sub: "Ten minutes looking back is where the pattern actually shows up.",
  blocks: [
    {
      t: "fields",
      items: [
        { label: "Week of", w: 1 },
        { label: "Best day", w: 1 },
        { label: "Worst day", w: 1 },
      ],
    },
    {
      t: "table",
      title: "The week at a glance",
      head: ["Day", "Avg pain", "Sleep", "Notable"],
      widths: [1, 1, 1, 3.2],
      rows: 7,
      rowH: 9,
      zebra: true,
    },
    {
      t: "cols",
      items: [
        [{ t: "lines", title: "What made it better", n: 5, h: 7.5 }],
        [{ t: "lines", title: "What made it worse", n: 5, h: 7.5 }],
      ],
    },
    { t: "lines", title: "One thing to change next week", n: 2, h: 8 },
  ],
};

/* ------------------------------------------------------------------ 01 */

const neckTracker = {
  slug: "neck-shoulder-pain-tracker",
  title: "Neck & Shoulder Pain Tracker",
  shortTitle: "Neck & Shoulder Tracker",
  tagline:
    "A 30-day record of where it hurts, what set it off, and what actually helped — so your next appointment starts with facts instead of guesswork.",
  price: { eur: 4.9, usd: 5.5 },
  pages: [
    howToPage(
      [
        "Fill the daily log at the same time each evening",
        "Mark the body map whenever the location changes",
        "Note the trigger while you still remember it",
        "Shade the 30-day grid before bed — ten seconds",
        "Do the weekly review every Sunday",
        "Bring the doctor prep page to your appointment",
      ],
      "Print the daily log thirty times and the rest once. That is the whole system."
    ),
    {
      kicker: "Baseline",
      title: "Where it hurts",
      sub: "Do this on day one, then again every two weeks. Comparing two maps a month apart is often the clearest evidence you have.",
      blocks: [
        {
          t: "fields",
          items: [
            { label: "Date", w: 1 },
            { label: "Overall level today (0–10)", w: 1 },
          ],
        },
        { t: "bodymap", h: 95 },
        PAIN_LEGEND,
        { t: "lines", title: "Describe it in your own words", n: 4, h: 7.5 },
      ],
    },
    {
      kicker: "Daily",
      title: "Daily log",
      sub: "Print one per day.",
      blocks: [
        {
          t: "fields",
          items: [
            { label: "Date", w: 1.2 },
            { label: "Hours slept", w: 1 },
            { label: "Woke up rested?", w: 1 },
            { label: "Weather", w: 1 },
          ],
        },
        { t: "scale", title: "Pain on waking", low: "None", high: "Worst" },
        { t: "scale", title: "Pain at bedtime", low: "None", high: "Worst" },
        {
          t: "table",
          title: "Through the day",
          head: ["Time", "What I was doing", "0–10", "Note"],
          widths: [1, 3, 0.8, 2.4],
          rows: 6,
          rowH: 8.5,
        },
        {
          t: "checklist",
          title: "Symptoms today",
          cols: 3,
          items: [
            "Stiffness on waking",
            "Pain turning head left",
            "Pain turning head right",
            "Headache from base of skull",
            "Shoulder blade ache",
            "Tingling in arm or hand",
            "Jaw or temple tension",
            "Clicking or grinding",
            "Dizziness",
          ],
        },
        { t: "lines", title: "Anything else", n: 3, h: 7.5 },
      ],
    },
    {
      kicker: "Patterns",
      title: "Trigger tracker",
      sub: "Tick what you did, then rate the pain that followed. Four weeks of this usually names the culprit.",
      blocks: [
        {
          t: "table",
          title: "Suspected triggers",
          head: ["Date", "Trigger", "How long", "Pain after (0–10)", "Certain?"],
          widths: [1, 2.6, 1.1, 1.2, 0.9],
          rows: 16,
          rowH: 9,
          zebra: true,
        },
        {
          t: "checklist",
          title: "Usual suspects to watch",
          cols: 3,
          items: [
            "Desk / laptop session",
            "Driving",
            "Phone or tablet use",
            "Sleep position",
            "Stress or deadline",
            "Carrying a bag on one side",
            "Workout or lifting",
            "Cold or draught",
            "Long day standing",
          ],
        },
      ],
    },
    {
      kicker: "Overview",
      title: "30-day pain grid",
      sub: "One box per day. Shade lightly for a good day, heavily for a bad one, and write the number in the corner.",
      blocks: [
        { t: "fields", items: [{ label: "Month", w: 1 }, { label: "Year", w: 1 }] },
        { t: "grid", n: 30, cols: 10, title: "Day of month" },
        {
          t: "legend",
          title: "Shading key",
          items: [
            { key: "—", v: "0–2 · good day" },
            { key: "/", v: "3–4 · manageable" },
            { key: "X", v: "5–6 · difficult" },
            { key: "#", v: "7–10 · flare" },
          ],
        },
        {
          t: "table",
          title: "Flare days — what happened",
          head: ["Day", "What happened", "What helped"],
          widths: [0.7, 3, 3],
          rows: 6,
          rowH: 9,
        },
      ],
    },
    {
      kicker: "What works",
      title: "Relief log",
      sub: "The point of this page is to stop repeating things that never worked.",
      blocks: [
        {
          t: "table",
          title: "Tried and rated",
          head: [
            "Date",
            "What I tried",
            "How long",
            "Pain before",
            "Pain after",
            "Again?",
          ],
          widths: [1, 3, 1.2, 1, 1, 0.9],
          rows: 15,
          rowH: 9,
          zebra: true,
        },
        {
          t: "checklist",
          title: "Things worth testing",
          cols: 3,
          items: [
            "Heat pack, 15 min",
            "Ice, 10 min",
            "Chin tucks",
            "Doorway chest stretch",
            "Walk, 20 min",
            "Screen at eye level",
            "Different pillow",
            "Massage",
            "Prescribed exercises",
          ],
        },
      ],
    },
    {
      kicker: "Treatment",
      title: "Medication & treatment log",
      sub: "Keep one honest record. Doctors ask this question and almost nobody can answer it accurately.",
      blocks: [
        {
          t: "table",
          title: "Medication",
          head: ["Date", "What", "Dose", "Time", "Did it help?"],
          widths: [1, 2.4, 1, 1, 2],
          rows: 13,
          rowH: 9,
          zebra: true,
        },
        {
          t: "table",
          title: "Appointments & therapy",
          head: ["Date", "Who I saw", "What was done", "Cost"],
          widths: [1, 2, 3, 1],
          rows: 7,
          rowH: 9,
        },
      ],
    },
    weeklyReviewPage,
    doctorPrepPage,
    notesPage(),
  ],
};

/* ------------------------------------------------------------------ 02 */

const chronicJournal = {
  slug: "chronic-pain-symptom-journal-90-day",
  title: "Chronic Pain & Symptom Journal",
  shortTitle: "90-Day Pain Journal",
  tagline:
    "Ninety days of structured tracking for pain, symptoms, sleep, mood and treatment — built to be handed to a specialist.",
  price: { eur: 7.9, usd: 8.9 },
  pages: [
    howToPage(
      [
        "Complete the daily log every evening",
        "Log flares the moment they start, not afterwards",
        "Update the body map every two weeks",
        "Shade the 90-day grid daily",
        "Weekly review each Sunday, monthly review at month end",
        "Take the summary page to every appointment",
      ],
      "Ninety days is the horizon most specialists want. Shorter than that and a slow trend is indistinguishable from a bad fortnight."
    ),
    {
      kicker: "Baseline",
      title: "My history in one page",
      sub: "Write this once. It saves repeating your story at every new appointment.",
      blocks: [
        {
          t: "fields",
          items: [
            { label: "Symptoms began", w: 1 },
            { label: "Diagnosed?", w: 1 },
            { label: "Diagnosis", w: 1.6 },
          ],
        },
        { t: "lines", title: "How it started", n: 4, h: 7.5 },
        {
          t: "table",
          title: "What has been tried so far",
          head: ["When", "Treatment / professional", "Outcome"],
          widths: [1, 2.6, 2.6],
          rows: 9,
          rowH: 9,
          zebra: true,
        },
        {
          t: "table",
          title: "Tests and results",
          head: ["Date", "Test", "Result"],
          widths: [1, 2.4, 3],
          rows: 5,
          rowH: 9,
        },
      ],
    },
    {
      kicker: "Baseline",
      title: "Where it hurts",
      sub: "Repeat every two weeks and date each map.",
      blocks: [
        {
          t: "fields",
          items: [
            { label: "Date", w: 1 },
            { label: "Overall level (0–10)", w: 1 },
          ],
        },
        { t: "bodymap", h: 95 },
        PAIN_LEGEND,
        { t: "lines", title: "Changes since last map", n: 4, h: 7.5 },
      ],
    },
    {
      kicker: "Daily",
      title: "Daily log",
      sub: "Print ninety of these, or one per day as you go.",
      blocks: [
        {
          t: "fields",
          items: [
            { label: "Date", w: 1.2 },
            { label: "Sleep (hrs)", w: 0.8 },
            { label: "Sleep quality /10", w: 1 },
            { label: "Energy /10", w: 1 },
            { label: "Mood /10", w: 1 },
          ],
        },
        { t: "scale", title: "Worst pain today", low: "None", high: "Worst" },
        { t: "scale", title: "Average pain today", low: "None", high: "Worst" },
        {
          t: "table",
          title: "Symptoms",
          head: ["Symptom", "0–10", "When", "Note"],
          widths: [2.4, 0.8, 1.4, 2.8],
          rows: 6,
          rowH: 8.5,
        },
        {
          t: "checklist",
          title: "Today I managed",
          cols: 3,
          items: [
            "Got out of the house",
            "Worked a full day",
            "Exercised or stretched",
            "Ate properly",
            "Saw someone",
            "Slept through",
            "Took meds as planned",
            "Did my exercises",
            "Rested deliberately",
          ],
        },
        { t: "lines", title: "Anything else", n: 3, h: 7.5 },
      ],
    },
    {
      kicker: "Flares",
      title: "Flare log",
      sub: "A flare is worth more data than a normal day. Fill this in while it is happening.",
      blocks: [
        {
          t: "fields",
          items: [
            { label: "Date", w: 1 },
            { label: "Started at", w: 1 },
            { label: "Ended", w: 1 },
            { label: "Peak (0–10)", w: 1 },
          ],
        },
        { t: "lines", title: "What I was doing beforehand", n: 3, h: 7.5 },
        { t: "lines", title: "How it felt and where", n: 4, h: 7.5 },
        {
          t: "table",
          title: "What I did about it",
          head: ["Time", "Action taken", "Effect"],
          widths: [1, 3, 3],
          rows: 6,
          rowH: 9,
        },
        { t: "lines", title: "In hindsight, the likely cause", n: 3, h: 7.5 },
      ],
    },
    {
      kicker: "Overview",
      title: "90-day grid",
      sub: "One box per day across three months. This page is the one specialists actually look at.",
      blocks: [
        {
          t: "fields",
          items: [
            { label: "Start date", w: 1 },
            { label: "End date", w: 1 },
          ],
        },
        { t: "grid", n: 90, cols: 15, title: "Day 1 – 90" },
        {
          t: "legend",
          title: "Shading key",
          items: [
            { key: "—", v: "0–2 · good day" },
            { key: "/", v: "3–4 · manageable" },
            { key: "X", v: "5–6 · difficult" },
            { key: "#", v: "7–10 · flare" },
            { key: "•", v: "Treatment changed" },
          ],
        },
        { t: "lines", title: "Trend I can see", n: 5, h: 8 },
      ],
    },
    {
      kicker: "Patterns",
      title: "Trigger tracker",
      blocks: [
        {
          t: "table",
          title: "Logged triggers",
          head: ["Date", "Suspected trigger", "Delay before pain", "Severity", "Confident?"],
          widths: [1, 2.8, 1.4, 1, 1],
          rows: 18,
          rowH: 9,
          zebra: true,
        },
        { t: "lines", title: "Confirmed triggers so far", n: 4, h: 8 },
      ],
    },
    {
      kicker: "Treatment",
      title: "Medication log",
      blocks: [
        {
          t: "table",
          title: "Current prescriptions",
          head: ["Medication", "Dose", "Times per day", "Started", "Prescribed by"],
          widths: [2.2, 1, 1.2, 1, 1.6],
          rows: 7,
          rowH: 9,
          zebra: true,
        },
        {
          t: "table",
          title: "Daily doses & effect",
          head: ["Date", "Medication", "Dose", "Time", "Relief (0–10)", "Side effects"],
          widths: [1, 2, 0.9, 0.9, 1.1, 2],
          rows: 13,
          rowH: 9,
        },
      ],
    },
    {
      kicker: "Treatment",
      title: "Appointments & therapies",
      blocks: [
        {
          t: "table",
          title: "Log",
          head: ["Date", "Professional", "What was done", "Advice given", "Cost"],
          widths: [1, 1.8, 2.4, 2.4, 0.9],
          rows: 16,
          rowH: 9.5,
          zebra: true,
        },
        { t: "lines", title: "Next steps agreed", n: 4, h: 8 },
      ],
    },
    weeklyReviewPage,
    {
      kicker: "Every month",
      title: "Monthly review",
      sub: "The only page where you are allowed to zoom out and judge whether anything is actually working.",
      blocks: [
        { t: "fields", items: [{ label: "Month", w: 1 }, { label: "Good days", w: 1 }, { label: "Bad days", w: 1 }] },
        { t: "scale", title: "Average pain this month", low: "None", high: "Worst" },
        {
          t: "cols",
          items: [
            [{ t: "lines", title: "Better than last month", n: 6, h: 7.5 }],
            [{ t: "lines", title: "Worse than last month", n: 6, h: 7.5 }],
          ],
        },
        { t: "lines", title: "Treatments to keep", n: 3, h: 7.5 },
        { t: "lines", title: "Treatments to stop or question", n: 3, h: 7.5 },
        { t: "lines", title: "What I will raise at my next appointment", n: 3, h: 7.5 },
      ],
    },
    doctorPrepPage,
    {
      kicker: "Appointment",
      title: "Summary sheet",
      sub: "Copy the highlights here and hand this single page over. Nobody reads ninety pages.",
      blocks: [
        {
          t: "fields",
          items: [
            { label: "Name", w: 1.6 },
            { label: "Period covered", w: 1.4 },
            { label: "Date", w: 1 },
          ],
        },
        {
          t: "table",
          title: "The numbers",
          head: ["Measure", "Value"],
          widths: [2, 1.4],
          rows: 6,
          rowH: 9.5,
        },
        { t: "lines", title: "Main symptoms, in order of impact", n: 4, h: 8 },
        { t: "lines", title: "Confirmed triggers", n: 3, h: 8 },
        { t: "lines", title: "What has helped", n: 3, h: 8 },
        { t: "lines", title: "What has not", n: 3, h: 8 },
      ],
    },
    notesPage(),
  ],
};

/* ------------------------------------------------------------------ 03 */

const migraineLog = {
  slug: "headache-migraine-log",
  title: "Headache & Migraine Log",
  shortTitle: "Migraine Log",
  tagline:
    "Track every attack — timing, triggers, aura, medication and what finally stopped it — in a format neurologists recognise.",
  price: { eur: 4.9, usd: 5.5 },
  pages: [
    howToPage(
      [
        "Fill an attack log for every headache, however mild",
        "Note the warning signs before the pain arrives",
        "Record rescue medication and the exact time taken",
        "Shade the monthly calendar every evening",
        "Review triggers at the end of each month",
        "Take the summary to your neurologist",
      ],
      "Medication-overuse headache is diagnosed from a count of rescue doses per month. Keeping that count honest is the single most useful thing on these pages."
    ),
    {
      kicker: "Per attack",
      title: "Attack log",
      sub: "One per headache. Print plenty.",
      blocks: [
        {
          t: "fields",
          items: [
            { label: "Date", w: 1 },
            { label: "Started", w: 0.8 },
            { label: "Ended", w: 0.8 },
            { label: "Total hours", w: 0.8 },
          ],
        },
        { t: "scale", title: "Peak intensity", low: "Mild", high: "Worst" },
        {
          t: "checklist",
          title: "Location",
          cols: 3,
          items: [
            "One side — left",
            "One side — right",
            "Both sides",
            "Behind the eye",
            "Forehead / temples",
            "Base of skull",
            "Top of head",
            "Whole head",
            "Moved during attack",
          ],
        },
        {
          t: "checklist",
          title: "Character & symptoms",
          cols: 3,
          items: [
            "Throbbing / pulsing",
            "Pressing / tight band",
            "Stabbing",
            "Worse with movement",
            "Nausea",
            "Vomiting",
            "Light sensitivity",
            "Sound sensitivity",
            "Smell sensitivity",
            "Visual aura",
            "Tingling or numbness",
            "Speech difficulty",
          ],
        },
        {
          t: "table",
          title: "Medication taken",
          head: ["Time", "What", "Dose", "Relief (0–10)", "How long until relief"],
          widths: [1, 2.2, 1, 1.2, 2],
          rows: 4,
          rowH: 8.5,
        },
        { t: "lines", title: "What was happening in the 24 hours before", n: 3, h: 7.5 },
      ],
    },
    {
      kicker: "Warning signs",
      title: "Prodrome & aura",
      sub: "Many people have reliable warning signs hours before the pain. Finding yours buys you treatment time.",
      blocks: [
        {
          t: "checklist",
          title: "Hours before an attack I often notice",
          cols: 2,
          items: [
            "Yawning repeatedly",
            "Food cravings",
            "Unusual thirst",
            "Neck stiffness",
            "Irritability or low mood",
            "Unusual energy or elation",
            "Difficulty finding words",
            "Blurred vision",
            "Light seems too bright",
            "Frequent urination",
            "Difficulty concentrating",
            "Sensitivity to smells",
          ],
        },
        {
          t: "table",
          title: "Warning-sign log",
          head: ["Date", "Sign noticed", "Hours before pain", "Did early treatment help?"],
          widths: [1, 2.6, 1.4, 2.6],
          rows: 12,
          rowH: 9,
          zebra: true,
        },
      ],
    },
    {
      kicker: "Patterns",
      title: "Trigger tracker",
      blocks: [
        {
          t: "checklist",
          title: "Common triggers to test",
          cols: 3,
          items: [
            "Missed or late meal",
            "Poor or excess sleep",
            "Dehydration",
            "Alcohol — red wine",
            "Caffeine, or withdrawal",
            "Aged cheese",
            "Chocolate",
            "Bright or flickering light",
            "Screen time",
            "Stress, or the let-down after",
            "Weather change",
            "Hormonal cycle",
            "Strong smells",
            "Neck or jaw tension",
            "Exercise",
          ],
        },
        {
          t: "table",
          title: "Suspected trigger log",
          head: ["Date", "Exposure", "Hours to onset", "Severity", "Confirmed?"],
          widths: [1, 2.8, 1.4, 1, 1],
          rows: 13,
          rowH: 9,
          zebra: true,
        },
      ],
    },
    {
      kicker: "Overview",
      title: "Monthly headache calendar",
      sub: "Shade every day you had any head pain at all, including the mild ones you would normally forget.",
      blocks: [
        { t: "fields", items: [{ label: "Month", w: 1 }, { label: "Year", w: 1 }] },
        { t: "grid", n: 31, cols: 7, title: "Day of month", dayNames: true },
        {
          t: "legend",
          title: "Key",
          items: [
            { key: "/", v: "Mild" },
            { key: "X", v: "Moderate" },
            { key: "#", v: "Severe" },
            { key: "R", v: "Rescue medication taken" },
            { key: "A", v: "Aura" },
          ],
        },
        {
          t: "table",
          title: "Month totals",
          head: ["Headache days", "Severe days", "Rescue doses", "Days off work"],
          widths: [1, 1, 1, 1],
          rows: 1,
          rowH: 12,
        },
        { t: "note", v: "More than ten rescue doses in a month is worth raising with your doctor — overuse can itself cause headaches." },
      ],
    },
    weeklyReviewPage,
    doctorPrepPage,
    notesPage(),
  ],
};

/* ------------------------------------------------------------------ 04 */

const postureKit = {
  slug: "posture-desk-setup-kit",
  title: "Posture & Desk Setup Kit",
  shortTitle: "Posture Kit",
  tagline:
    "Fix the desk that is causing it, then build the habit that keeps it fixed — a one-time setup audit plus a 30-day habit tracker.",
  price: { eur: 4.9, usd: 5.5 },
  pages: [
    howToPage(
      [
        "Do the desk audit once, properly, with a tape measure",
        "Fix everything you can the same day",
        "Pick three habits and track them for thirty days",
        "Log a discomfort score at the end of each workday",
        "Use the stretch card at every break",
        "Re-run the audit after a month",
      ],
      "Most desk pain is a geometry problem before it is a muscle problem. The audit takes twenty minutes and is the highest-value page here."
    ),
    {
      kicker: "One-time",
      title: "Desk setup audit",
      sub: "Sit the way you actually sit — not the way you sit when someone is watching — then work down the list.",
      blocks: [
        {
          t: "checklist",
          title: "Screen",
          cols: 2,
          items: [
            "Top of screen at or just below eye level",
            "Screen an arm's length away",
            "Screen directly in front, not to one side",
            "No window glare on the screen",
            "Laptop raised, with a separate keyboard",
            "Second monitor at the same height",
          ],
        },
        {
          t: "checklist",
          title: "Chair & body",
          cols: 2,
          items: [
            "Feet flat on the floor or a footrest",
            "Knees level with hips, or slightly lower",
            "Lower back supported by the chair",
            "Shoulders relaxed, not lifted",
            "Elbows at roughly 90°, close to the body",
            "Wrists straight, not bent up",
          ],
        },
        {
          t: "checklist",
          title: "Desk & habits",
          cols: 2,
          items: [
            "Keyboard and mouse at the same height",
            "Mouse next to the keyboard, not further out",
            "Phone not held between ear and shoulder",
            "Documents on a stand, not flat on the desk",
            "Anything used often is within easy reach",
            "You stand up at least once an hour",
          ],
        },
        {
          t: "table",
          title: "Measurements to record",
          head: ["What", "Now", "Should be", "Fixed on"],
          widths: [2.6, 1, 1.6, 1],
          rows: 5,
          rowH: 9,
        },
      ],
    },
    {
      kicker: "30 days",
      title: "Posture habit tracker",
      sub: "Three habits, thirty days. Pick habits small enough that you have no excuse.",
      blocks: [
        {
          t: "fields",
          items: [
            { label: "Habit 1", w: 1 },
            { label: "Habit 2", w: 1 },
            { label: "Habit 3", w: 1 },
          ],
        },
        { t: "grid", n: 30, cols: 10, title: "Habit 1 — day of month" },
        { t: "grid", n: 30, cols: 10, title: "Habit 2 — day of month" },
        { t: "grid", n: 30, cols: 10, title: "Habit 3 — day of month" },
        { t: "lines", title: "Which habit was hardest, and why", n: 3, h: 7.5 },
      ],
    },
    {
      kicker: "Daily",
      title: "Workday discomfort log",
      sub: "Score how you feel at the end of each working day. Four weeks of this tells you whether the desk changes worked.",
      blocks: [
        {
          t: "table",
          title: "Log",
          head: ["Date", "Hours at desk", "Breaks taken", "Neck 0–10", "Back 0–10", "Eyes 0–10", "Note"],
          widths: [1, 1.1, 1, 0.9, 0.9, 0.9, 2.6],
          rows: 20,
          rowH: 9,
          zebra: true,
        },
        { t: "lines", title: "Pattern I notice", n: 3, h: 8 },
      ],
    },
    {
      kicker: "Every break",
      title: "Desk stretch card",
      sub: "Cut this page out and tape it where you can see it. Two minutes, once an hour.",
      blocks: [
        {
          t: "table",
          title: "The routine",
          head: ["Stretch", "How", "Hold", "Done"],
          widths: [1.6, 3.4, 0.8, 0.8],
          rows: 8,
          rowH: 13,
        },
        {
          t: "note",
          v: "Stretch to mild tension, never into pain. Stop anything that produces sharp pain, tingling or dizziness and ask a professional first.",
        },
        {
          t: "checklist",
          title: "Break checklist",
          cols: 2,
          items: [
            "Stand up",
            "Look at something 6 m away for 20 seconds",
            "Roll shoulders backwards ten times",
            "Walk to another room",
            "Drink water",
            "Sit back down deliberately, not slumped",
          ],
        },
      ],
    },
    weeklyReviewPage,
    notesPage(),
  ],
};

/* ------------------------------------------------------------------ 05 */

const ptLog = {
  slug: "physical-therapy-exercise-log",
  title: "Physical Therapy Exercise Log",
  shortTitle: "PT Exercise Log",
  tagline:
    "Record the programme, do the reps, prove the progress — a 12-week log for anyone who has been given exercises and needs to actually do them.",
  price: { eur: 4.9, usd: 5.5 },
  pages: [
    howToPage(
      [
        "Write your prescribed programme on the programme sheet",
        "Log every session, including the short ones",
        "Rate pain before and after each session",
        "Measure range of motion weekly, same time of day",
        "Shade the 12-week grid so gaps are visible",
        "Take the session notes page to each appointment",
      ],
      "Adherence is the variable that predicts outcome, and it is the one thing nobody measures. This log measures it."
    ),
    {
      kicker: "Prescribed",
      title: "My programme",
      sub: "Fill this in with your therapist, not from memory afterwards.",
      blocks: [
        {
          t: "fields",
          items: [
            { label: "Therapist", w: 1.4 },
            { label: "Condition", w: 1.4 },
            { label: "Programme starts", w: 1 },
          ],
        },
        {
          t: "table",
          title: "Exercises",
          head: ["Exercise", "Sets", "Reps", "Hold", "How often", "Cue to remember"],
          widths: [2.6, 0.7, 0.7, 0.7, 1.2, 2.4],
          rows: 12,
          rowH: 10,
          zebra: true,
        },
        { t: "lines", title: "Things I was told to avoid", n: 3, h: 8 },
        { t: "lines", title: "What we are aiming for", n: 3, h: 8 },
      ],
    },
    {
      kicker: "Per session",
      title: "Session log",
      sub: "Print one per session.",
      blocks: [
        {
          t: "fields",
          items: [
            { label: "Date", w: 1 },
            { label: "Time", w: 0.8 },
            { label: "Duration", w: 0.8 },
            { label: "Where", w: 1.2 },
          ],
        },
        { t: "scale", title: "Pain before", low: "None", high: "Worst" },
        {
          t: "table",
          title: "What I did",
          head: ["Exercise", "Sets", "Reps", "Resistance", "Difficulty 0–10", "Note"],
          widths: [2.6, 0.7, 0.7, 1.2, 1.2, 2.2],
          rows: 8,
          rowH: 9,
        },
        { t: "scale", title: "Pain after", low: "None", high: "Worst" },
        { t: "scale", title: "Pain next morning", low: "None", high: "Worst" },
        { t: "lines", title: "How it felt", n: 3, h: 7.5 },
      ],
    },
    {
      kicker: "Weekly",
      title: "Range of motion tracker",
      sub: "Measure at the same time of day, warmed up the same amount. Consistency matters more than precision.",
      blocks: [
        {
          t: "table",
          title: "Measurements",
          head: ["Week", "Movement", "Left", "Right", "Pain at end range", "Note"],
          widths: [0.8, 2.4, 1, 1, 1.6, 2.2],
          rows: 18,
          rowH: 9,
          zebra: true,
        },
        {
          t: "checklist",
          title: "Movements to test",
          cols: 3,
          items: [
            "Turn head left / right",
            "Tilt ear to shoulder",
            "Look up / look down",
            "Shoulder overhead",
            "Arm behind back",
            "Trunk rotation",
          ],
        },
      ],
    },
    {
      kicker: "Overview",
      title: "12-week adherence grid",
      sub: "One box per day. Empty boxes are the useful information.",
      blocks: [
        { t: "fields", items: [{ label: "Start date", w: 1 }, { label: "Target sessions per week", w: 1 }] },
        { t: "grid", n: 84, cols: 14, title: "Week 1 – 12" },
        {
          t: "legend",
          title: "Key",
          items: [
            { key: "✓", v: "Full session" },
            { key: "/", v: "Partial session" },
            { key: "R", v: "Planned rest day" },
            { key: "X", v: "Missed" },
            { key: "!", v: "Flare — stopped early" },
          ],
        },
        { t: "lines", title: "What got in the way most often", n: 4, h: 8 },
      ],
    },
    {
      kicker: "Appointment",
      title: "Notes for my therapist",
      sub: "Bring this. It answers the questions you will be asked anyway.",
      blocks: [
        { t: "fields", items: [{ label: "Appointment date", w: 1 }, { label: "Sessions completed since last visit", w: 1.4 }] },
        { t: "lines", title: "What has got easier", n: 4, h: 8 },
        { t: "lines", title: "What is still hard or painful", n: 4, h: 8 },
        { t: "lines", title: "Exercises I could not manage, and why", n: 4, h: 8 },
        { t: "lines", title: "Questions", n: 4, h: 8 },
        { t: "lines", title: "Programme changes agreed today", n: 4, h: 8 },
      ],
    },
    weeklyReviewPage,
    notesPage(),
  ],
};

/* ------------------------------------------------------------------ 06 */

const doctorPack = {
  slug: "doctor-visit-prep-pack",
  title: "Doctor Visit Prep Pack",
  shortTitle: "Doctor Visit Pack",
  tagline:
    "Walk into a ten-minute appointment with your symptoms, timeline, medications and questions already on paper.",
  price: { eur: 3.9, usd: 4.5 },
  pages: [
    howToPage(
      [
        "Fill the symptom summary the day before",
        "Build the timeline from your calendar and messages",
        "List every medication, including supplements",
        "Write your questions in priority order",
        "Take notes during the appointment on the notes page",
        "Complete the after-visit plan before you leave the car park",
      ],
      "Appointments are short and stressful, and people forget roughly half of what is said. Writing it down beforehand and during is the entire trick."
    ),
    {
      kicker: "One page",
      title: "Symptom summary",
      sub: "If you hand over only one page, make it this one.",
      blocks: [
        {
          t: "fields",
          items: [
            { label: "Name", w: 1.6 },
            { label: "Date of birth", w: 1 },
            { label: "Today", w: 1 },
          ],
        },
        { t: "lines", title: "The main problem, in one sentence", n: 2, h: 8 },
        {
          t: "table",
          title: "The essentials",
          head: ["Question", "Answer"],
          widths: [1.4, 2.2],
          rows: 8,
          rowH: 10,
          zebra: true,
        },
        { t: "scale", title: "Typical pain level", low: "None", high: "Worst" },
        { t: "lines", title: "What it stops me doing", n: 3, h: 8 },
      ],
    },
    {
      kicker: "History",
      title: "Symptom timeline",
      sub: "Work backwards from today. Calendars, photos and messages are better than memory.",
      blocks: [
        {
          t: "table",
          title: "Timeline",
          head: ["Date", "What changed", "How bad", "What I did about it"],
          widths: [1.2, 3, 1, 3],
          rows: 20,
          rowH: 9.5,
          zebra: true,
        },
      ],
    },
    {
      kicker: "Reference",
      title: "Medications & allergies",
      sub: "Include supplements, herbal remedies and anything bought over the counter — these interact too.",
      blocks: [
        {
          t: "table",
          title: "Currently taking",
          head: ["Name", "Dose", "How often", "Since", "What for", "Prescribed by"],
          widths: [2, 1, 1.2, 1, 1.8, 1.6],
          rows: 12,
          rowH: 9.5,
          zebra: true,
        },
        {
          t: "table",
          title: "Stopped, and why",
          head: ["Name", "Taken until", "Why stopped"],
          widths: [2, 1.2, 3.4],
          rows: 5,
          rowH: 9.5,
        },
        { t: "lines", title: "Allergies and bad reactions", n: 3, h: 8 },
      ],
    },
    {
      kicker: "Before",
      title: "Questions to ask",
      sub: "Number them. You will not get through all of them, so the order is the important part.",
      blocks: [
        { t: "lines", title: "My questions, most important first", n: 12, h: 9 },
        {
          t: "checklist",
          title: "Worth asking if it applies",
          cols: 2,
          items: [
            "What is the most likely cause?",
            "What else could it be?",
            "Do I need any tests?",
            "What should I do if it gets worse?",
            "How long before I should see improvement?",
            "Are there side effects to watch for?",
            "Should I be referred to a specialist?",
            "What can I do myself in the meantime?",
          ],
        },
      ],
    },
    {
      kicker: "During",
      title: "Appointment notes",
      sub: "Write while they talk. Ask them to slow down — that is entirely normal.",
      blocks: [
        {
          t: "fields",
          items: [
            { label: "Date", w: 1 },
            { label: "Who I saw", w: 1.6 },
            { label: "Clinic", w: 1.4 },
          ],
        },
        { t: "lines", title: "What they said the problem is", n: 5, h: 8 },
        { t: "lines", title: "Words I did not understand — ask before leaving", n: 3, h: 8 },
        { t: "lines", title: "Treatment or medication started", n: 4, h: 8 },
        { t: "lines", title: "Tests or referrals ordered", n: 4, h: 8 },
      ],
    },
    {
      kicker: "After",
      title: "After-visit plan",
      sub: "Fill this in before you drive home, while it is still fresh.",
      blocks: [
        {
          t: "table",
          title: "What happens next",
          head: ["Action", "Who does it", "By when", "Done"],
          widths: [3, 1.6, 1.2, 0.8],
          rows: 8,
          rowH: 10,
          zebra: true,
        },
        {
          t: "table",
          title: "Tests & referrals to chase",
          head: ["What", "Booked for", "Chased on", "Result received"],
          widths: [2.6, 1.2, 1.2, 1.6],
          rows: 5,
          rowH: 10,
        },
        { t: "lines", title: "Come back if…", n: 3, h: 8 },
        { t: "lines", title: "Next appointment", n: 2, h: 8 },
      ],
    },
    notesPage("Notes & questions for next time"),
  ],
};

export const products = [
  neckTracker,
  chronicJournal,
  migraineLog,
  postureKit,
  ptLog,
  doctorPack,
];

export const bundle = {
  slug: "complete-relief-bundle",
  title: "The Complete Relief Bundle",
  shortTitle: "Complete Bundle",
  tagline: "All six Steady Press trackers in one download.",
  price: { eur: 14.9, usd: 16.5 },
  includes: products.map((p) => p.slug),
};
