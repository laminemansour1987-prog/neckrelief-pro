"""Composants Streamlit : connexion, inscription, ecran d'abonnement."""

from __future__ import annotations

import os

import streamlit as st

from . import billing, db

_SESSION_KEY = "user_email"
PRICE_LABEL = "19€/mois"
GUARANTEE_LABEL = "Satisfait ou rembourse sous 7 jours"


def _owner_contact_email() -> str:
    return os.environ.get("OWNER_CONTACT_EMAIL", "laminemansour1987@gmail.com")


def current_user() -> dict | None:
    email = st.session_state.get(_SESSION_KEY)
    if not email:
        return None
    user = db.get_user_by_email(email)
    if not user:
        del st.session_state[_SESSION_KEY]
        return None
    return user


def logout() -> None:
    st.session_state.pop(_SESSION_KEY, None)


def _asset_path(filename: str) -> str:
    return os.path.join(os.path.dirname(__file__), "..", "assets", filename)


def _render_landing_pitch() -> None:
    st.title("🔮 Sais quel produit va faire fureur — avant tout le monde")
    st.markdown(
        "Chaque semaine, des produits explosent sur TikTok et en pub Meta. "
        "La plupart des vendeurs les decouvrent **quand c'est deja sature**. "
        "Cet outil repere le signal de recherche qui monte, souvent des semaines "
        "avant l'explosion — pour que tu sois le premier a le vendre, pas le dernier. "
        "France, Belgique, Etats-Unis, Allemagne... choisis ton marche cible, l'outil s'adapte."
    )
    st.markdown(f"### 💶 {PRICE_LABEL} — {db.TRIAL_DAYS} jours d'essai gratuit avant le premier paiement")

    c1, c2, c3 = st.columns(3)
    with c1:
        st.markdown("**📈 Google Trends, marche par marche**")
        st.caption("Detecte l'acceleration des recherches avant la saturation, sur le pays de ton choix.")
    with c2:
        st.markdown("**🌍 Signal international**")
        st.caption("Un produit qui explose dans un pays arrive souvent ailleurs 4 a 12 semaines plus tard.")
    with c3:
        st.markdown("**📝 Scorecard produit gagnant**")
        st.caption("Marge, effet wahou, logistique... note n'importe quel produit en 1 minute.")

    if os.path.exists(_asset_path("apercu_resultat.png")):
        st.image(_asset_path("apercu_resultat.png"), caption="Exemple d'analyse produit dans le dashboard")

    st.success(
        f"🎁 {db.TRIAL_DAYS} jours d'essai gratuit, sans carte bancaire, puis {PRICE_LABEL}. "
        "Cree ton compte en bas de page."
    )

    tc1, tc2, tc3, tc4 = st.columns(4)
    with tc1:
        st.caption("🔒 Connexion securisee (HTTPS)")
    with tc2:
        st.caption("🔐 Mot de passe chiffre, jamais en clair")
    with tc3:
        st.caption(f"💸 {GUARANTEE_LABEL}")
    with tc4:
        st.caption(f"✉️ Contact direct : {_owner_contact_email()}")

    with st.expander("🛡️ Confidentialite, securite et remboursement"):
        st.markdown(
            f"""
- **Mots de passe** : jamais stockes en clair, chiffres avec bcrypt (standard de l'industrie).
- **Connexion** : toutes les pages passent par HTTPS (chiffrement du trafic).
- **Donnees bancaires** : cet outil ne collecte ni ne stocke aucune coordonnee bancaire. Le paiement se convient directement avec toi par email.
- **Tes analyses** : privees, visibles uniquement par ton compte.
- **Garantie** : {GUARANTEE_LABEL.lower()} apres le premier paiement — ecris simplement a {_owner_contact_email()}.
- **Essai gratuit** : {db.TRIAL_DAYS} jours, aucune carte bancaire requise, tu peux arreter a tout moment sans rien payer.
            """
        )
    st.divider()


def render_login_gate() -> dict | None:
    """Affiche connexion/inscription si necessaire. Retourne l'utilisateur
    connecte, ou None (dans ce cas l'appelant doit stopper le rendu)."""
    user = current_user()
    if user:
        return user

    _render_landing_pitch()

    tab_login, tab_signup = st.tabs(["Connexion", "Creer un compte"])

    with tab_login:
        with st.form("login_form"):
            email = st.text_input("Email")
            password = st.text_input("Mot de passe", type="password")
            submitted = st.form_submit_button("Se connecter", type="primary")
        if submitted:
            logged_in = db.verify_login(email, password)
            if logged_in:
                st.session_state[_SESSION_KEY] = logged_in["email"]
                st.rerun()
            else:
                st.error("Email ou mot de passe incorrect.")

    with tab_signup:
        with st.form("signup_form"):
            email2 = st.text_input("Email", key="signup_email")
            password2 = st.text_input("Mot de passe (8 caracteres min.)", type="password", key="signup_pw")
            password2b = st.text_input("Confirmer le mot de passe", type="password", key="signup_pw2")
            submitted2 = st.form_submit_button(f"Creer mon compte ({db.TRIAL_DAYS} jours gratuits)", type="primary")
        if submitted2:
            if not email2 or "@" not in email2:
                st.error("Email invalide.")
            elif len(password2) < 8:
                st.error("Le mot de passe doit faire au moins 8 caracteres.")
            elif password2 != password2b:
                st.error("Les mots de passe ne correspondent pas.")
            elif db.get_user_by_email(email2):
                st.error("Un compte existe deja avec cet email. Connecte-toi plutot.")
            else:
                db.create_user(email2, password2)
                st.session_state[_SESSION_KEY] = email2.strip().lower()
                st.success(f"Compte cree ! {db.TRIAL_DAYS} jours d'essai gratuit.")
                st.rerun()

    return None


def render_subscribe_gate(user: dict) -> None:
    """Affiche l'ecran de blocage + bouton d'abonnement Stripe. Doit etre
    suivi de `st.stop()` par l'appelant."""
    st.title("🔒 Abonnement requis")
    st.write(
        f"Bonjour **{user['email']}**. "
        + ("Ta periode d'essai est terminee." if user["subscription_status"] == "trialing" else "Ton abonnement n'est plus actif.")
    )

    if not billing.is_configured():
        owner_email = _owner_contact_email()
        st.info(
            f"💶 Abonnement : **{PRICE_LABEL}** · 🛡️ {GUARANTEE_LABEL}\n\n"
            f"Pour continuer, contacte-moi a **{owner_email}** pour convenir du paiement "
            "(virement, PayPal, Lydia...). Ton acces sera active des reception. "
            "Aucune coordonnee bancaire n'est demandee ici."
        )
        st.link_button("✉️ Envoyer un email", f"mailto:{owner_email}?subject=Abonnement%20Predicteur%20de%20produits%20gagnants")
        return

    plans = billing.available_plans()
    if not plans:
        st.warning("Aucun plan d'abonnement configure (STRIPE_PRICE_ID_MONTHLY / STRIPE_PRICE_ID_YEARLY).")
        return

    base_url = os.environ.get("APP_BASE_URL", "http://localhost:8501")
    plan_labels = {"monthly": "Mensuel", "yearly": "Annuel (2 mois offerts)"}
    choice = st.radio("Choisis ta formule", list(plans.keys()), format_func=lambda p: plan_labels.get(p, p))

    if st.button("S'abonner via Stripe", type="primary"):
        session = billing.create_checkout_session(
            email=user["email"],
            price_id=plans[choice],
            success_url=f"{base_url}?checkout=success",
            cancel_url=f"{base_url}?checkout=cancel",
        )
        st.link_button("Continuer vers le paiement securise (Stripe) →", session.url, type="primary")
        st.caption("Une fois le paiement effectue, reviens sur cette page et rafraichis-la.")


def render_account_sidebar(user: dict) -> None:
    with st.sidebar:
        st.markdown(f"**Connecte :** {user['email']}")
        if user["subscription_status"] == "trialing":
            st.caption(f"Essai gratuit : {db.trial_days_left(user)} jour(s) restant(s)")
        elif user["subscription_status"] == "active":
            st.caption(f"Abonnement actif ({user.get('plan') or 'en cours'})")
        else:
            st.caption(f"Statut : {user['subscription_status']}")

        if user.get("stripe_customer_id") and billing.is_configured():
            base_url = os.environ.get("APP_BASE_URL", "http://localhost:8501")
            try:
                portal = billing.create_billing_portal_session(user["stripe_customer_id"], return_url=base_url)
                st.link_button("Gerer mon abonnement", portal.url)
            except Exception:
                pass

        if st.button("Se deconnecter"):
            logout()
            st.rerun()
