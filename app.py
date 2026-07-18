"""Dashboard : predire quel produit va faire fureur en France.

Lancer avec :  streamlit run app.py
"""

from __future__ import annotations

import pandas as pd
import plotly.graph_objects as go
import streamlit as st

from trend_predictor import (
    SCORECARD_CRITERIA,
    compute_scorecard_score,
    get_interest_over_time,
    get_rising_related_queries,
    predict_product,
)
from trend_predictor.google_trends import TrendsUnavailableError, compute_velocity_score

st.set_page_config(page_title="Predicteur de produits gagnants — France", page_icon="🔮", layout="wide")

st.title("🔮 Quel produit va faire fureur en France ?")
st.caption(
    "Repere un produit AVANT qu'il explose : signal de recherche precoce (Google Trends France) "
    "+ grille d'evaluation « produit gagnant »."
)

tab_single, tab_scorecard, tab_batch, tab_rising = st.tabs(
    ["📈 Analyse d'un produit", "📝 Scorecard seul", "📂 Analyse en masse (CSV)", "🌱 Idees emergentes"]
)

# ---------------------------------------------------------------------------
# Onglet 1 : analyse complete d'un produit (trends + scorecard)
# ---------------------------------------------------------------------------
with tab_single:
    col_a, col_b = st.columns([2, 1])
    with col_a:
        product_name = st.text_input("Nom du produit", placeholder="ex: coussin cervical chauffant")
        keyword = st.text_input(
            "Mot-cle Google Trends (optionnel, sinon on utilise le nom du produit)",
            placeholder="ex: coussin cervical",
        )
    with col_b:
        st.markdown("**Poids de la note finale**")
        trends_weight = st.slider("Poids Google Trends", 0.0, 1.0, 0.5, 0.05)
        scorecard_weight = 1 - trends_weight
        st.caption(f"Poids scorecard : {scorecard_weight:.2f}")

    st.subheader("Scorecard produit gagnant")
    st.caption("Note chaque critere de 1 (faible) a 5 (excellent).")
    ratings: dict[str, int] = {}
    cols = st.columns(2)
    for i, (key, (label, weight, desc)) in enumerate(SCORECARD_CRITERIA.items()):
        with cols[i % 2]:
            ratings[key] = st.slider(f"{label} (poids {weight})", 1, 5, 3, help=desc, key=f"single_{key}")

    if st.button("Analyser", type="primary", disabled=not product_name):
        with st.spinner("Analyse en cours..."):
            prediction = predict_product(
                product=product_name,
                ratings=ratings,
                keyword=keyword or None,
                trends_weight=trends_weight,
                scorecard_weight=scorecard_weight,
            )

        st.metric("Score final de potentiel", f"{prediction.final_score}/100")
        st.markdown(f"### {prediction.classification}")

        c1, c2 = st.columns(2)
        with c1:
            st.markdown("**Scorecard**")
            st.write(f"{prediction.scorecard_score}/100")
        with c2:
            st.markdown("**Google Trends France**")
            if prediction.trends_result:
                tr = prediction.trends_result
                st.write(f"{tr.score}/100 — {tr.label}")
                st.caption(
                    f"Niveau actuel : {tr.current_level}/100 · "
                    f"Moyenne recente : {tr.recent_avg} · Moyenne precedente : {tr.previous_avg}"
                    + (f" · Croissance : {tr.growth_pct}%" if tr.growth_pct is not None else "")
                )
            elif prediction.trends_error:
                st.warning(prediction.trends_error)

        for note in prediction.notes:
            st.info(note)

        if prediction.trends_result:
            try:
                df = get_interest_over_time(keyword or product_name)
                fig = go.Figure()
                fig.add_trace(go.Scatter(x=df.index, y=df[keyword or product_name], mode="lines", name="Interet de recherche"))
                fig.update_layout(
                    title="Interet de recherche en France (12 derniers mois)",
                    yaxis_title="Interet relatif (0-100)",
                    xaxis_title="Date",
                    height=350,
                )
                st.plotly_chart(fig, use_container_width=True)
            except TrendsUnavailableError:
                pass

# ---------------------------------------------------------------------------
# Onglet 2 : scorecard seul, sans appel reseau
# ---------------------------------------------------------------------------
with tab_scorecard:
    st.caption("Utile pour juger un produit rapidement sans dependre de Google Trends.")
    ratings2: dict[str, int] = {}
    cols2 = st.columns(2)
    for i, (key, (label, weight, desc)) in enumerate(SCORECARD_CRITERIA.items()):
        with cols2[i % 2]:
            ratings2[key] = st.slider(f"{label} (poids {weight})", 1, 5, 3, help=desc, key=f"sc_{key}")

    score = compute_scorecard_score(ratings2)
    st.metric("Score scorecard", f"{score}/100")

# ---------------------------------------------------------------------------
# Onglet 3 : analyse en masse depuis un CSV
# ---------------------------------------------------------------------------
with tab_batch:
    st.caption(
        "Importe un CSV avec au minimum une colonne `product` (et optionnellement `keyword`). "
        "Chaque produit est note avec le scorecard par defaut (note neutre 3/5) + son signal Google Trends."
    )
    import os

    if os.path.exists("sample_products.csv"):
        with open("sample_products.csv", "rb") as f:
            sample_csv_bytes = f.read()
    else:
        sample_csv_bytes = b"product,keyword\n"
    st.download_button("Telecharger un exemple de CSV", data=sample_csv_bytes, file_name="sample_products.csv")
    uploaded = st.file_uploader("Fichier CSV", type=["csv"])
    if uploaded is not None:
        df_in = pd.read_csv(uploaded)
        if "product" not in df_in.columns:
            st.error("Le CSV doit contenir une colonne 'product'.")
        else:
            results = []
            progress = st.progress(0.0)
            for i, row in df_in.iterrows():
                pred = predict_product(
                    product=str(row["product"]),
                    keyword=str(row["keyword"]) if "keyword" in df_in.columns and pd.notna(row.get("keyword")) else None,
                )
                results.append(
                    {
                        "Produit": pred.product,
                        "Score final": pred.final_score,
                        "Classification": pred.classification,
                        "Score Trends": pred.trends_result.score if pred.trends_result else None,
                        "Score Scorecard": pred.scorecard_score,
                    }
                )
                progress.progress((i + 1) / len(df_in))
            results_df = pd.DataFrame(results).sort_values("Score final", ascending=False)
            st.dataframe(results_df, use_container_width=True)
            st.download_button(
                "Telecharger les resultats (CSV)",
                data=results_df.to_csv(index=False).encode("utf-8"),
                file_name="resultats_predictions.csv",
            )

# ---------------------------------------------------------------------------
# Onglet 4 : recherches "en hausse" liees a une niche -> idees de produits
# ---------------------------------------------------------------------------
with tab_rising:
    st.caption(
        "Entre une niche (ex: 'douleur cervicale', 'accessoire cuisine') pour voir les recherches "
        "associees qui montent en ce moment en France — souvent les futurs produits gagnants, "
        "avant meme qu'ils soient recherches en masse."
    )
    niche = st.text_input("Niche / mot-cle large", placeholder="ex: douleur cervicale")
    if st.button("Chercher les tendances emergentes", disabled=not niche):
        with st.spinner("Recherche en cours..."):
            try:
                rising = get_rising_related_queries(niche)
            except TrendsUnavailableError as exc:
                st.warning(f"Google Trends indisponible : {exc}")
                rising = None
        if rising is not None:
            if rising.empty:
                st.info("Aucune recherche en hausse detectee pour cette niche actuellement.")
            else:
                st.dataframe(rising.rename(columns={"query": "Recherche associee", "value": "Croissance (%)"}), use_container_width=True)
