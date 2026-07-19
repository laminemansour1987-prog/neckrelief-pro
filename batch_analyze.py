#!/usr/bin/env python3
"""Analyse en masse depuis la ligne de commande.

Usage:
    python batch_analyze.py sample_products.csv
    python batch_analyze.py sample_products.csv --out resultats.csv --trends-weight 0.4 \
        --scorecard-weight 0.35 --lead-weight 0.25 --international --ai

Le CSV d'entree doit avoir une colonne `product` et, optionnellement, une
colonne `keyword` (mot-cle Google Trends a utiliser si different du nom du
produit). Chaque analyse est aussi enregistree dans l'historique
(watchlist.db) pour pouvoir suivre l'evolution du score dans le temps.
"""

from __future__ import annotations

import argparse
import sys

import pandas as pd

from trend_predictor import default_lead_geos_for, predict_product, watchlist


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("input_csv", help="CSV avec une colonne 'product' (et optionnellement 'keyword')")
    parser.add_argument("--out", default="resultats_predictions.csv", help="Fichier CSV de sortie")
    parser.add_argument("--market", default="FR", help="Marche cible (code ISO-2, ex: FR, US, GB, DE...)")
    parser.add_argument("--trends-weight", type=float, default=0.4, help="Poids du signal Google Trends (marche cible) (0-1)")
    parser.add_argument("--scorecard-weight", type=float, default=0.35, help="Poids du scorecard (0-1)")
    parser.add_argument("--lead-weight", type=float, default=0.25, help="Poids du signal international (0-1)")
    parser.add_argument(
        "--international",
        action="store_true",
        help="Active le signal international (compare le marche cible a --lead-geos). Plus lent (requetes reseau en plus).",
    )
    parser.add_argument(
        "--lead-geos",
        default=None,
        help="Pays de comparaison pour le signal international (codes ISO-2 separes par des virgules). "
        "Par defaut, choisis automatiquement selon --market.",
    )
    parser.add_argument(
        "--ai",
        action="store_true",
        help="Genere une analyse qualitative via Claude (necessite ANTHROPIC_API_KEY).",
    )
    args = parser.parse_args()

    df_in = pd.read_csv(args.input_csv)
    if "product" not in df_in.columns:
        print("Erreur : le CSV doit contenir une colonne 'product'.", file=sys.stderr)
        return 1

    market = args.market.strip().upper()
    lead_geos = (
        tuple(g.strip().upper() for g in args.lead_geos.split(",") if g.strip())
        if args.lead_geos
        else default_lead_geos_for(market)
    )

    rows = []
    for _, row in df_in.iterrows():
        product = str(row["product"])
        keyword = str(row["keyword"]) if "keyword" in df_in.columns and pd.notna(row.get("keyword")) else None
        print(f"Analyse : {product}...", file=sys.stderr)
        pred = predict_product(
            product=product,
            keyword=keyword,
            geo=market,
            lead_geos=lead_geos,
            trends_weight=args.trends_weight,
            scorecard_weight=args.scorecard_weight,
            lead_weight=args.lead_weight,
            include_international=args.international,
            include_ai=args.ai,
        )
        watchlist.save_analysis(
            product=pred.product,
            keyword=keyword,
            final_score=pred.final_score,
            trends_score=pred.trends_result.score if pred.trends_result else None,
            scorecard_score=pred.scorecard_score,
            lead_score=pred.lead_result.score if pred.lead_result else None,
        )
        rows.append(
            {
                "produit": pred.product,
                "score_final": pred.final_score,
                "classification": pred.classification,
                "score_trends_france": pred.trends_result.score if pred.trends_result else None,
                "niveau_recherche_actuel_fr": pred.trends_result.current_level if pred.trends_result else None,
                "croissance_pct_fr": pred.trends_result.growth_pct if pred.trends_result else None,
                "projection_4_semaines": pred.forecast.projected_level if pred.forecast else None,
                "score_international": pred.lead_result.score if pred.lead_result else None,
                "signal_international": pred.lead_result.label if pred.lead_result else None,
                "score_scorecard": pred.scorecard_score,
                "analyse_ia": pred.ai_insight,
                "notes": "; ".join(pred.notes),
            }
        )

    out_df = pd.DataFrame(rows).sort_values("score_final", ascending=False)
    out_df.to_csv(args.out, index=False)
    print(out_df.drop(columns=["analyse_ia"]).to_string(index=False))
    print(f"\nResultats enregistres dans : {args.out}")
    print("Historique mis a jour dans : watchlist.db (voir l'onglet Historique du dashboard)")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
