#!/usr/bin/env python3
"""Analyse en masse depuis la ligne de commande.

Usage:
    python batch_analyze.py sample_products.csv
    python batch_analyze.py sample_products.csv --out resultats.csv --trends-weight 0.6

Le CSV d'entree doit avoir une colonne `product` et, optionnellement, une
colonne `keyword` (mot-cle Google Trends a utiliser si different du nom du
produit).
"""

from __future__ import annotations

import argparse
import sys

import pandas as pd

from trend_predictor import predict_product


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("input_csv", help="CSV avec une colonne 'product' (et optionnellement 'keyword')")
    parser.add_argument("--out", default="resultats_predictions.csv", help="Fichier CSV de sortie")
    parser.add_argument("--trends-weight", type=float, default=0.5, help="Poids du signal Google Trends (0-1)")
    args = parser.parse_args()

    df_in = pd.read_csv(args.input_csv)
    if "product" not in df_in.columns:
        print("Erreur : le CSV doit contenir une colonne 'product'.", file=sys.stderr)
        return 1

    rows = []
    for _, row in df_in.iterrows():
        product = str(row["product"])
        keyword = str(row["keyword"]) if "keyword" in df_in.columns and pd.notna(row.get("keyword")) else None
        print(f"Analyse : {product}...", file=sys.stderr)
        pred = predict_product(
            product=product,
            keyword=keyword,
            trends_weight=args.trends_weight,
            scorecard_weight=1 - args.trends_weight,
        )
        rows.append(
            {
                "produit": pred.product,
                "score_final": pred.final_score,
                "classification": pred.classification,
                "score_trends": pred.trends_result.score if pred.trends_result else None,
                "niveau_recherche_actuel": pred.trends_result.current_level if pred.trends_result else None,
                "croissance_pct": pred.trends_result.growth_pct if pred.trends_result else None,
                "score_scorecard": pred.scorecard_score,
                "notes": "; ".join(pred.notes),
            }
        )

    out_df = pd.DataFrame(rows).sort_values("score_final", ascending=False)
    out_df.to_csv(args.out, index=False)
    print(out_df.to_string(index=False))
    print(f"\nResultats enregistres dans : {args.out}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
