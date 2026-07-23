"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface MeResponse {
  email: string | null;
  isGuest: boolean;
  plan: string;
  limit: number | null;
  usageToday: number;
}

export default function ChatWindow() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Bonjour, je suis Aura 👋 Posez-moi une question sur votre journée, votre organisation, ou juste dites bonjour !",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [me, setMe] = useState<MeResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [limitReached, setLimitReached] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  async function refreshMe() {
    try {
      const res = await fetch("/api/auth/me");
      const data: MeResponse = await res.json();
      setMe(data);
      if (data.limit !== null) setLimitReached(data.usageToday >= data.limit);
    } catch {
      // non-fatal: usage badge just won't show
    }
  }

  useEffect(() => {
    refreshMe();
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text || loading || limitReached) return;

    setError(null);
    const nextMessages: Message[] = [...messages, { role: "user", content: text }];
    setMessages([...nextMessages, { role: "assistant", content: "" }]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: nextMessages }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        if (res.status === 429) setLimitReached(true);
        throw new Error(data.error || "Une erreur est survenue.");
      }

      const reader = res.body?.getReader();
      if (!reader) throw new Error("Réponse invalide du serveur.");
      const decoder = new TextDecoder();

      let fullText = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        fullText += decoder.decode(value, { stream: true });
        setMessages((prev) => {
          const updated = [...prev];
          updated[updated.length - 1] = { role: "assistant", content: fullText };
          return updated;
        });
      }

      await refreshMe();
    } catch (err) {
      setMessages((prev) => prev.slice(0, -1));
      setError(err instanceof Error ? err.message : "Une erreur est survenue.");
    } finally {
      setLoading(false);
    }
  }

  const usageLabel = me
    ? me.limit === null
      ? "Messages illimités"
      : `${me.usageToday}/${me.limit} messages aujourd'hui${me.isGuest ? " (essai)" : ` (${me.plan})`}`
    : "";

  return (
    <div className="mx-auto flex h-[75vh] max-w-3xl flex-col overflow-hidden rounded-2xl border border-white/10 bg-white/5">
      <div className="flex items-center justify-between border-b border-white/10 px-5 py-3">
        <div>
          <p className="text-sm font-semibold text-white">Aura</p>
          <p className="text-xs text-white/40">Votre compagnon IA du quotidien</p>
        </div>
        {me && (
          <span className="rounded-full border border-white/10 px-3 py-1 text-xs text-white/50">
            {usageLabel}
          </span>
        )}
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto px-5 py-6">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[80%] whitespace-pre-wrap rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                m.role === "user" ? "bg-aura-500 text-white" : "bg-white/10 text-white/90"
              }`}
            >
              {m.content || (loading && i === messages.length - 1 ? "…" : "")}
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {error && (
        <p className="border-t border-red-500/20 bg-red-500/10 px-5 py-2 text-xs text-red-300">
          {error}
        </p>
      )}

      {limitReached ? (
        <div className="border-t border-white/10 px-5 py-4 text-center text-sm text-white/60">
          {me?.isGuest ? (
            <>
              Essai gratuit terminé pour aujourd&apos;hui.{" "}
              <Link href="/signup" className="font-medium text-aura-300 underline">
                Créez un compte gratuit
              </Link>{" "}
              pour continuer à discuter avec Aura.
            </>
          ) : (
            <>
              Vous avez atteint la limite quotidienne du plan {me?.plan}.{" "}
              <Link href="/pricing" className="font-medium text-aura-300 underline">
                Passez à un plan supérieur
              </Link>{" "}
              pour continuer sans limite.
            </>
          )}
        </div>
      ) : (
        <form onSubmit={sendMessage} className="flex gap-2 border-t border-white/10 p-3">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Écrivez votre message…"
            className="flex-1 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white placeholder-white/30 outline-none focus:border-aura-400"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="rounded-full bg-aura-500 px-5 py-2 text-sm font-medium text-white transition hover:bg-aura-400 disabled:opacity-40"
          >
            Envoyer
          </button>
        </form>
      )}
    </div>
  );
}
