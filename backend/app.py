import os
import time
import psycopg2
from flask import Flask, jsonify

app = Flask(__name__)

DB_HOST = os.getenv("DB_HOST", "localhost")
DB_NAME = os.getenv("DB_NAME", "votes")
DB_USER = os.getenv("DB_USER", "user")
DB_PASS = os.getenv("DB_PASS", "password")

def get_db_connection(retries=10, delay=1.0):
    last_err = None
    for _ in range(retries):
        try:
            conn = psycopg2.connect(
                host=DB_HOST, dbname=DB_NAME, user=DB_USER, password=DB_PASS
            )
            conn.autocommit = True
            return conn
        except Exception as e:
            last_err = e
            time.sleep(delay)
    raise last_err

def ensure_schema():
    conn = get_db_connection()
    with conn.cursor() as cur:
        cur.execute("""
            CREATE TABLE IF NOT EXISTS votes (
                id VARCHAR(255) PRIMARY KEY,
                count INT NOT NULL DEFAULT 0
            );
        """)
        cur.execute("INSERT INTO votes (id, count) VALUES ('cats', 0) ON CONFLICT (id) DO NOTHING;")
        cur.execute("INSERT INTO votes (id, count) VALUES ('dogs', 0) ON CONFLICT (id) DO NOTHING;")
    conn.close()

@app.route("/")
def health():
    return jsonify({"status": "ok"})

@app.route("/results", methods=["GET"])
def results():
    ensure_schema()
    conn = get_db_connection()
    with conn.cursor() as cur:
        cur.execute("SELECT id, count FROM votes WHERE id IN ('cats','dogs');")
        rows = cur.fetchall()
    conn.close()
    data = {"cats": 0, "dogs": 0}
    for rid, count in rows:
        data[rid] = count
    return jsonify(data)

@app.route("/vote/<option>", methods=["POST"])
def vote(option):
    option = option.lower()
    if option not in ("cats", "dogs"):
        return jsonify({"error": "invalid option"}), 400
    ensure_schema()
    conn = get_db_connection()
    with conn.cursor() as cur:
        cur.execute("UPDATE votes SET count = count + 1 WHERE id = %s;", (option,))
    conn.close()
    return jsonify({"ok": True, "voted": option}), 201

# Gunicorn: app = app
