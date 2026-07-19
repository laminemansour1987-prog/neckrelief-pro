"""Base des comptes clients : inscription, connexion, statut d'abonnement.

SQLite, aucune dependance externe hormis `bcrypt` pour le hash des mots de
passe. Un compte demarre avec 14 jours d'essai gratuit ; au-dela, il faut un
abonnement Stripe actif (voir `saas.billing` et `webhook_server.py`).
"""

from __future__ import annotations

import datetime
import os
import sqlite3

import bcrypt

TRIAL_DAYS = 14

ACTIVE_STATUSES = {"trialing", "active"}


def _db_path() -> str:
    return os.environ.get("USERS_DB", os.path.join(os.path.dirname(__file__), "..", "users.db"))


def _connect() -> sqlite3.Connection:
    conn = sqlite3.connect(_db_path())
    conn.row_factory = sqlite3.Row
    conn.execute(
        """
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            created_at TEXT NOT NULL,
            trial_end TEXT NOT NULL,
            stripe_customer_id TEXT,
            stripe_subscription_id TEXT,
            subscription_status TEXT NOT NULL DEFAULT 'trialing',
            plan TEXT
        )
        """
    )
    return conn


def _now() -> datetime.datetime:
    return datetime.datetime.utcnow()


def _hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def _check_password(password: str, password_hash: str) -> bool:
    try:
        return bcrypt.checkpw(password.encode("utf-8"), password_hash.encode("utf-8"))
    except ValueError:
        return False


def create_user(email: str, password: str) -> dict:
    email = email.strip().lower()
    trial_end = (_now() + datetime.timedelta(days=TRIAL_DAYS)).isoformat(timespec="seconds")
    conn = _connect()
    with conn:
        conn.execute(
            """
            INSERT INTO users (email, password_hash, created_at, trial_end, subscription_status)
            VALUES (?, ?, ?, ?, 'trialing')
            """,
            (email, _hash_password(password), _now().isoformat(timespec="seconds"), trial_end),
        )
    user = get_user_by_email(email)
    conn.close()
    return user


def get_user_by_email(email: str) -> dict | None:
    conn = _connect()
    row = conn.execute("SELECT * FROM users WHERE email = ?", (email.strip().lower(),)).fetchone()
    conn.close()
    return dict(row) if row else None


def get_user_by_customer_id(customer_id: str) -> dict | None:
    conn = _connect()
    row = conn.execute("SELECT * FROM users WHERE stripe_customer_id = ?", (customer_id,)).fetchone()
    conn.close()
    return dict(row) if row else None


def verify_login(email: str, password: str) -> dict | None:
    user = get_user_by_email(email)
    if not user:
        return None
    if not _check_password(password, user["password_hash"]):
        return None
    return user


def link_stripe_customer(email: str, customer_id: str, subscription_id: str | None, plan: str | None = None) -> None:
    conn = _connect()
    with conn:
        conn.execute(
            "UPDATE users SET stripe_customer_id = ?, stripe_subscription_id = ?, plan = COALESCE(?, plan) WHERE email = ?",
            (customer_id, subscription_id, plan, email.strip().lower()),
        )
    conn.close()


def set_subscription_status(email: str, status: str) -> None:
    conn = _connect()
    with conn:
        conn.execute(
            "UPDATE users SET subscription_status = ? WHERE email = ?",
            (status, email.strip().lower()),
        )
    conn.close()


def set_subscription_status_by_customer(customer_id: str, status: str, subscription_id: str | None = None) -> None:
    conn = _connect()
    with conn:
        if subscription_id:
            conn.execute(
                "UPDATE users SET subscription_status = ?, stripe_subscription_id = ? WHERE stripe_customer_id = ?",
                (status, subscription_id, customer_id),
            )
        else:
            conn.execute(
                "UPDATE users SET subscription_status = ? WHERE stripe_customer_id = ?",
                (status, customer_id),
            )
    conn.close()


def set_manual_subscription(email: str, plan: str = "manuel", active: bool = True) -> None:
    """Active ou desactive l'acces d'un client 'a la main' (paiement recu par
    virement, especes, etc.), sans passer par Stripe."""
    conn = _connect()
    with conn:
        conn.execute(
            "UPDATE users SET subscription_status = ?, plan = ? WHERE email = ?",
            ("active" if active else "canceled", plan, email.strip().lower()),
        )
    conn.close()


def extend_trial(email: str, days: int) -> None:
    conn = _connect()
    with conn:
        conn.execute(
            "UPDATE users SET trial_end = datetime(trial_end, ?) WHERE email = ?",
            (f"+{int(days)} days", email.strip().lower()),
        )
    conn.close()


def trial_days_left(user: dict) -> int:
    trial_end = datetime.datetime.fromisoformat(user["trial_end"])
    delta = trial_end - _now()
    return max(0, delta.days + (1 if delta.seconds > 0 else 0))


def has_access(user: dict) -> bool:
    """True si l'utilisateur peut utiliser l'outil : essai en cours ou
    abonnement Stripe actif."""
    status = user["subscription_status"]
    if status == "active":
        return True
    if status == "trialing":
        return datetime.datetime.fromisoformat(user["trial_end"]) > _now()
    return False


def list_users() -> list[dict]:
    conn = _connect()
    rows = conn.execute("SELECT * FROM users ORDER BY created_at DESC").fetchall()
    conn.close()
    return [dict(r) for r in rows]
