"""Panneau d'administration : gerer les clients directement depuis le
dashboard, sans terminal (equivalent web de manage_clients.py)."""

from __future__ import annotations

import pandas as pd
import streamlit as st

from . import db


def render_admin_panel() -> None:
    st.subheader("👑 Panneau d'administration")
    st.caption("Visible uniquement par toi. Active/desactive l'acces d'un client apres paiement.")

    users = db.list_users()
    if not users:
        st.info("Aucun client inscrit pour l'instant.")
        return

    rows = []
    for u in users:
        statut = u["subscription_status"]
        if statut == "trialing":
            statut = f"essai ({db.trial_days_left(u)}j restants)"
        rows.append(
            {
                "Email": u["email"],
                "Statut": statut,
                "Plan": u["plan"] or "-",
                "Inscrit le": u["created_at"],
                "Fin d'essai": u["trial_end"],
            }
        )
    st.dataframe(pd.DataFrame(rows), use_container_width=True, hide_index=True)

    st.divider()
    st.markdown("**Gerer un client**")

    emails = [u["email"] for u in users]
    selected_email = st.selectbox("Client", emails, key="admin_selected_client")
    selected = db.get_user_by_email(selected_email)

    if selected:
        c1, c2 = st.columns(2)
        with c1:
            st.write(f"Statut actuel : **{selected['subscription_status']}**")
            st.write(f"Plan : **{selected['plan'] or '-'}**")
        with c2:
            if selected["subscription_status"] == "trialing":
                st.write(f"Essai : **{db.trial_days_left(selected)} jour(s) restant(s)**")

        col_activer, col_desactiver, col_prolonger = st.columns(3)
        with col_activer:
            plan_choice = st.selectbox("Plan a activer", ["mensuel", "annuel", "manuel"], key="admin_plan_choice")
            if st.button("✅ Activer l'acces", type="primary", key="admin_activate"):
                db.set_manual_subscription(selected_email, plan=plan_choice, active=True)
                st.success(f"Acces active pour {selected_email}.")
                st.rerun()
        with col_desactiver:
            if st.button("⛔ Desactiver l'acces", key="admin_deactivate"):
                db.set_manual_subscription(selected_email, plan=selected["plan"] or "manuel", active=False)
                st.success(f"Acces desactive pour {selected_email}.")
                st.rerun()
        with col_prolonger:
            jours = st.number_input("Jours a ajouter", min_value=1, max_value=365, value=7, key="admin_extend_days")
            if st.button("🎁 Prolonger l'essai", key="admin_extend"):
                db.extend_trial(selected_email, int(jours))
                st.success(f"Essai de {selected_email} prolonge de {jours} jour(s).")
                st.rerun()

        with st.expander("⚠️ Supprimer ce compte"):
            st.caption("Irreversible : supprime le compte client (pas son historique d'analyses).")
            confirm = st.checkbox(f"Je confirme vouloir supprimer {selected_email}", key="admin_delete_confirm")
            if st.button("🗑️ Supprimer definitivement", disabled=not confirm, key="admin_delete"):
                db.delete_user(selected_email)
                st.success(f"Compte {selected_email} supprime.")
                st.rerun()
