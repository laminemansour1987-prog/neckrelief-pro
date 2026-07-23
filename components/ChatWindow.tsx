"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { PLANS } from "@/lib/plans";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const FREE_DAILY_LIMIT = PLANS.find((p) => p.id === "free")?.dailyMessageLimit ?? 15;
const STORAGE_KEY = "aura_daily_usage";

function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

function readUsage(): number {
  if (typeof window === "undefined") return 0;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return 0;
    const parsed = JSON.parse(raw);
    if (parsed.date !== todayKey()) return 0;
    return parsed.count ?? 0;
  } catch {
    return 0;
  }
}

function writeUsage(count: number) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({ date: todayKey(), count })
  );
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
  const [usage, setUsage] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setUsage(readUsage());
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const limitReached = usage >= FREE_DAILY_LIMIT;

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text || loading || limitReached) return;

    setError(null);
    const nextMessages: Message[] = [...messages, { role: "user", content: text }];
    setMessages(nextMessages);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: nextMessages }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Erreur inconnue");
      }
      setMessages((prev) => [...prev, { role: "assistant", content: data.reply }]);
      const newUsage = usage + 1;
      setUsage(newUsage);
      writeUsage(newUsage);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto flex h-[75vh] max-w-3xl flex-col overflow-hidden rounded-2xl border border-white/10 bg-white/5">
      <div className="flex items-center justify-between border-b border-white/10 px-5 py-3">
        <div>
          <p className="text-sm font-semibold text-white">Aura</p>
          <p className="text-xs text-white/40">Votre compagnon IA du quotidien</p>
        </div>
        <span className="rounded-full border border-white/10 px-3 py-1 text-xs text-white/50">
          {usage}/{FREE_DAILY_LIMIT} messages aujourd'hui (Free)
        </span>
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto px-5 py-6">
        {messages.map((m, i) => (
          <div
            key={i}
            className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                m.role === "user"
                  ? "bg-aura-500 text-white"
                  : "bg-white/10 text-white/90"
              }`}
            >
              {m.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="rounded-2xl bg-white/10 px-4 py-2.5 text-sm text-white/50">
              Aura réfléchit…
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {error && (
        <p className="border-t border-red-500/20 bg-red-500/10 px-5 py-2 text-xs text-red-300">
          {error}
        </p>
      )}

      {limitReached ? (
        <div className="border-t border-white/10 px-5 py-4 text-center text-sm text-white/60">
          Vous avez atteint la limite quotidienne du plan Free.{" "}
          <Link href="/pricing" className="font-medium text-aura-300 underline">
            Passez à Plus ou Pro
          </Link>{" "}
          pour continuer sans limite.
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
