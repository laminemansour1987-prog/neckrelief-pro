#!/usr/bin/env python3
"""Gerer l'acces de tes clients A LA MAIN, sans rien configurer (pas de Stripe requis).

Un client cree son compte lui-meme sur le dashboard (3 jours d'essai
gratuit). Quand il te paie (virement, especes, autre moyen), tu lui donnes
l'acces avec une seule commande :

    python manage_clients.py list
    python manage_clients.py activer client@example.com
    python manage_clients.py activer client@example.com --plan annuel
    python manage_clients.py desactiver client@example.com
    python manage_clients.py prolonger client@example.com --jours 30

(Le systeme Stripe reste disponible en plus si tu veux automatiser les
paiements plus tard — voir README.md — mais rien de tout ca n'est
obligatoire pour commencer a vendre l'acces des aujourd'hui.)
"""

from __future__ import annotations

import argparse
import sys

from saas import db


def cmd_list(_args) -> int:
    users = db.list_users()
    if not users:
        print("Aucun client inscrit pour l'instant.")
        return 0
    print(f"{'Email':<35} {'Statut':<12} {'Plan':<10} {'Inscrit le':<20}")
    print("-" * 80)
    for u in users:
        statut = u["subscription_status"]
        if statut == "trialing":
            statut = f"essai ({db.trial_days_left(u)}j restants)"
        print(f"{u['email']:<35} {statut:<12} {u['plan'] or '-':<10} {u['created_at']:<20}")
    return 0


def cmd_activer(args) -> int:
    user = db.get_user_by_email(args.email)
    if not user:
        print(f"Aucun client trouve avec l'email '{args.email}'.", file=sys.stderr)
        return 1
    db.set_manual_subscription(args.email, plan=args.plan, active=True)
    print(f"Acces active pour {args.email} (plan: {args.plan}).")
    return 0


def cmd_desactiver(args) -> int:
    user = db.get_user_by_email(args.email)
    if not user:
        print(f"Aucun client trouve avec l'email '{args.email}'.", file=sys.stderr)
        return 1
    db.set_manual_subscription(args.email, plan=user["plan"] or "manuel", active=False)
    print(f"Acces desactive pour {args.email}.")
    return 0


def cmd_prolonger(args) -> int:
    user = db.get_user_by_email(args.email)
    if not user:
        print(f"Aucun client trouve avec l'email '{args.email}'.", file=sys.stderr)
        return 1
    db.extend_trial(args.email, args.jours)
    updated = db.get_user_by_email(args.email)
    print(f"Essai de {args.email} prolonge de {args.jours} jours (nouvelle fin : {updated['trial_end']}).")
    return 0


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    sub = parser.add_subparsers(dest="command", required=True)

    sub.add_parser("list", help="Liste tous les clients et leur statut").set_defaults(func=cmd_list)

    p_act = sub.add_parser("activer", help="Active l'acces d'un client (apres paiement)")
    p_act.add_argument("email")
    p_act.add_argument("--plan", default="manuel", help="Libelle libre du plan (ex: mensuel, annuel)")
    p_act.set_defaults(func=cmd_activer)

    p_deact = sub.add_parser("desactiver", help="Coupe l'acces d'un client")
    p_deact.add_argument("email")
    p_deact.set_defaults(func=cmd_desactiver)

    p_ext = sub.add_parser("prolonger", help="Prolonge l'essai gratuit d'un client")
    p_ext.add_argument("email")
    p_ext.add_argument("--jours", type=int, default=14)
    p_ext.set_defaults(func=cmd_prolonger)

    args = parser.parse_args()
    return args.func(args)


if __name__ == "__main__":
    raise SystemExit(main())
