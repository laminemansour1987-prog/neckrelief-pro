"use client";

import { useState } from "react";

interface Item {
  question: string;
  answer: string;
}

export default function FAQ({ items }: { items: Item[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="divide-y divide-white/[0.07] rounded-2xl border border-white/[0.07] bg-white/[0.02]">
      {items.map((item, i) => {
        const open = openIndex === i;
        return (
          <div key={item.question}>
            <button
              onClick={() => setOpenIndex(open ? null : i)}
              className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left text-sm font-medium text-white/90"
              aria-expanded={open}
            >
              {item.question}
              <span
                className={`shrink-0 text-white/40 transition-transform duration-300 ${open ? "rotate-45" : ""}`}
              >
                +
              </span>
            </button>
            <div
              className={`grid transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
              }`}
            >
              <div className="overflow-hidden">
                <p className="px-6 pb-5 text-sm leading-relaxed text-white/50">{item.answer}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
