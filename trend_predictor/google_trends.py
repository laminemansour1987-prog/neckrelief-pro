"""Signal precoce base sur Google Trends France.

Idee: un produit qui va "faire fureur" laisse une trace de recherche AVANT
d'exploser vraiment. On mesure la vitesse d'acceleration des recherches
recentes plutot que le niveau absolu, pour reperer un produit qui monte
alors qu'il est encore peu recherche (donc pas encore sature).
"""

from __future__ import annotations

from dataclasses import dataclass

import numpy as np
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
    return compute_velocity_score_from_series(df[keyword], keyword, recent_weeks=recent_weeks)


def compute_velocity_score_from_series(series: pd.Series, keyword: str, recent_weeks: int = 4) -> VelocityResult:
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


# ---------------------------------------------------------------------------
# Marches disponibles : l'outil n'est plus limite a la France. Chaque marche
# a des pays de comparaison par defaut ("signal international") ou les
# produits ont tendance a percer un peu avant.
# ---------------------------------------------------------------------------

MARKET_LABELS: dict[str, str] = {
    "FR": "France 🇫🇷",
    "BE": "Belgique 🇧🇪",
    "CH": "Suisse 🇨🇭",
    "US": "Etats-Unis 🇺🇸",
    "GB": "Royaume-Uni 🇬🇧",
    "DE": "Allemagne 🇩🇪",
    "ES": "Espagne 🇪🇸",
    "IT": "Italie 🇮🇹",
    "CA": "Canada 🇨🇦",
    "NL": "Pays-Bas 🇳🇱",
    "PT": "Portugal 🇵🇹",
    "MA": "Maroc 🇲🇦",
}

DEFAULT_LEAD_GEOS_BY_MARKET: dict[str, tuple[str, ...]] = {
    "FR": ("US", "GB", "DE"),
    "BE": ("FR", "NL", "GB"),
    "CH": ("FR", "DE", "IT"),
    "US": ("GB", "CA", "AU"),
    "GB": ("US", "DE", "FR"),
    "DE": ("US", "GB", "NL"),
    "ES": ("US", "FR", "IT"),
    "IT": ("US", "FR", "DE"),
    "CA": ("US", "GB", "FR"),
    "NL": ("DE", "GB", "US"),
    "PT": ("ES", "FR", "US"),
    "MA": ("FR", "ES", "US"),
}

DEFAULT_LEAD_GEOS: tuple[str, ...] = ("US", "GB", "DE")


def default_lead_geos_for(market: str) -> tuple[str, ...]:
    return DEFAULT_LEAD_GEOS_BY_MARKET.get(market.upper(), DEFAULT_LEAD_GEOS)


def get_multi_geo_interest(
    keyword: str,
    geos: tuple[str, ...],
    timeframe: str = "today 12-m",
) -> tuple[pd.DataFrame, dict[str, str]]:
    """Recupere l'interet de recherche pour le meme mot-cle dans plusieurs pays.

    Retourne (DataFrame avec une colonne par code pays, erreurs par pays en echec).
    Leve TrendsUnavailableError uniquement si AUCUN pays n'a pu etre recupere.
    """
    series_by_geo: dict[str, pd.Series] = {}
    errors: dict[str, str] = {}
    for geo in geos:
        try:
            df = get_interest_over_time(keyword, geo=geo, timeframe=timeframe)
            series_by_geo[geo] = df[keyword]
        except TrendsUnavailableError as exc:
            errors[geo] = str(exc)

    if not series_by_geo:
        raise TrendsUnavailableError(
            f"Aucune donnee Google Trends pour '{keyword}' dans les pays testes ({', '.join(geos)})."
        )

    combined = pd.DataFrame(series_by_geo)
    return combined, errors


@dataclass
class LeadSignal:
    keyword: str
    home_geo: str
    leading_geo: str | None
    leading_growth_pct: float | None
    home_level: float
    leading_level: float | None
    correlation: float | None
    estimated_lag_weeks: int | None
    label: str
    score: int


def _pearson_lag_correlation(foreign: pd.Series, home: pd.Series, max_lag: int) -> tuple[int, float]:
    """Cherche le decalage (en points de la serie, ~semaines) qui maximise la
    correlation entre le pays etranger (en avance) et la France (en retard).
    """
    aligned = pd.concat([foreign, home], axis=1, join="inner").dropna()
    if len(aligned) < 6:
        return 0, 0.0

    f = aligned.iloc[:, 0].to_numpy(dtype=float)
    h = aligned.iloc[:, 1].to_numpy(dtype=float)
    n = len(f)

    best_lag, best_corr = 0, -2.0
    for lag in range(0, min(max_lag, n - 4) + 1):
        fs, hs = (f, h) if lag == 0 else (f[:-lag], h[lag:])
        if len(fs) < 4 or fs.std() == 0 or hs.std() == 0:
            continue
        corr = float(np.corrcoef(fs, hs)[0, 1])
        if corr > best_corr:
            best_corr, best_lag = corr, lag

    return best_lag, (0.0 if best_corr < -1 else best_corr)


def compute_lead_signal(
    multi_df: pd.DataFrame,
    keyword: str,
    home_geo: str = "FR",
    max_lag_weeks: int = 12,
) -> LeadSignal:
    """Determine si un marche etranger est "en avance" sur la France pour ce
    mot-cle : deja en forte hausse la-bas pendant que la France est encore
    plate/basse = signal d'anticipation avant que ca explose en France.
    """
    if home_geo not in multi_df.columns:
        raise ValueError(f"'{home_geo}' absent des donnees multi-pays fournies.")

    home_series = multi_df[home_geo].dropna()
    home_level = float(home_series.tail(1).iloc[0]) if len(home_series) else 0.0
    home_vel = (
        compute_velocity_score_from_series(home_series, f"{keyword} ({home_geo})")
        if len(home_series) >= 4
        else None
    )

    candidates: list[tuple[str, VelocityResult, int, float]] = []
    for geo in multi_df.columns:
        if geo == home_geo:
            continue
        series = multi_df[geo].dropna()
        if len(series) < 4:
            continue
        vel = compute_velocity_score_from_series(series, f"{keyword} ({geo})")
        lag, corr = _pearson_lag_correlation(series, home_series, max_lag_weeks)
        candidates.append((geo, vel, lag, corr))

    if not candidates:
        return LeadSignal(
            keyword=keyword,
            home_geo=home_geo,
            leading_geo=None,
            leading_growth_pct=None,
            home_level=round(home_level, 1),
            leading_level=None,
            correlation=None,
            estimated_lag_weeks=None,
            label="Pas assez de donnees internationales comparables.",
            score=0,
        )

    # on privilegie un pays qui est net. en hausse ET dont le niveau depasse la France
    def sort_key(candidate: tuple[str, VelocityResult, int, float]) -> float:
        _, vel, _, _ = candidate
        return (vel.growth_pct or 0) + (vel.current_level - home_level)

    candidates.sort(key=sort_key, reverse=True)
    geo, vel, lag, corr = candidates[0]

    already_bigger_at_home = home_vel is not None and (home_vel.growth_pct or 0) >= (vel.growth_pct or 0)
    ahead = (
        not already_bigger_at_home
        and vel.current_level > home_level + 15
        and (vel.growth_pct or 0) > 15
    )

    if ahead:
        score = int(max(0, min(100, 40 + (vel.growth_pct or 0) * 0.4 + (vel.current_level - home_level) * 0.3)))
        lag_txt = f" (decalage historique estime ~{lag} semaine(s))" if corr > 0.4 and lag > 0 else ""
        label = f"En forte hausse en {geo}, encore faible en France : signal d'anticipation fort{lag_txt}."
    elif corr > 0.5 and lag > 0:
        score = int(30 + corr * 40)
        label = f"Correlation historique avec {geo} (decalage estime ~{lag} semaine(s)), a surveiller."
    else:
        score = 15
        label = "Pas de signal d'anticipation international clair pour l'instant."

    return LeadSignal(
        keyword=keyword,
        home_geo=home_geo,
        leading_geo=geo,
        leading_growth_pct=vel.growth_pct,
        home_level=round(home_level, 1),
        leading_level=vel.current_level,
        correlation=round(corr, 2),
        estimated_lag_weeks=lag if corr > 0.3 else None,
        label=label,
        score=score,
    )


# ---------------------------------------------------------------------------
# Projection : extrapole la courbe recente pour estimer ou en sera l'interet
# dans quelques semaines (regression lineaire simple).
# ---------------------------------------------------------------------------


@dataclass
class ForecastResult:
    projected_level: float
    weeks_ahead: int
    slope_per_week: float
    confidence: float  # R^2, 0-1
    label: str


def forecast_trend(series: pd.Series, weeks_ahead: int = 4, window: int = 12) -> ForecastResult:
    y = series.tail(window).dropna().to_numpy(dtype=float)
    if len(y) < 4 or y.std() == 0:
        current = float(y[-1]) if len(y) else 0.0
        return ForecastResult(
            projected_level=round(current, 1),
            weeks_ahead=weeks_ahead,
            slope_per_week=0.0,
            confidence=0.0,
            label="Pas assez de donnees pour projeter de maniere fiable.",
        )

    x = np.arange(len(y), dtype=float)
    slope, intercept = np.polyfit(x, y, 1)
    y_pred = slope * x + intercept
    ss_res = float(np.sum((y - y_pred) ** 2))
    ss_tot = float(np.sum((y - y.mean()) ** 2))
    confidence = 0.0 if ss_tot == 0 else max(0.0, 1 - ss_res / ss_tot)

    projected = float(slope * (len(y) - 1 + weeks_ahead) + intercept)
    projected = max(0.0, min(100.0, projected))

    if slope > 1 and confidence > 0.4:
        label = f"Projection en nette hausse (~{round(projected)}/100 dans {weeks_ahead} semaines)."
    elif slope > 0.3 and confidence > 0.3:
        label = f"Projection en hausse moderee (~{round(projected)}/100 dans {weeks_ahead} semaines)."
    elif slope < -1 and confidence > 0.4:
        label = "Projection en baisse."
    else:
        label = "Projection stable ou peu fiable (donnees trop bruitees)."

    return ForecastResult(
        projected_level=round(projected, 1),
        weeks_ahead=weeks_ahead,
        slope_per_week=round(float(slope), 2),
        confidence=round(confidence, 2),
        label=label,
    )
