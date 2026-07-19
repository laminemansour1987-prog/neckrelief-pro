"""Historique persistant des analyses (SQLite, aucune dependance externe).

Permet de re-analyser regulierement les memes produits et de voir si le
score de potentiel accelere dans le temps (le vrai signal "avant que ca
explose" se voit souvent sur plusieurs semaines, pas en un seul passage).

`owner` scope l'historique par client (son email) dans le dashboard SaaS
multi-comptes ; laisse a None pour un usage local/CLI non scope.
"""

from __future__ import annotations

import datetime
import json
import os
import sqlite3

_DEFAULT_DB_PATH = os.path.join(os.path.dirname(__file__), "..", "watchlist.db")
_UNSCOPED_OWNER = "_local"


def _db_path() -> str:
    return os.environ.get("TREND_PREDICTOR_DB", _DEFAULT_DB_PATH)


def _connect() -> sqlite3.Connection:
    conn = sqlite3.connect(_db_path())
    conn.execute(
        """
        CREATE TABLE IF NOT EXISTS analyses (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            owner TEXT NOT NULL DEFAULT '_local',
            product TEXT NOT NULL,
            keyword TEXT,
            timestamp TEXT NOT NULL,
            final_score INTEGER,
            trends_score INTEGER,
            scorecard_score INTEGER,
            lead_score INTEGER,
            details TEXT
        )
        """
    )
    return conn


def save_analysis(
    product: str,
    keyword: str | None,
    final_score: int,
    trends_score: int | None = None,
    scorecard_score: int | None = None,
    lead_score: int | None = None,
    details: dict | None = None,
    owner: str | None = None,
) -> None:
    conn = _connect()
    with conn:
        conn.execute(
            """
            INSERT INTO analyses
                (owner, product, keyword, timestamp, final_score, trends_score, scorecard_score, lead_score, details)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                owner or _UNSCOPED_OWNER,
                product,
                keyword,
                datetime.datetime.utcnow().isoformat(timespec="seconds"),
                final_score,
                trends_score,
                scorecard_score,
                lead_score,
                json.dumps(details or {}, ensure_ascii=False),
            ),
        )
    conn.close()


def get_history(product: str, owner: str | None = None) -> list[sqlite3.Row]:
    conn = _connect()
    conn.row_factory = sqlite3.Row
    rows = conn.execute(
        """
        SELECT timestamp, final_score, trends_score, scorecard_score, lead_score
        FROM analyses WHERE product = ? AND owner = ? ORDER BY id
        """,
        (product, owner or _UNSCOPED_OWNER),
    ).fetchall()
    conn.close()
    return rows


def list_products(owner: str | None = None) -> list[str]:
    conn = _connect()
    rows = conn.execute(
        "SELECT DISTINCT product FROM analyses WHERE owner = ? ORDER BY product",
        (owner or _UNSCOPED_OWNER,),
    ).fetchall()
    conn.close()
    return [r[0] for r in rows]


def list_latest(owner: str | None = None):
    """Derniere analyse connue pour chaque produit d'un client, triee par
    score decroissant."""
    conn = _connect()
    conn.row_factory = sqlite3.Row
    rows = conn.execute(
        """
        SELECT a.product, a.timestamp, a.final_score, a.trends_score, a.scorecard_score, a.lead_score
        FROM analyses a
        INNER JOIN (
            SELECT product, MAX(id) AS max_id FROM analyses WHERE owner = ? GROUP BY product
        ) latest ON a.product = latest.product AND a.id = latest.max_id
        WHERE a.owner = ?
        ORDER BY a.final_score DESC
        """,
        (owner or _UNSCOPED_OWNER, owner or _UNSCOPED_OWNER),
    ).fetchall()
    conn.close()
    return rows
