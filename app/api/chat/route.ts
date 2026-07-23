import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

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

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ reply: demoReply(messages), demo: true });
  }

  try {
    const anthropic = new Anthropic({ apiKey });
    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-5",
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages: messages.map((m) => ({ role: m.role, content: m.content })),
    });

    const textBlock = response.content.find((block) => block.type === "text");
    const reply = textBlock && textBlock.type === "text" ? textBlock.text : "";

    return NextResponse.json({ reply, demo: false });
  } catch (error) {
    console.error("Anthropic API error:", error);
    return NextResponse.json(
      { error: "Le service IA est momentanément indisponible. Réessayez dans un instant." },
      { status: 502 }
    );
  }
}
