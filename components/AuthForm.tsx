"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function AuthForm({ mode }: { mode: "login" | "signup" }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch(`/api/auth/${mode}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Une erreur est survenue.");
      const next = searchParams.get("next") || "/account";
      router.push(next);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mx-auto mt-10 max-w-sm space-y-4 rounded-2xl border border-white/[0.08] bg-white/[0.02] p-7"
    >
      <div>
        <label className="mb-1.5 block text-sm text-white/50">Email</label>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white outline-none transition focus:border-aura-400/60 focus:bg-white/[0.07]"
          placeholder="vous@example.com"
        />
      </div>
      <div>
        <label className="mb-1.5 block text-sm text-white/50">Mot de passe</label>
        <input
          type="password"
          required
          minLength={8}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white outline-none transition focus:border-aura-400/60 focus:bg-white/[0.07]"
          placeholder="8 caractères minimum"
        />
      </div>
      {error && <p className="text-sm text-red-300">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-full bg-white px-4 py-2.5 text-sm font-semibold text-canvas transition hover:bg-white/90 disabled:opacity-50"
      >
        {loading ? "Un instant…" : mode === "login" ? "Se connecter" : "Créer mon compte"}
      </button>
    </form>
  );
}
