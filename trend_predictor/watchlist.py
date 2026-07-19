"""Historique persistant des analyses (SQLite, aucune dependance externe).

Permet de re-analyser regulierement les memes produits et de voir si le
score de potentiel accelere dans le temps (le vrai signal "avant que ca
explose" se voit souvent sur plusieurs semaines, pas en un seul passage).
"""

from __future__ import annotations

import datetime
import json
import os
import sqlite3

_DEFAULT_DB_PATH = os.path.join(os.path.dirname(__file__), "..", "watchlist.db")


def _db_path() -> str:
    return os.environ.get("TREND_PREDICTOR_DB", _DEFAULT_DB_PATH)


def _connect() -> sqlite3.Connection:
    conn = sqlite3.connect(_db_path())
    conn.execute(
        """
        CREATE TABLE IF NOT EXISTS analyses (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
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
) -> None:
    conn = _connect()
    with conn:
        conn.execute(
            """
            INSERT INTO analyses
                (product, keyword, timestamp, final_score, trends_score, scorecard_score, lead_score, details)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
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


def get_history(product: str) -> list[sqlite3.Row]:
    conn = _connect()
    conn.row_factory = sqlite3.Row
    rows = conn.execute(
        """
        SELECT timestamp, final_score, trends_score, scorecard_score, lead_score
        FROM analyses WHERE product = ? ORDER BY id
        """,
        (product,),
    ).fetchall()
    conn.close()
    return rows


def list_products() -> list[str]:
    conn = _connect()
    rows = conn.execute("SELECT DISTINCT product FROM analyses ORDER BY product").fetchall()
    conn.close()
    return [r[0] for r in rows]


def list_latest():
    """Derniere analyse connue pour chaque produit, triee par score decroissant."""
    conn = _connect()
    conn.row_factory = sqlite3.Row
    rows = conn.execute(
        """
        SELECT a.product, a.timestamp, a.final_score, a.trends_score, a.scorecard_score, a.lead_score
        FROM analyses a
        INNER JOIN (
            SELECT product, MAX(id) AS max_id FROM analyses GROUP BY product
        ) latest ON a.product = latest.product AND a.id = latest.max_id
        ORDER BY a.final_score DESC
        """
    ).fetchall()
    conn.close()
    return rows
