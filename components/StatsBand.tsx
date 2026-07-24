"use client";

import { useEffect, useRef, useState } from "react";

interface Stat {
  value: number;
  suffix: string;
  label: string;
}

const STATS: Stat[] = [
  { value: 12, suffix: "s", label: "pour obtenir une réponse" },
  { value: 40, suffix: "+", label: "langues comprises" },
  { value: 5, suffix: "", label: "profils par foyer (Pro)" },
  { value: 99.9, suffix: "%", label: "de disponibilité visée" },
];

function CountUp({ value, suffix, start }: { value: number; suffix: string; start: boolean }) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!start) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setDisplay(value);
      return;
    }
    const duration = 1400;
    const t0 = performance.now();
    let raf = 0;
    const tick = (t: number) => {
      const p = Math.min(1, (t - t0) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setDisplay(value * eased);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [start, value]);

  const formatted = Number.isInteger(value)
    ? Math.round(display).toString()
    : display.toFixed(1);

  return (
    <span className="font-display text-4xl font-medium text-white sm:text-5xl">
      {formatted}
      <span className="text-gradient">{suffix}</span>
    </span>
  );
}

export default function StatsBand() {
  const ref = useRef<HTMLDivElement>(null);
  const [start, setStart] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setStart(true);
          observer.disconnect();
        }
      },
      { threshold: 0.4 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className="grid grid-cols-2 gap-x-6 gap-y-10 rounded-3xl border border-white/[0.08] bg-white/[0.02] px-8 py-12 text-center lg:grid-cols-4"
    >
      {STATS.map((stat) => (
        <div key={stat.label}>
          <CountUp value={stat.value} suffix={stat.suffix} start={start} />
          <p className="mt-2 text-sm text-white/45">{stat.label}</p>
        </div>
      ))}
    </div>
  );
}
