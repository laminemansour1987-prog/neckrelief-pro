"""Tests unitaires purs (aucun appel reseau) pour la logique de scoring."""

import os

import pandas as pd
import pytest

from trend_predictor.google_trends import (
    compute_lead_signal,
    compute_velocity_score_from_series,
    forecast_trend,
)
from trend_predictor.scorecard import SCORECARD_CRITERIA, compute_scorecard_score


def _dates(n: int) -> pd.DatetimeIndex:
    return pd.date_range("2026-01-01", periods=n, freq="W")


def test_scorecard_all_max_gives_100():
    ratings = {k: 5 for k in SCORECARD_CRITERIA}
    assert compute_scorecard_score(ratings) == 100


def test_scorecard_all_min_gives_20():
    ratings = {k: 1 for k in SCORECARD_CRITERIA}
    assert compute_scorecard_score(ratings) == 20


def test_scorecard_missing_criteria_defaults_neutral():
    assert compute_scorecard_score({}) == 60  # tous a 3/5 => 60/100


def test_velocity_detects_early_rise_before_saturation():
    series = pd.Series([5, 5, 6, 6, 8, 9, 12, 15], index=_dates(8))
    result = compute_velocity_score_from_series(series, "produit")
    assert result.growth_pct is not None and result.growth_pct > 0
    assert result.score > 50
    assert "precoce" in result.label.lower() or "haussi" in result.label.lower()


def test_velocity_flags_already_saturated_product():
    series = pd.Series([90, 92, 95, 96, 97, 98, 99, 99], index=_dates(8))
    result = compute_velocity_score_from_series(series, "produit")
    assert result.current_level >= 90
    assert "mainstream" in result.label.lower() or result.score < 60


def test_lead_signal_detects_foreign_breakout_before_france():
    dates = _dates(16)
    us = pd.Series([5, 6, 5, 7, 8, 10, 12, 15, 20, 28, 38, 50, 62, 75, 85, 92], index=dates)
    fr = pd.Series([2, 2, 3, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 8, 9, 10], index=dates)
    multi = pd.DataFrame({"FR": fr, "US": us})

    lead = compute_lead_signal(multi, "produit", home_geo="FR")

    assert lead.leading_geo == "US"
    assert lead.score >= 70
    assert "anticipation" in lead.label.lower()


def test_lead_signal_neutral_when_flat_everywhere():
    dates = _dates(16)
    flat = pd.Series([50] * 16, index=dates)
    noisy_flat = pd.Series([48, 49, 50, 51, 49, 50, 50, 49, 51, 50, 49, 50, 51, 50, 49, 50], index=dates)
    multi = pd.DataFrame({"FR": noisy_flat, "US": flat})

    lead = compute_lead_signal(multi, "produit", home_geo="FR")
    assert lead.score < 50


def test_forecast_projects_upward_trend():
    series = pd.Series([10, 15, 20, 25, 30, 35], index=_dates(6))
    fc = forecast_trend(series, weeks_ahead=4)
    assert fc.slope_per_week > 0
    assert fc.projected_level > series.iloc[-1]
    assert fc.confidence > 0.9


def test_forecast_handles_flat_noisy_data_gracefully():
    series = pd.Series([50, 51, 49, 50, 50, 49], index=_dates(6))
    fc = forecast_trend(series, weeks_ahead=4)
    assert 0 <= fc.confidence <= 1
    assert 0 <= fc.projected_level <= 100


def test_watchlist_roundtrip(tmp_path, monkeypatch):
    monkeypatch.setenv("TREND_PREDICTOR_DB", str(tmp_path / "test.db"))
    from trend_predictor import watchlist

    watchlist.save_analysis("produit test", "kw", 42)
    watchlist.save_analysis("produit test", "kw", 55)

    history = watchlist.get_history("produit test")
    assert [dict(r)["final_score"] for r in history] == [42, 55]

    latest = watchlist.list_latest()
    assert dict(latest[0])["final_score"] == 55
