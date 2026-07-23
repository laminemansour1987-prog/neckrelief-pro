"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import LogoMark from "@/components/Logo";

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

function TypingDots() {
  return (
    <div className="flex items-center gap-1.5 rounded-2xl rounded-bl-sm bg-white/10 px-4 py-3">
      <span className="h-1.5 w-1.5 animate-blink rounded-full bg-white/50 [animation-delay:0ms]" />
      <span className="h-1.5 w-1.5 animate-blink rounded-full bg-white/50 [animation-delay:200ms]" />
      <span className="h-1.5 w-1.5 animate-blink rounded-full bg-white/50 [animation-delay:400ms]" />
    </div>
  );
}

function Avatar({ role, initial }: { role: "user" | "assistant"; initial: string }) {
  if (role === "assistant") {
    return (
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/5 ring-1 ring-white/10">
        <LogoMark className="h-5 w-5" />
      </div>
    );
  }
  return (
    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/10 text-xs font-semibold uppercase text-white/70 ring-1 ring-white/10">
      {initial}
    </div>
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
      ? "Illimité"
      : `${me.usageToday}/${me.limit} aujourd'hui`
    : "";
  const usagePct = me && me.limit ? Math.min(100, (me.usageToday / me.limit) * 100) : 0;
  const userInitial = me?.email ? me.email[0] : "?";

  return (
    <div className="relative mx-auto flex h-[75vh] max-w-3xl flex-col overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] shadow-2xl shadow-black/30 backdrop-blur-sm">
      <div className="flex items-center justify-between border-b border-white/10 px-5 py-3.5">
        <div className="flex items-center gap-2.5">
          <LogoMark className="h-7 w-7" />
          <div>
            <p className="text-sm font-semibold text-white">Aura</p>
            <p className="text-xs text-white/35">Votre compagnon IA du quotidien</p>
          </div>
        </div>
        {me && (
          <div className="flex items-center gap-2">
            {me.limit !== null && (
              <div className="hidden h-1.5 w-16 overflow-hidden rounded-full bg-white/10 sm:block">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-aura-400 to-bloom-pink transition-all duration-500"
                  style={{ width: `${usagePct}%` }}
                />
              </div>
            )}
            <span className="rounded-full border border-white/10 px-3 py-1 text-xs text-white/50">
              {usageLabel}
            </span>
          </div>
        )}
      </div>

      <div className="flex-1 space-y-5 overflow-y-auto px-5 py-6">
        {messages.map((m, i) => (
          <div
            key={i}
            className={`flex animate-fade-up items-end gap-2.5 ${m.role === "user" ? "flex-row-reverse" : ""}`}
          >
            <Avatar role={m.role} initial={userInitial} />
            {m.content ? (
              <div
                className={`max-w-[75%] whitespace-pre-wrap rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                  m.role === "user"
                    ? "rounded-br-sm bg-aura-500 text-white"
                    : "rounded-bl-sm bg-white/10 text-white/90"
                }`}
              >
                {m.content}
              </div>
            ) : loading && i === messages.length - 1 ? (
              <TypingDots />
            ) : null}
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
            className="flex-1 rounded-full border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-white/30 outline-none transition focus:border-aura-400/60 focus:bg-white/[0.07]"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-canvas transition hover:bg-white/90 disabled:opacity-30"
            aria-label="Envoyer"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path
                d="M14 2 7 9M14 2 9.5 14l-2.5-5L2 6.5 14 2Z"
                stroke="currentColor"
                strokeWidth="1.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </form>
      )}
    </div>
  );
}
