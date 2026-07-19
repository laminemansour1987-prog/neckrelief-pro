"""Dashboard : predire quel produit va faire fureur, marche par marche.

Lancer avec :  streamlit run app.py
"""

from __future__ import annotations

import os

import pandas as pd
import plotly.graph_objects as go
import streamlit as st
from dotenv import load_dotenv

from saas import admin_ui, auth_ui, db as user_db
from trend_predictor import (
    MARKET_LABELS,
    SCORECARD_CRITERIA,
    ai_insights,
    compute_scorecard_score,
    default_lead_geos_for,
    get_multi_geo_interest,
    get_rising_related_queries,
    predict_product,
    watchlist,
)
from trend_predictor.google_trends import TrendsUnavailableError

load_dotenv()

st.set_page_config(page_title="Predicteur de produits gagnants", page_icon="🔮", layout="wide")

st.markdown(
    """
    <style>
    @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@500;700;800&family=Inter:wght@400;500;600&display=swap');

    html, body, [class*="css"], .stApp, p, span, div, label, input, textarea {
        font-family: 'Inter', -apple-system, sans-serif;
    }
    h1, h2, h3, .hero-band h1, .hero-band p {
        font-family: 'Manrope', -apple-system, sans-serif !important;
    }

    #MainMenu {visibility: hidden;}
    footer {visibility: hidden;}
    div[data-testid="stDecoration"] {display: none;}

    .hero-band {
        background: linear-gradient(135deg, #6d28d9 0%, #9333ea 45%, #f43f5e 100%);
        border-radius: 24px;
        padding: 44px 40px;
        margin-bottom: 28px;
        box-shadow: 0 24px 60px rgba(109,40,217,0.28);
    }
    .hero-band h1 {
        color: #ffffff !important;
        font-weight: 800 !important;
        font-size: 2.5rem;
        line-height: 1.15;
        letter-spacing: -0.02em;
        margin: 0 0 14px 0 !important;
    }
    .hero-band p {
        color: rgba(255,255,255,0.94) !important;
        font-size: 1.05rem;
        line-height: 1.55;
        margin: 0 !important;
        max-width: 760px;
    }

    h1, h2, h3 {
        font-weight: 800 !important;
        letter-spacing: -0.02em;
    }

    .stButton > button, .stLinkButton > a, .stDownloadButton > button {
        border-radius: 10px;
        font-weight: 600;
        font-family: 'Inter', sans-serif;
        transition: transform 0.12s ease, box-shadow 0.12s ease;
    }
    .stButton > button[kind="primary"] {
        background: linear-gradient(135deg, #7c3aed, #f43f5e);
        border: none;
        box-shadow: 0 6px 16px rgba(124,58,237,0.35);
    }
    .stButton > button[kind="primary"]:hover {
        transform: translateY(-1px);
        box-shadow: 0 10px 24px rgba(124,58,237,0.45);
    }

    div[data-testid="stMetric"] {
        background: #f5f3ff;
        border: 1px solid #ede9fe;
        border-radius: 14px;
        padding: 14px 18px;
    }
    .stTabs [data-baseweb="tab-list"] { gap: 4px; }
    .stTabs [data-baseweb="tab"] {
        border-radius: 10px 10px 0 0;
        padding: 10px 16px;
        font-weight: 600;
    }
    </style>
    """,
    unsafe_allow_html=True,
)

user = auth_ui.render_login_gate()
if user is None:
    st.stop()

if not user_db.has_access(user):
    auth_ui.render_subscribe_gate(user)
    st.stop()

auth_ui.render_account_sidebar(user)
OWNER = user["email"]

st.markdown(
    """
    <div class="hero-band" style="padding: 26px 32px;">
        <h1 style="font-size: 1.7rem !important; margin-bottom: 4px !important;">
            🔮 Ne rate plus jamais le prochain produit qui explose
        </h1>
        <p>Tape un produit, choisis un marche, et vois s'il vaut le coup — en 30 secondes.</p>
    </div>
    """,
    unsafe_allow_html=True,
)
if user_db.is_admin(OWNER) and not ai_insights.is_available():
    st.caption(
        "💡 Astuce (visible admin uniquement) : definis la variable d'environnement "
        "`ANTHROPIC_API_KEY` pour activer l'analyse qualitative par IA pour tous les clients."
    )

tab_labels = [
    "📈 Analyse d'un produit",
    "📝 Scorecard seul",
    "📂 Analyse en masse (CSV)",
    "📡 Radar d'opportunites",
    "🕓 Historique",
]
if user_db.is_admin(OWNER):
    tab_labels.append("👑 Admin")

_tabs = st.tabs(tab_labels)
tab_single, tab_scorecard, tab_batch, tab_radar, tab_history = _tabs[:5]
tab_admin = _tabs[5] if user_db.is_admin(OWNER) else None

# ---------------------------------------------------------------------------
# Onglet 1 : analyse complete d'un produit (trends FR + international + scorecard)
# ---------------------------------------------------------------------------
with tab_single:
    st.caption("Tape un produit, choisis ton marche, clique sur Analyser. C'est tout.")
    col_a, col_b = st.columns([3, 1])
    with col_a:
        product_name = st.text_input("Nom du produit", placeholder="ex: coussin cervical chauffant")
    with col_b:
        market = st.selectbox(
            "Marche cible",
            list(MARKET_LABELS.keys()),
            format_func=lambda code: MARKET_LABELS.get(code, code),
            key="single_market",
        )

    ratings: dict[str, int] = {key: 3 for key in SCORECARD_CRITERIA}
    keyword = ""
    trends_weight, scorecard_weight, lead_weight = 0.4, 0.35, 0.25
    include_international = True
    include_ai = ai_insights.is_available()

    with st.expander("⚙️ Options avancees (facultatif)"):
        keyword = st.text_input(
            "Mot-cle Google Trends (si different du nom du produit)",
            placeholder="ex: coussin cervical",
        )
        lead_geos_input = st.text_input(
            "Pays de comparaison (code ISO-2, separes par des virgules)",
            value=", ".join(default_lead_geos_for(market)),
            help="Pays souvent en avance sur le marche cible pour les tendances produit.",
        )
        st.markdown("**Poids de la note finale**")
        trends_weight = st.slider("Poids Google Trends (marche cible)", 0.0, 1.0, trends_weight, 0.05)
        scorecard_weight = st.slider("Poids Scorecard", 0.0, 1.0, scorecard_weight, 0.05)
        lead_weight = st.slider("Poids Signal international", 0.0, 1.0, lead_weight, 0.05)
        include_international = st.checkbox("Inclure le signal international", value=include_international)
        include_ai = st.checkbox("Generer une analyse IA (Claude)", value=include_ai)

        st.markdown("**Ton avis sur le produit (facultatif)**")
        st.caption("Note chaque critere de 1 (faible) a 5 (excellent). Sans reponse, une note neutre est utilisee.")
        cols = st.columns(2)
        for i, (key, (label, weight, desc)) in enumerate(SCORECARD_CRITERIA.items()):
            with cols[i % 2]:
                ratings[key] = st.slider(f"{label} (poids {weight})", 1, 5, 3, help=desc, key=f"single_{key}")

    if st.button("🔮 Analyser", type="primary", disabled=not product_name):
        lead_geos = tuple(g.strip().upper() for g in lead_geos_input.split(",") if g.strip())
        with st.spinner("Analyse en cours (plusieurs requetes Google Trends, ca peut prendre un moment)..."):
            prediction = predict_product(
                product=product_name,
                ratings=ratings,
                keyword=keyword or None,
                geo=market,
                lead_geos=lead_geos,
                trends_weight=trends_weight,
                scorecard_weight=scorecard_weight,
                lead_weight=lead_weight,
                include_international=include_international,
                include_ai=include_ai,
            )
            watchlist.save_analysis(
                product=prediction.product,
                keyword=keyword or None,
                final_score=prediction.final_score,
                trends_score=prediction.trends_result.score if prediction.trends_result else None,
                scorecard_score=prediction.scorecard_score,
                lead_score=prediction.lead_result.score if prediction.lead_result else None,
                owner=OWNER,
            )

        st.metric("Score final de potentiel", f"{prediction.final_score}/100")
        st.markdown(f"### {prediction.classification}")

        c1, c2, c3 = st.columns(3)
        with c1:
            st.markdown("**Scorecard**")
            st.write(f"{prediction.scorecard_score}/100" if prediction.scorecard_score is not None else "—")
        with c2:
            st.markdown(f"**Google Trends {MARKET_LABELS.get(market, market)}**")
            if prediction.trends_result:
                tr = prediction.trends_result
                st.write(f"{tr.score}/100")
                st.caption(
                    f"{tr.label} · Niveau actuel {tr.current_level}/100"
                    + (f" · Croissance {tr.growth_pct}%" if tr.growth_pct is not None else "")
                )
                if prediction.forecast:
                    st.caption(f"📅 {prediction.forecast.label} (confiance {prediction.forecast.confidence})")
            elif prediction.trends_error:
                st.warning("Donnees de recherche indisponibles pour le moment. Reessaie dans quelques minutes.")
                if user_db.is_admin(OWNER):
                    with st.expander("Detail technique (admin)"):
                        st.code(prediction.trends_error)
        with c3:
            st.markdown("**Signal international**")
            if prediction.lead_result:
                ld = prediction.lead_result
                st.write(f"{ld.score}/100")
                st.caption(ld.label)
            elif prediction.lead_error:
                st.warning("Signal international indisponible pour le moment.")
                if user_db.is_admin(OWNER):
                    with st.expander("Detail technique (admin)"):
                        st.code(prediction.lead_error)

        for note in prediction.notes:
            st.info(note)

        if prediction.ai_insight:
            st.markdown("**🤖 Analyse IA**")
            st.write(prediction.ai_insight)

        # graphique : marche cible vs pays de comparaison
        try:
            multi_df, geo_errors = get_multi_geo_interest(keyword or product_name, geos=(market,) + lead_geos)
            fig = go.Figure()
            for geo in multi_df.columns:
                fig.add_trace(go.Scatter(x=multi_df.index, y=multi_df[geo], mode="lines", name=geo))
            fig.update_layout(
                title=f"Interet de recherche — {MARKET_LABELS.get(market, market)} vs. pays de comparaison (12 derniers mois)",
                yaxis_title="Interet relatif (0-100)",
                xaxis_title="Date",
                height=380,
            )
            st.plotly_chart(fig, use_container_width=True)
            if geo_errors:
                st.caption("Pays sans donnees : " + ", ".join(sorted(geo_errors)))
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
        "Chaque produit est note avec le scorecard neutre par defaut + son signal Google Trends."
    )
    batch_market = st.selectbox(
        "Marche cible",
        list(MARKET_LABELS.keys()),
        format_func=lambda code: MARKET_LABELS.get(code, code),
        key="batch_market",
    )
    batch_international = st.checkbox(
        "Inclure le signal international par produit (plus lent : plusieurs requetes/produit)",
        value=False,
        key="batch_intl",
    )

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
                kw = str(row["keyword"]) if "keyword" in df_in.columns and pd.notna(row.get("keyword")) else None
                pred = predict_product(
                    product=str(row["product"]),
                    keyword=kw,
                    geo=batch_market,
                    lead_geos=default_lead_geos_for(batch_market),
                    include_international=batch_international,
                )
                watchlist.save_analysis(
                    product=pred.product,
                    keyword=kw,
                    final_score=pred.final_score,
                    trends_score=pred.trends_result.score if pred.trends_result else None,
                    scorecard_score=pred.scorecard_score,
                    lead_score=pred.lead_result.score if pred.lead_result else None,
                    owner=OWNER,
                )
                results.append(
                    {
                        "Produit": pred.product,
                        "Score final": pred.final_score,
                        "Classification": pred.classification,
                        "Score Trends": pred.trends_result.score if pred.trends_result else None,
                        "Score International": pred.lead_result.score if pred.lead_result else None,
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
# Onglet 4 : radar d'opportunites — recherches "en hausse" sur plusieurs
# niches (et eventuellement plusieurs pays) pour decouvrir des idees de
# produits avant qu'ils soient recherches en masse en France.
# ---------------------------------------------------------------------------
with tab_radar:
    st.caption(
        "Entre une ou plusieurs niches (une par ligne, ex. 'douleur cervicale', 'accessoire cuisine') "
        "pour voir les recherches associees qui montent en ce moment — souvent les futurs produits "
        "gagnants, avant meme qu'ils soient recherches en masse en France."
    )
    niches_text = st.text_area("Niches (une par ligne)", placeholder="douleur cervicale\naccessoire cuisine\nfitness maison")
    radar_geos_input = st.text_input(
        "Pays a interroger (code ISO-2, separes par des virgules)",
        value="FR, US",
        key="radar_geos",
    )

    def _sort_value(v) -> float:
        if isinstance(v, str) and "breakout" in v.lower():
            return 1_000_000.0
        try:
            return float(v)
        except (TypeError, ValueError):
            return 0.0

    if st.button("Lancer le radar", disabled=not niches_text.strip()):
        niches = [n.strip() for n in niches_text.splitlines() if n.strip()]
        radar_geos = [g.strip().upper() for g in radar_geos_input.split(",") if g.strip()]
        all_rows = []
        progress = st.progress(0.0)
        total = len(niches) * len(radar_geos)
        done = 0
        for niche in niches:
            for geo in radar_geos:
                try:
                    rising = get_rising_related_queries(niche, geo=geo)
                except TrendsUnavailableError:
                    rising = pd.DataFrame(columns=["query", "value"])
                for _, r in rising.iterrows():
                    all_rows.append({"Niche": niche, "Pays": geo, "Recherche associee": r["query"], "Croissance": r["value"]})
                done += 1
                progress.progress(done / max(total, 1))

        if not all_rows:
            st.info("Aucune recherche en hausse detectee (ou Google Trends indisponible pour ces niches/pays).")
        else:
            radar_df = pd.DataFrame(all_rows)
            radar_df["_sort"] = radar_df["Croissance"].apply(_sort_value)
            radar_df = radar_df.sort_values("_sort", ascending=False).drop(columns="_sort")
            st.dataframe(radar_df, use_container_width=True)
            st.download_button(
                "Telecharger le radar (CSV)",
                data=radar_df.to_csv(index=False).encode("utf-8"),
                file_name="radar_opportunites.csv",
            )

# ---------------------------------------------------------------------------
# Onglet 5 : historique des analyses (watchlist persistante)
# ---------------------------------------------------------------------------
with tab_history:
    st.caption(
        "Chaque analyse (onglet 'Analyse d'un produit' ou 'Analyse en masse') est enregistree ici. "
        "Re-analyse regulierement tes produits candidats pour voir si le score accelere avec le temps — "
        "c'est souvent ce qui confirme un signal avant l'explosion."
    )
    latest = watchlist.list_latest(owner=OWNER)
    if not latest:
        st.info("Aucune analyse enregistree pour l'instant. Lance une analyse dans les autres onglets.")
    else:
        latest_df = pd.DataFrame(
            [dict(r) for r in latest]
        ).rename(
            columns={
                "product": "Produit",
                "timestamp": "Derniere analyse",
                "final_score": "Score final",
                "trends_score": "Score Trends",
                "scorecard_score": "Score Scorecard",
                "lead_score": "Score International",
            }
        )
        st.dataframe(latest_df, use_container_width=True)

        products = watchlist.list_products(owner=OWNER)
        selected = st.selectbox("Voir l'evolution d'un produit", products)
        if selected:
            history = watchlist.get_history(selected, owner=OWNER)
            hist_df = pd.DataFrame([dict(r) for r in history])
            fig = go.Figure()
            fig.add_trace(go.Scatter(x=hist_df["timestamp"], y=hist_df["final_score"], mode="lines+markers", name="Score final"))
            fig.update_layout(
                title=f"Evolution du score — {selected}",
                yaxis_title="Score /100",
                xaxis_title="Date d'analyse",
                height=350,
            )
            st.plotly_chart(fig, use_container_width=True)

# ---------------------------------------------------------------------------
# Onglet 6 (admin uniquement) : gerer les clients sans terminal
# ---------------------------------------------------------------------------
if tab_admin is not None:
    with tab_admin:
        admin_ui.render_admin_panel()
