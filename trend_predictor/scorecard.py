"""Scorecard 'produit gagnant', adapte au marche francais.

Chaque critere est note de 1 (faible) a 5 (excellent) par l'utilisateur.
On calcule ensuite un score pondere sur 100. Les criteres et poids
s'inspirent des grilles classiques utilisees en e-commerce/dropshipping
pour juger du potentiel d'un produit AVANT qu'il ne soit lance.
"""

from __future__ import annotations

# cle -> (libelle affiche, poids relatif, description courte)
SCORECARD_CRITERIA: dict[str, tuple[str, int, str]] = {
    "probleme_resout": (
        "Resout un vrai probleme / besoin",
        15,
        "Le produit repond a une douleur claire (ex: douleur au cou, mauvaise posture).",
    ),
    "effet_wahou": (
        "Effet « wahou » / demonstration visuelle",
        15,
        "Fonctionne bien en video courte (TikTok/Reels), donne envie au premier coup d'oeil.",
    ),
    "marge": (
        "Marge potentielle",
        15,
        "Prix de vente possible nettement superieur au cout d'achat/fabrication.",
    ),
    "nouveaute_france": (
        "Nouveaute / faible saturation en France",
        15,
        "Peu ou pas encore vendu massivement par des concurrents francais.",
    ),
    "ciblage_pub": (
        "Facilite de ciblage publicitaire",
        10,
        "Audience et centres d'interet clairement identifiables sur Meta/TikTok Ads.",
    ),
    "achat_impulsif": (
        "Achat impulsif (prix accessible)",
        10,
        "Prix de vente generalement sous 50-60 euros, decision d'achat rapide.",
    ),
    "logistique": (
        "Logistique simple",
        10,
        "Leger, peu fragile, facile a stocker/expedier.",
    ),
    "preuve_sociale": (
        "Preuve sociale naissante",
        10,
        "Premiers avis, UGC ou mentions deja visibles, sans etre sature.",
    ),
}

MAX_WEIGHT = sum(weight for _, weight, _ in SCORECARD_CRITERIA.values())


def compute_scorecard_score(ratings: dict[str, int]) -> int:
    """`ratings` : cle du critere -> note de 1 a 5.

    Criteres manquants comptes comme note neutre (3/5).
    Retourne un score sur 100.
    """
    total = 0.0
    for key, (_, weight, _) in SCORECARD_CRITERIA.items():
        note = ratings.get(key, 3)
        note = max(1, min(5, note))
        total += (note / 5) * weight
    return round((total / MAX_WEIGHT) * 100)
