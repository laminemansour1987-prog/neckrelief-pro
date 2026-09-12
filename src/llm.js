'use strict';

const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages';

/**
 * Reformule un message factuel en reponse naturelle et professionnelle via l'API Claude,
 * si une cle API est configuree. Retourne null si indisponible ou en cas d'erreur,
 * pour laisser l'appelant utiliser un message pre-redige en secours.
 */
async function polishReply({ factsSummary, userMessage, tone }) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return null;

  const model = process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-5-20250929';
  const systemPrompt = [
    "Tu es l'assistant virtuel d'une entreprise de plomberie francophone.",
    "Tu reponds toujours en francais, de maniere chaleureuse, rassurante et professionnelle.",
    'Tu dois retranscrire fidelement les informations factuelles fournies (diagnostic, prix, delais, consignes de securite, questions a poser).',
    "N'invente aucun prix, delai ou information qui ne serait pas dans les faits fournis.",
    'Reste concis : 2 a 4 phrases maximum.',
  ].join(' ');

  const userPrompt = [
    `Message du client : "${userMessage}"`,
    `Faits a communiquer : ${factsSummary}`,
    tone ? `Ton a adopter : ${tone}` : '',
    'Redige la reponse a envoyer au client.',
  ].filter(Boolean).join('\n');

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    const response = await fetch(ANTHROPIC_API_URL, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model,
        max_tokens: 300,
        system: systemPrompt,
        messages: [{ role: 'user', content: userPrompt }],
      }),
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (!response.ok) return null;
    const data = await response.json();
    const text = data?.content?.find((block) => block.type === 'text')?.text;
    return text ? text.trim() : null;
  } catch (err) {
    return null;
  }
}

module.exports = { polishReply };
