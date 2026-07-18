"""Combine le signal Google Trends France et le scorecard manuel en une
seule prediction exploitable."""

from __future__ import annotations

from dataclasses import dataclass, field

from .google_trends import (
    TrendsUnavailableError,
    VelocityResult,
    compute_velocity_score,
    get_interest_over_time,
)
from .scorecard import compute_scorecard_score

# poids par defaut entre le signal Google Trends et le jugement produit
DEFAULT_TRENDS_WEIGHT = 0.5
DEFAULT_SCORECARD_WEIGHT = 0.5


@dataclass
class Prediction:
    product: str
    final_score: int
    classification: str
    scorecard_score: int | None = None
    trends_result: VelocityResult | None = None
    trends_error: str | None = None
    notes: list[str] = field(default_factory=list)


def _classify(score: int) -> str:
    if score >= 75:
        return "🔥 Fort potentiel — a tester en priorite"
    if score >= 55:
        return "🟡 A surveiller — potentiel correct, valider avant d'investir"
    if score >= 35:
        return "🟠 Incertain — signal faible ou donnees insuffisantes"
    return "⚪ Faible potentiel"


def predict_product(
    product: str,
    ratings: dict[str, int] | None = None,
    keyword: str | None = None,
    geo: str = "FR",
    trends_weight: float = DEFAULT_TRENDS_WEIGHT,
    scorecard_weight: float = DEFAULT_SCORECARD_WEIGHT,
) -> Prediction:
    """Calcule une prediction pour un produit.

    - `ratings` : notes du scorecard manuel (voir scorecard.SCORECARD_CRITERIA)
    - `keyword` : mot-cle a interroger sur Google Trends (par defaut = `product`)
    """
    notes: list[str] = []
    scorecard_score = compute_scorecard_score(ratings) if ratings else None

    trends_result: VelocityResult | None = None
    trends_error: str | None = None
    try:
        df = get_interest_over_time(keyword or product, geo=geo)
        trends_result = compute_velocity_score(df, keyword or product)
    except TrendsUnavailableError as exc:
        trends_error = str(exc)
        notes.append("Google Trends indisponible pour ce mot-cle : score base sur le scorecard uniquement.")

    if scorecard_score is not None and trends_result is not None:
        final_score = round(scorecard_score * scorecard_weight + trends_result.score * trends_weight)
    elif trends_result is not None:
        final_score = trends_result.score
        notes.append("Pas de scorecard fourni : score base uniquement sur Google Trends.")
    elif scorecard_score is not None:
        final_score = scorecard_score
    else:
        final_score = 0
        notes.append("Aucune donnee disponible (ni scorecard ni Google Trends).")

    return Prediction(
        product=product,
        final_score=int(final_score),
        classification=_classify(int(final_score)),
        scorecard_score=scorecard_score,
        trends_result=trends_result,
        trends_error=trends_error,
        notes=notes,
    )
