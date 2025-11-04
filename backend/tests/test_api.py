import pytest
from backend.app import app as flask_app

@pytest.fixture
def app():
    yield flask_app

@pytest.fixture
def client(app):
    return app.test_client()

def test_health(client):
    r = client.get("/")
    assert r.status_code == 200
    assert r.get_json()["status"] == "ok"

def test_results_and_vote(client):
    # Reset votes before test
    with client.application.app_context():
        from backend.app import get_db
        conn = get_db()
        with conn.cursor() as cur:
            cur.execute("UPDATE votes SET count = 0 WHERE id IN ('cats','dogs');")

    r = client.get("/results")
    assert r.status_code == 200
    data = r.get_json()
    assert data["cats"] == 0 and data["dogs"] == 0

    r = client.post("/vote/cats")
    assert r.status_code == 201

    r = client.get("/results")
    data = r.get_json()
    assert data["cats"] == 1 and data["dogs"] == 0

def test_invalid_vote_returns_400(client):
    r = client.post("/vote/invalid")
    assert r.status_code == 400
