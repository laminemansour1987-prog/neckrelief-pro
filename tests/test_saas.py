"""Tests unitaires pour la gestion des comptes clients (aucun appel Stripe)."""

import datetime


def _fresh_db(tmp_path, monkeypatch):
    monkeypatch.setenv("USERS_DB", str(tmp_path / "users.db"))
    from saas import db

    return db


def test_signup_then_login(tmp_path, monkeypatch):
    db = _fresh_db(tmp_path, monkeypatch)

    user = db.create_user("Client@Example.com ", "motdepasse123")
    assert user["email"] == "client@example.com"  # normalise en minuscules
    assert user["subscription_status"] == "trialing"

    logged_in = db.verify_login("client@example.com", "motdepasse123")
    assert logged_in is not None

    assert db.verify_login("client@example.com", "mauvais-mdp") is None
    assert db.verify_login("inconnu@example.com", "motdepasse123") is None


def test_duplicate_email_raises(tmp_path, monkeypatch):
    import sqlite3

    db = _fresh_db(tmp_path, monkeypatch)
    db.create_user("dup@example.com", "motdepasse123")
    try:
        db.create_user("dup@example.com", "autremdp123")
        assert False, "devrait lever une erreur d'unicite"
    except sqlite3.IntegrityError:
        pass


def test_trial_grants_access_then_expires(tmp_path, monkeypatch):
    db = _fresh_db(tmp_path, monkeypatch)
    user = db.create_user("trial@example.com", "motdepasse123")

    assert db.has_access(user) is True
    assert db.trial_days_left(user) in (db.TRIAL_DAYS, db.TRIAL_DAYS - 1)

    # simule un essai expire en manipulant directement la base
    conn = db._connect()
    with conn:
        past = (datetime.datetime.utcnow() - datetime.timedelta(days=1)).isoformat(timespec="seconds")
        conn.execute("UPDATE users SET trial_end = ? WHERE email = ?", (past, "trial@example.com"))
    conn.close()

    expired_user = db.get_user_by_email("trial@example.com")
    assert db.has_access(expired_user) is False


def test_stripe_subscription_grants_and_revokes_access(tmp_path, monkeypatch):
    db = _fresh_db(tmp_path, monkeypatch)
    db.create_user("sub@example.com", "motdepasse123")

    db.link_stripe_customer("sub@example.com", "cus_123", "sub_123", plan="monthly")
    db.set_subscription_status("sub@example.com", "active")

    user = db.get_user_by_email("sub@example.com")
    assert user["stripe_customer_id"] == "cus_123"
    assert user["plan"] == "monthly"
    assert db.has_access(user) is True

    db.set_subscription_status_by_customer("cus_123", "canceled")
    user = db.get_user_by_email("sub@example.com")
    assert user["subscription_status"] == "canceled"
    assert db.has_access(user) is False


def test_get_user_by_customer_id(tmp_path, monkeypatch):
    db = _fresh_db(tmp_path, monkeypatch)
    db.create_user("byid@example.com", "motdepasse123")
    db.link_stripe_customer("byid@example.com", "cus_999", "sub_999")

    found = db.get_user_by_customer_id("cus_999")
    assert found is not None
    assert found["email"] == "byid@example.com"
    assert db.get_user_by_customer_id("cus_inconnu") is None


def test_manual_activation_without_stripe(tmp_path, monkeypatch):
    db = _fresh_db(tmp_path, monkeypatch)
    db.create_user("manuel@example.com", "motdepasse123")

    db.set_manual_subscription("manuel@example.com", plan="mensuel", active=True)
    user = db.get_user_by_email("manuel@example.com")
    assert user["subscription_status"] == "active"
    assert user["plan"] == "mensuel"
    assert db.has_access(user) is True

    db.set_manual_subscription("manuel@example.com", active=False)
    user = db.get_user_by_email("manuel@example.com")
    assert user["subscription_status"] == "canceled"
    assert db.has_access(user) is False


def test_extend_trial_pushes_end_date_forward(tmp_path, monkeypatch):
    db = _fresh_db(tmp_path, monkeypatch)
    user = db.create_user("prolonge@example.com", "motdepasse123")
    original_end = datetime.datetime.fromisoformat(user["trial_end"])

    db.extend_trial("prolonge@example.com", 30)

    updated = db.get_user_by_email("prolonge@example.com")
    new_end = datetime.datetime.fromisoformat(updated["trial_end"])
    assert (new_end - original_end).days == 30
    assert db.has_access(updated) is True


def test_is_admin_defaults_to_owner_email(tmp_path, monkeypatch):
    db = _fresh_db(tmp_path, monkeypatch)
    monkeypatch.delenv("ADMIN_EMAILS", raising=False)
    monkeypatch.setenv("OWNER_CONTACT_EMAIL", "proprietaire@example.com")

    assert db.is_admin("proprietaire@example.com") is True
    assert db.is_admin("PROPRIETAIRE@EXAMPLE.COM") is True
    assert db.is_admin("client@example.com") is False
    assert db.is_admin(None) is False


def test_is_admin_respects_admin_emails_override(tmp_path, monkeypatch):
    db = _fresh_db(tmp_path, monkeypatch)
    monkeypatch.setenv("ADMIN_EMAILS", "admin1@example.com, admin2@example.com")

    assert db.is_admin("admin1@example.com") is True
    assert db.is_admin("admin2@example.com") is True
    assert db.is_admin("proprietaire@example.com") is False


def test_delete_user_removes_account(tmp_path, monkeypatch):
    db = _fresh_db(tmp_path, monkeypatch)
    db.create_user("asupprimer@example.com", "motdepasse123")
    assert db.get_user_by_email("asupprimer@example.com") is not None

    db.delete_user("asupprimer@example.com")
    assert db.get_user_by_email("asupprimer@example.com") is None
