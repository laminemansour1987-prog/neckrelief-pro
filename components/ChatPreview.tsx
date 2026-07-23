"use client";

import { useEffect, useState } from "react";

const SCRIPT: { role: "user" | "assistant"; content: string }[] = [
  { role: "user", content: "Je suis assis toute la journée, j'ai mal au cou…" },
  {
    role: "assistant",
    content:
      "Redressez les épaules, menton légèrement rentré, et faites une pause de 2 min toutes les 30 min. Je vous rappelle dans 1h ?",
  },
  { role: "user", content: "Oui, parfait 🙏" },
];

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export default function ChatPreview() {
  const [visibleCount, setVisibleCount] = useState(SCRIPT.length);
  const [typing, setTyping] = useState(false);

  useEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) return;

    let cancelled = false;

    async function play() {
      while (!cancelled) {
        setVisibleCount(0);
        setTyping(false);
        await sleep(700);
        for (let i = 0; i < SCRIPT.length; i++) {
          if (cancelled) return;
          setTyping(true);
          await sleep(900);
          if (cancelled) return;
          setTyping(false);
          setVisibleCount(i + 1);
          await sleep(1500);
        }
        await sleep(2200);
      }
    }

    play();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="relative mx-auto w-full max-w-md animate-float">
      <div className="absolute -inset-8 -z-10 bg-aura-glow blur-2xl" />
      <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] shadow-2xl shadow-black/40 backdrop-blur-sm">
        <div className="flex items-center gap-2 border-b border-white/10 px-4 py-3">
          <span className="h-2.5 w-2.5 rounded-full bg-red-400/70" />
          <span className="h-2.5 w-2.5 rounded-full bg-amber-400/70" />
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/70" />
          <span className="ml-2 text-xs text-white/30">Aura</span>
        </div>
        <div className="min-h-[190px] space-y-3 p-4">
          {SCRIPT.slice(0, visibleCount).map((m, i) => (
            <div key={i} className={`flex animate-fade-up ${m.role === "user" ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[80%] rounded-2xl px-3.5 py-2 text-sm ${
                  m.role === "user"
                    ? "rounded-br-sm bg-aura-500 text-white"
                    : "rounded-bl-sm bg-white/10 text-white/90"
                }`}
              >
                {m.content}
              </div>
            </div>
          ))}
          {typing && (
            <div className="flex animate-fade-up items-center gap-1.5 pl-1 pt-1">
              <span className="h-1.5 w-1.5 animate-blink rounded-full bg-white/40 [animation-delay:0ms]" />
              <span className="h-1.5 w-1.5 animate-blink rounded-full bg-white/40 [animation-delay:200ms]" />
              <span className="h-1.5 w-1.5 animate-blink rounded-full bg-white/40 [animation-delay:400ms]" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
