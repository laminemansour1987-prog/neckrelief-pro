from . import watchlist
from .google_trends import (
    ForecastResult,
    LeadSignal,
    TrendsUnavailableError,
    VelocityResult,
    compute_lead_signal,
    compute_velocity_score,
    forecast_trend,
    get_interest_over_time,
    get_multi_geo_interest,
    get_rising_related_queries,
)
from .predictor import Prediction, predict_product
from .scorecard import SCORECARD_CRITERIA, compute_scorecard_score

__all__ = [
    "watchlist",
    "get_interest_over_time",
    "get_multi_geo_interest",
    "get_rising_related_queries",
    "compute_velocity_score",
    "compute_lead_signal",
    "forecast_trend",
    "VelocityResult",
    "LeadSignal",
    "ForecastResult",
    "TrendsUnavailableError",
    "SCORECARD_CRITERIA",
    "compute_scorecard_score",
    "Prediction",
    "predict_product",
]
