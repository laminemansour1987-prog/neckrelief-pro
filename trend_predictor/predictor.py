"""Combine le signal Google Trends du marche cible, le signal international
d'anticipation et le scorecard manuel en une seule prediction exploitable."""

from __future__ import annotations

from dataclasses import dataclass, field

from . import ai_insights
from .google_trends import (
    DEFAULT_LEAD_GEOS,
    ForecastResult,
    LeadSignal,
    TrendsUnavailableError,
    VelocityResult,
    compute_lead_signal,
    compute_velocity_score,
    forecast_trend,
    get_interest_over_time,
    get_multi_geo_interest,
)
from .scorecard import compute_scorecard_score

# poids par defaut entre les trois composantes du score final
DEFAULT_TRENDS_WEIGHT = 0.4
DEFAULT_SCORECARD_WEIGHT = 0.35
DEFAULT_LEAD_WEIGHT = 0.25


def _combine_weighted(parts: list[tuple[int, float]]) -> int:
    total_weight = sum(w for _, w in parts if w > 0)
    if total_weight <= 0:
        return 0
    return round(sum(s * w for s, w in parts if w > 0) / total_weight)


@dataclass
class Prediction:
    product: str
    final_score: int
    classification: str
    scorecard_score: int | None = None
    trends_result: VelocityResult | None = None
    trends_error: str | None = None
    lead_result: LeadSignal | None = None
    lead_error: str | None = None
    forecast: ForecastResult | None = None
    ai_insight: str | None = None
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
    lead_geos: tuple[str, ...] = DEFAULT_LEAD_GEOS,
    trends_weight: float = DEFAULT_TRENDS_WEIGHT,
    scorecard_weight: float = DEFAULT_SCORECARD_WEIGHT,
    lead_weight: float = DEFAULT_LEAD_WEIGHT,
    include_international: bool = True,
    include_forecast: bool = True,
    include_ai: bool = False,
) -> Prediction:
    """Calcule une prediction pour un produit.

    - `ratings` : notes du scorecard manuel (voir scorecard.SCORECARD_CRITERIA)
    - `keyword` : mot-cle a interroger sur Google Trends (par defaut = `product`)
    - `geo` : marche cible (code ISO-2, ex: FR, US, GB, DE...)
    - `include_international` : compare `geo` a `lead_geos` pour detecter un
      produit deja en train de percer ailleurs avant d'arriver sur le marche cible.
    - `include_ai` : genere une courte analyse qualitative via Claude si
      `ANTHROPIC_API_KEY` est configure (sinon ignore silencieusement).
    """
    notes: list[str] = []
    kw = keyword or product
    scorecard_score = compute_scorecard_score(ratings) if ratings else None

    trends_result: VelocityResult | None = None
    trends_error: str | None = None
    forecast: ForecastResult | None = None
    try:
        df = get_interest_over_time(kw, geo=geo)
        trends_result = compute_velocity_score(df, kw)
        if include_forecast:
            forecast = forecast_trend(df[kw])
    except TrendsUnavailableError as exc:
        trends_error = str(exc)
        notes.append(f"Google Trends {geo} indisponible pour ce mot-cle.")

    lead_result: LeadSignal | None = None
    lead_error: str | None = None
    if include_international:
        try:
            multi_df, geo_errors = get_multi_geo_interest(kw, geos=(geo,) + tuple(lead_geos))
            if geo in multi_df.columns:
                lead_result = compute_lead_signal(multi_df, kw, home_geo=geo)
            else:
                lead_error = f"Pas de donnees {geo} pour comparer aux autres pays ({', '.join(geo_errors) or 'inconnu'})."
            if geo_errors:
                notes.append(
                    "Pays sans donnees pour le signal international : " + ", ".join(sorted(geo_errors)) + "."
                )
        except TrendsUnavailableError as exc:
            lead_error = str(exc)

    parts: list[tuple[int, float]] = []
    if trends_result is not None:
        parts.append((trends_result.score, trends_weight))
    if scorecard_score is not None:
        parts.append((scorecard_score, scorecard_weight))
    if lead_result is not None:
        parts.append((lead_result.score, lead_weight))

    if parts:
        final_score = _combine_weighted(parts)
    else:
        final_score = 0
        notes.append("Aucune donnee disponible (ni scorecard, ni Google Trends, ni signal international).")

    if len(parts) == 1 and scorecard_score is None:
        notes.append("Pas de scorecard fourni : score base uniquement sur les signaux Google Trends.")

    ai_insight: str | None = None
    if include_ai:
        if not ai_insights.is_available():
            notes.append("Analyse IA desactivee : definis ANTHROPIC_API_KEY pour l'activer.")
        else:
            context_lines = [f"Score final : {final_score}/100"]
            if scorecard_score is not None:
                context_lines.append(f"Score scorecard : {scorecard_score}/100")
            if trends_result is not None:
                context_lines.append(
                    f"Google Trends {geo} : niveau actuel {trends_result.current_level}/100, "
                    f"{trends_result.label}"
                )
            if forecast is not None:
                context_lines.append(f"Projection : {forecast.label}")
            if lead_result is not None:
                context_lines.append(f"Signal international : {lead_result.label}")
            ai_insight = ai_insights.generate_insight(product, "\n".join(context_lines))

    return Prediction(
        product=product,
        final_score=int(final_score),
        classification=_classify(int(final_score)),
        scorecard_score=scorecard_score,
        trends_result=trends_result,
        trends_error=trends_error,
        lead_result=lead_result,
        lead_error=lead_error,
        forecast=forecast,
        ai_insight=ai_insight,
        notes=notes,
    )
