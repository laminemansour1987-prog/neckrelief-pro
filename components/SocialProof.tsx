"use client";

import { useEffect, useState } from "react";

// Small social-proof pill shown under the hero CTAs. Renders nothing until a
// real, non-zero user count is known — no fake numbers before launch.
export default function SocialProof() {
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/stats/public")
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled && typeof data.users === "number") setCount(data.users);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  if (!count || count < 1) return null;

  const formatted = new Intl.NumberFormat("fr-FR").format(count);

  return (
    <div className="mt-6 flex items-center gap-3">
      <div className="flex -space-x-2">
        {["from-aura-400 to-aura-600", "from-bloom-pink to-aura-500", "from-bloom-blue to-aura-500"].map(
          (g, i) => (
            <span
              key={i}
              className={`h-7 w-7 rounded-full bg-gradient-to-br ${g} ring-2 ring-canvas`}
              aria-hidden="true"
            />
          )
        )}
      </div>
      <p className="text-sm text-white/55">
        <span className="font-semibold text-white">{formatted}</span>{" "}
        {count > 1 ? "personnes utilisent déjà Aura" : "personne utilise déjà Aura"}
      </p>
    </div>
  );
}
