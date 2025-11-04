import os
import psycopg2

def _conn():
    return psycopg2.connect(
        host=os.getenv("DB_HOST", "localhost"),
        dbname=os.getenv("DB_NAME", "votes"),
        user=os.getenv("DB_USER", "user"),
        password=os.getenv("DB_PASS", "password"),
    )

def _reset_votes():
    conn = _conn()
    conn.autocommit = True
    with conn.cursor() as cur:
        cur.execute("""
            CREATE TABLE IF NOT EXISTS votes (
                id VARCHAR(255) PRIMARY KEY,
                count INT NOT NULL DEFAULT 0
            );
        """)
        cur.execute("INSERT INTO votes (id, count) VALUES ('cats', 0) ON CONFLICT (id) DO NOTHING;")
        cur.execute("INSERT INTO votes (id, count) VALUES ('dogs', 0) ON CONFLICT (id) DO NOTHING;")
        cur.execute("UPDATE votes SET count = 0 WHERE id IN ('cats','dogs');")
    conn.close()

def test_health_no_db():
    # Test rápido importando la app (no requiere DB)
    from backend.app import app  # si tu test se ejecuta desde raíz, usa 'from app import app'
    client = app.test_client()
    r = client.get("/")
    assert r.status_code == 200
    assert r.get_json()["status"] == "ok"

def test_results_and_vote_with_db():
    # Requiere DB disponible (en CI levantamos servicio Postgres)
    _reset_votes()
    from backend.app import app  # idem nota de import de arriba
    client = app.test_client()

    r = client.get("/results")
    assert r.status_code == 200
    data = r.get_json()
    assert data["cats"] == 0 and data["dogs"] == 0

    r = client.post("/vote/cats")
    assert r.status_code == 201

    r = client.get("/results")
    data = r.get_json()
    assert data["cats"] == 1 and data["dogs"] == 0

def test_invalid_vote_returns_400():
    from backend.app import app
    client = app.test_client()
    r = client.post("/vote/invalid")
    assert r.status_code == 400
