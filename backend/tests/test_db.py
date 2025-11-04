import os
import psycopg2
from pathlib import Path

DB_HOST = os.getenv("DB_HOST", "localhost")
DB_NAME = os.getenv("DB_NAME", "votes")
DB_USER = os.getenv("DB_USER", "postgres")
DB_PASS = os.getenv("DB_PASS", "123")

def get_db_connection():
    # Forzamos UTF-8 desde libpq y desde la sesión
    conn = psycopg2.connect(
        host=DB_HOST,
        dbname=DB_NAME,
        user=DB_USER,
        password=DB_PASS,
        options='-c client_encoding=UTF8',
        application_name='practica-2'
    )
    conn.set_client_encoding('UTF8')
    conn.autocommit = True
    return conn

def run_query():
    sql_path = Path(__file__).resolve().parent.parent / "query_test.sql"
    with open(sql_path, "r", encoding="utf-8") as f:
        query = f.read()
    with get_db_connection() as conn, conn.cursor() as cur:
        cur.execute(query)
        rows = cur.fetchall()
        for row in rows:
            print(row)

if __name__ == '__main__':
    print(f"Conectando a {DB_USER}@{DB_HOST}/{DB_NAME} ...")
    run_query()
    print("OK ✅")
