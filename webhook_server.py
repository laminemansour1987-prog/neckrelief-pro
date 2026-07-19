"""Serveur de webhook Stripe : synchronise le statut d'abonnement des clients.

A lancer en plus du dashboard Streamlit, sur un serveur accessible depuis
Internet (Stripe doit pouvoir l'appeler) :

    uvicorn webhook_server:app --host 0.0.0.0 --port 8000

Puis, dans le dashboard Stripe, configurer un endpoint de webhook vers
`https://ton-domaine/stripe/webhook` ecoutant au minimum :
    - checkout.session.completed
    - customer.subscription.updated
    - customer.subscription.deleted

Copier le "Signing secret" affiche par Stripe dans STRIPE_WEBHOOK_SECRET.

En local, Stripe fournit le CLI `stripe listen --forward-to localhost:8000/stripe/webhook`
pour tester sans exposer de serveur public.
"""

from __future__ import annotations

import logging
import os

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, Request

from saas import billing, db

load_dotenv()

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("stripe-webhook")

app = FastAPI(title="neckrelief-pro — webhooks Stripe")


@app.get("/")
def health() -> dict:
    return {"status": "ok", "stripe_configured": billing.is_configured()}


@app.post("/stripe/webhook")
async def stripe_webhook(request: Request) -> dict:
    webhook_secret = os.environ.get("STRIPE_WEBHOOK_SECRET")
    if not billing.is_configured() or not webhook_secret:
        raise HTTPException(status_code=500, detail="Stripe n'est pas configure sur ce serveur (cles manquantes).")

    payload = await request.body()
    sig_header = request.headers.get("stripe-signature", "")

    try:
        event = billing.construct_webhook_event(payload, sig_header, webhook_secret)
    except Exception as exc:
        logger.warning("Signature webhook invalide : %s", exc)
        raise HTTPException(status_code=400, detail="Signature invalide.") from exc

    etype = event["type"]
    obj = event["data"]["object"]
    logger.info("Evenement Stripe recu : %s", etype)

    if etype == "checkout.session.completed":
        email = obj.get("client_reference_id") or (obj.get("customer_details") or {}).get("email")
        customer_id = obj.get("customer")
        subscription_id = obj.get("subscription")
        if email and customer_id:
            db.link_stripe_customer(email, customer_id, subscription_id)
            db.set_subscription_status(email, "active")
            logger.info("Abonnement active pour %s", email)
        else:
            logger.warning("checkout.session.completed sans email/customer exploitable : %s", obj)

    elif etype in ("customer.subscription.updated", "customer.subscription.created"):
        customer_id = obj.get("customer")
        status = obj.get("status", "active")
        subscription_id = obj.get("id")
        if customer_id:
            db.set_subscription_status_by_customer(customer_id, status, subscription_id)
            logger.info("Abonnement %s -> statut %s", customer_id, status)

    elif etype == "customer.subscription.deleted":
        customer_id = obj.get("customer")
        if customer_id:
            db.set_subscription_status_by_customer(customer_id, "canceled")
            logger.info("Abonnement annule pour customer %s", customer_id)

    return {"received": True}
