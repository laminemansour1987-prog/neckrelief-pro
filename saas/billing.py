"""Integration Stripe : abonnement recurrent, portail de gestion, webhooks.

Necessite un compte Stripe (https://dashboard.stripe.com) avec :
- un produit "Predicteur de produits gagnants" avec un ou deux prix
  recurrents (mensuel/annuel) -> copier leurs Price ID.
- une cle secrete API -> STRIPE_SECRET_KEY.
- un endpoint de webhook pointant vers `webhook_server.py` (voir README) ->
  STRIPE_WEBHOOK_SECRET.

Rien de tout cela n'est cree automatiquement : c'est une decision commerciale
(compte Stripe = identite legale/bancaire du vendeur) qui doit etre faite par
le proprietaire du service, pas par cet outil.
"""

from __future__ import annotations

import os

import stripe


def is_configured() -> bool:
    return bool(os.environ.get("STRIPE_SECRET_KEY"))


def _client() -> stripe:
    stripe.api_key = os.environ["STRIPE_SECRET_KEY"]
    return stripe


def available_plans() -> dict[str, str]:
    """Retourne {plan: price_id} pour les plans configures via variables
    d'environnement (STRIPE_PRICE_ID_MONTHLY / STRIPE_PRICE_ID_YEARLY)."""
    plans = {}
    if os.environ.get("STRIPE_PRICE_ID_MONTHLY"):
        plans["monthly"] = os.environ["STRIPE_PRICE_ID_MONTHLY"]
    if os.environ.get("STRIPE_PRICE_ID_YEARLY"):
        plans["yearly"] = os.environ["STRIPE_PRICE_ID_YEARLY"]
    return plans


def create_checkout_session(email: str, price_id: str, success_url: str, cancel_url: str):
    client = _client()
    return client.checkout.Session.create(
        mode="subscription",
        customer_email=email,
        client_reference_id=email,
        line_items=[{"price": price_id, "quantity": 1}],
        success_url=success_url,
        cancel_url=cancel_url,
        allow_promotion_codes=True,
    )


def create_billing_portal_session(customer_id: str, return_url: str):
    client = _client()
    return client.billing_portal.Session.create(customer=customer_id, return_url=return_url)


def construct_webhook_event(payload: bytes, sig_header: str, webhook_secret: str):
    return stripe.Webhook.construct_event(payload, sig_header, webhook_secret)
