"""Signal precoce base sur Google Trends France.

Idee: un produit qui va "faire fureur" laisse une trace de recherche AVANT
d'exploser vraiment. On mesure la vitesse d'acceleration des recherches
recentes plutot que le niveau absolu, pour reperer un produit qui monte
alors qu'il est encore peu recherche (donc pas encore sature).
"""

from __future__ import annotations

from dataclasses import dataclass

import pandas as pd
from pytrends.request import TrendReq


class TrendsUnavailableError(RuntimeError):
    """Google Trends est injoignable (reseau, quota, blocage)."""


def _client() -> TrendReq:
    return TrendReq(hl="fr-FR", tz=60)


def get_interest_over_time(keyword: str, geo: str = "FR", timeframe: str = "today 12-m") -> pd.DataFrame:
    """Recupere la courbe d'interet de recherche pour un mot-cle en France.

    Retourne un DataFrame indexe par date avec une colonne portant le nom
    du mot-cle (valeurs 0-100, relatives au pic sur la periode).
    """
    try:
        pytrends = _client()
        pytrends.build_payload([keyword], timeframe=timeframe, geo=geo)
        df = pytrends.interest_over_time()
    except Exception as exc:  # network / quota / parsing issues from pytrends
        raise TrendsUnavailableError(str(exc)) from exc

    if df is None or df.empty:
        raise TrendsUnavailableError(f"Aucune donnee Google Trends pour '{keyword}' ({geo}).")

    if "isPartial" in df.columns:
        df = df.drop(columns=["isPartial"])
    return df


def get_rising_related_queries(keyword: str, geo: str = "FR", timeframe: str = "today 12-m") -> pd.DataFrame:
    """Recherches "en hausse" liees au mot-cle : ce sont souvent les futurs
    produits/variantes qui vont percer, avant qu'ils soient eux-memes recherches
    massivement.
    """
    try:
        pytrends = _client()
        pytrends.build_payload([keyword], timeframe=timeframe, geo=geo)
        related = pytrends.related_queries()
    except Exception as exc:
        raise TrendsUnavailableError(str(exc)) from exc

    rising = related.get(keyword, {}).get("rising")
    if rising is None or rising.empty:
        return pd.DataFrame(columns=["query", "value"])
    return rising


@dataclass
class VelocityResult:
    keyword: str
    recent_avg: float
    previous_avg: float
    growth_pct: float | None
    current_level: float
    label: str
    score: int  # 0-100, utilise par le predicteur


def compute_velocity_score(df: pd.DataFrame, keyword: str, recent_weeks: int = 4) -> VelocityResult:
    """Compare les `recent_weeks` dernieres semaines aux `recent_weeks`
    precedentes pour detecter une acceleration precoce.

    - forte hausse + niveau encore modere => signal "avant l'explosion"
    - forte hausse + niveau deja tres haut => probablement deja en train
      d'exploser / bientot sature
    - plat ou en baisse => pas de signal
    """
    series = df[keyword]
    if len(series) < recent_weeks * 2:
        recent_weeks = max(1, len(series) // 2)

    recent = series.tail(recent_weeks)
    previous = series.iloc[-(recent_weeks * 2) : -recent_weeks] if len(series) >= recent_weeks * 2 else series.head(0)

    recent_avg = float(recent.mean()) if len(recent) else 0.0
    previous_avg = float(previous.mean()) if len(previous) else 0.0
    current_level = float(series.tail(1).iloc[0]) if len(series) else 0.0

    if previous_avg <= 0:
        growth_pct = None if recent_avg <= 0 else float("inf")
    else:
        growth_pct = (recent_avg - previous_avg) / previous_avg * 100

    # score de velocite : on recompense une croissance forte, et on
    # penalise legerement un niveau deja tres eleve (produit deja mainstream,
    # moins interessant a "predire" puisque c'est deja arrive).
    if growth_pct is None:
        growth_component = 0
    elif growth_pct == float("inf"):
        growth_component = 70
    else:
        growth_component = max(-30, min(70, growth_pct))

    saturation_penalty = max(0, current_level - 70) * 0.4  # au-dela de 70/100, ca sature
    raw_score = 30 + growth_component - saturation_penalty
    score = int(max(0, min(100, round(raw_score))))

    if growth_pct is not None and growth_pct != float("inf") and growth_pct >= 50 and current_level < 60:
        label = "Signal precoce fort : ca monte et ce n'est pas encore sature"
    elif growth_pct == float("inf"):
        label = "Demarrage detecte : quasiment aucune recherche avant, ca vient d'apparaitre"
    elif growth_pct is not None and growth_pct >= 20:
        label = "Tendance haussiere moderee"
    elif current_level >= 70:
        label = "Deja tres recherche : probablement deja mainstream en France"
    elif growth_pct is not None and growth_pct <= -20:
        label = "En baisse"
    else:
        label = "Stable, pas de signal notable"

    return VelocityResult(
        keyword=keyword,
        recent_avg=round(recent_avg, 1),
        previous_avg=round(previous_avg, 1),
        growth_pct=None if growth_pct is None else (round(growth_pct, 1) if growth_pct != float("inf") else None),
        current_level=round(current_level, 1),
        label=label,
        score=score,
    )
