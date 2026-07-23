import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { resolveIdentity, ANON_COOKIE, ANON_COOKIE_MAX_AGE } from "@/lib/identity";
import { getUsageToday, incrementUsage } from "@/lib/usage";

export const runtime = "nodejs";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

const SYSTEM_PROMPT = `Tu es Aura, un assistant IA amical conçu pour être utile au quotidien à absolument tout le monde :
questions pratiques, organisation, bien-être, posture, petites recommandations de vie courante.
Réponds toujours de façon concise, chaleureuse et concrète. Réponds dans la langue du message de l'utilisateur.
Si la question relève de la santé, rappelle brièvement que tu ne remplaces pas un avis médical professionnel quand c'est pertinent, sans être lourd.`;

function demoReply(messages: ChatMessage[]): string {
  const last = messages[messages.length - 1]?.content?.toLowerCase() ?? "";
  if (last.includes("bonjour") || last.includes("salut")) {
    return "Bonjour ! Je suis Aura, votre compagnon IA du quotidien. (Mode démo : ajoutez ANTHROPIC_API_KEY pour activer les réponses complètes.) Comment puis-je vous aider aujourd'hui ?";
  }
  if (last.includes("cou") || last.includes("dos") || last.includes("posture")) {
    return "Petit conseil rapide : redressez les épaules, ramenez le menton légèrement en arrière, et faites une pause de 2 minutes toutes les 30 minutes pour étirer votre nuque. (Mode démo — connectez une clé API pour des réponses personnalisées.)";
  }
  return "Je suis en mode démo pour le moment (aucune clé ANTHROPIC_API_KEY configurée sur le serveur). Une fois la clé ajoutée dans .env.local, je pourrai répondre à absolument tout, tous les jours.";
}

function streamFromText(text: string): ReadableStream<Uint8Array> {
  const words = text.split(" ");
  const encoder = new TextEncoder();
  let i = 0;
  return new ReadableStream({
    async pull(controller) {
      if (i >= words.length) {
        controller.close();
        return;
      }
      const chunk = (i === 0 ? "" : " ") + words[i];
      controller.enqueue(encoder.encode(chunk));
      i += 1;
      await new Promise((r) => setTimeout(r, 25));
    },
  });
}

export async function POST(req: NextRequest) {
  let body: { messages?: ChatMessage[] };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const messages = Array.isArray(body.messages) ? body.messages : [];
  if (messages.length === 0) {
    return NextResponse.json({ error: "messages is required" }, { status: 400 });
  }

  const identity = await resolveIdentity(req);

  if (identity.limit !== null) {
    const usedToday = await getUsageToday(identity.key);
    if (usedToday >= identity.limit) {
      const message = identity.isGuest
        ? "Limite d'essai gratuite atteinte. Créez un compte gratuit pour continuer à discuter avec Aura."
        : "Vous avez atteint la limite quotidienne de votre plan. Passez à un plan supérieur pour continuer.";
      return NextResponse.json({ error: message, limitReached: true }, { status: 429 });
    }
  }

  await incrementUsage(identity.key);

  const apiKey = process.env.ANTHROPIC_API_KEY;
  const headers = new Headers({ "Content-Type": "text/plain; charset=utf-8" });
  if (identity.newAnonId) {
    headers.append(
      "Set-Cookie",
      `${ANON_COOKIE}=${identity.newAnonId}; Path=/; Max-Age=${ANON_COOKIE_MAX_AGE}; SameSite=Lax${
        process.env.NODE_ENV === "production" ? "; Secure" : ""
      }; HttpOnly`
    );
  }

  if (!apiKey) {
    return new Response(streamFromText(demoReply(messages)), { headers });
  }

  try {
    const anthropic = new Anthropic({ apiKey });
    const anthropicStream = anthropic.messages.stream({
      model: "claude-sonnet-4-5",
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages: messages.map((m) => ({ role: m.role, content: m.content })),
    });

    const encoder = new TextEncoder();
    const responseStream = new ReadableStream<Uint8Array>({
      async start(controller) {
        try {
          for await (const event of anthropicStream) {
            if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
              controller.enqueue(encoder.encode(event.delta.text));
            }
          }
        } catch (error) {
          console.error("Anthropic streaming error:", error);
        } finally {
          controller.close();
        }
      },
    });

    return new Response(responseStream, { headers });
  } catch (error) {
    console.error("Anthropic API error:", error);
    return NextResponse.json(
      { error: "Le service IA est momentanément indisponible. Réessayez dans un instant." },
      { status: 502 }
    );
  }
}
