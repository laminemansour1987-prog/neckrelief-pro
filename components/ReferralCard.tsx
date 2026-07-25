"use client";

import { useEffect, useState } from "react";

export default function ReferralCard({ code, count }: { code: string; count: number }) {
  const [copied, setCopied] = useState(false);
  const [link, setLink] = useState(`/?ref=${code}`);

  // Build the absolute URL on the client so it works on any deployed domain.
  useEffect(() => {
    setLink(`${window.location.origin}/?ref=${code}`);
  }, [code]);

  async function copy() {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="mt-6 rounded-2xl border border-white/[0.08] bg-white/[0.02] p-7">
      <div className="flex items-center justify-between gap-4">
        <p className="text-xs uppercase tracking-wide text-white/35">Parrainage</p>
        <span className="rounded-full bg-aura-500/20 px-3 py-1 text-xs font-semibold text-aura-200">
          {count} {count > 1 ? "personnes parrainées" : "personne parrainée"}
        </span>
      </div>
      <p className="mt-3 text-sm text-white/55">
        Partagez votre lien : chaque ami qui crée un compte apparaît ici. Un
        moyen simple de faire découvrir Aura autour de vous.
      </p>
      <div className="mt-4 flex flex-col gap-2 sm:flex-row">
        <input
          readOnly
          value={link}
          onFocus={(e) => e.currentTarget.select()}
          className="flex-1 rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white/80 outline-none"
          aria-label="Votre lien de parrainage"
        />
        <button
          onClick={copy}
          className="rounded-lg bg-white px-5 py-2.5 text-sm font-semibold text-canvas transition hover:bg-white/90"
        >
          {copied ? "Copié ✓" : "Copier"}
        </button>
      </div>
    </div>
  );
}
