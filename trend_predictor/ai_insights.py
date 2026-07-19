"""Analyse qualitative optionnelle via l'API Claude (Anthropic).

Completement optionnel : si `ANTHROPIC_API_KEY` n'est pas defini ou si le
package `anthropic` n'est pas installe, les fonctions renvoient simplement
`None` et le reste de l'outil continue de fonctionner normalement.
"""

from __future__ import annotations

import os

_MODEL = "claude-haiku-4-5-20251001"


def is_available() -> bool:
    return bool(os.environ.get("ANTHROPIC_API_KEY"))


def generate_insight(product: str, context: str) -> str | None:
    """Retourne une courte analyse en francais (pourquoi + angle marketing),
    ou None si l'IA n'est pas configuree/disponible."""
    api_key = os.environ.get("ANTHROPIC_API_KEY")
    if not api_key:
        return None

    try:
        import anthropic
    except ImportError:
        return None

    prompt = (
        "Tu es un expert e-commerce/dropshipping specialise dans le marche francais. "
        f"Voici les donnees d'analyse de tendance pour le produit '{product}':\n\n{context}\n\n"
        "En 3 a 4 phrases en francais, donne :\n"
        "1) une conclusion honnete sur le potentiel de ce produit en France en ce moment "
        "(ne pas etre complaisant si les signaux sont faibles),\n"
        "2) un angle marketing/publicitaire concret et specifique a tester.\n"
        "Reste direct et actionnable, evite les generalites."
    )

    try:
        client = anthropic.Anthropic(api_key=api_key)
        message = client.messages.create(
            model=_MODEL,
            max_tokens=350,
            messages=[{"role": "user", "content": prompt}],
        )
        return message.content[0].text.strip()
    except Exception as exc:  # cle invalide, quota, reseau...
        return f"(Analyse IA indisponible : {exc})"
