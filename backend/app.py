import os
import time
import psycopg2
import click
from flask import Flask, jsonify, g

app = Flask(__name__)

DB_HOST = os.getenv("DB_HOST", "localhost")
DB_NAME = os.getenv("DB_NAME", "votes")
DB_USER = os.getenv("DB_USER", "user")
DB_PASS = os.getenv("DB_PASS", "password")

def get_db():
    if "db" not in g:
        for _ in range(10):
            try:
                g.db = psycopg2.connect(
                    host=DB_HOST, dbname=DB_NAME, user=DB_USER, password=DB_PASS
                )
                g.db.autocommit = True
                break
            except psycopg2.OperationalError:
                time.sleep(1)
        else:
            raise Exception("Could not connect to database")
    return g.db

@app.teardown_appcontext
def teardown_db(exception):
    db = g.pop("db", None)
    if db is not None:
        db.close()

def ensure_schema():
    conn = get_db()
    with conn.cursor() as cur:
        cur.execute("""
            CREATE TABLE IF NOT EXISTS votes (
                id VARCHAR(255) PRIMARY KEY,
                count INT NOT NULL DEFAULT 0
            );
        """)
        cur.execute("INSERT INTO votes (id, count) VALUES ('cats', 0) ON CONFLICT (id) DO NOTHING;")
        cur.execute("INSERT INTO votes (id, count) VALUES ('dogs', 0) ON CONFLICT (id) DO NOTHING;")

@app.cli.command("init-db")
def init_db_command():
    """Initializes the database."""
    ensure_schema()
    click.echo("Initialized the database.")

@app.route("/")
def health():
    return jsonify({"status": "ok"})

@app.route("/results", methods=["GET"])
def results():
    conn = get_db()
    with conn.cursor() as cur:
        cur.execute("SELECT id, count FROM votes WHERE id IN ('cats','dogs');")
        rows = cur.fetchall()
    data = {"cats": 0, "dogs": 0}
    for rid, count in rows:
        data[rid] = count
    return jsonify(data)

@app.route("/vote/<option>", methods=["POST"])
def vote(option):
    option = option.lower()
    if option not in ("cats", "dogs"):
        return jsonify({"error": "invalid option"}), 400
    conn = get_db()
    with conn.cursor() as cur:
        cur.execute("UPDATE votes SET count = count + 1 WHERE id = %s;", (option,))
    return jsonify({"ok": True, "voted": option}), 201

# Gunicorn: app = app
