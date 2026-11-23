"""
Example: Flask Application utilizing Read/Write Database Split
- Uses SQLAlchemy two-engine setup (or session routing).
- Writes (INSERT, UPDATE, DELETE) -> postgres-primary:5432
- Reads (SELECT) -> postgres-replicas:5432
"""

import os
from flask import Flask, jsonify, request
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from sqlalchemy import Column, Integer, String

app = Flask(__name__)

# ------------------------------------------------------------------------------
# 1. TWO DISTINCT DATABASE ENDPOINTS (Backed by Kubernetes Services)
# ------------------------------------------------------------------------------
WRITE_DB_URL = os.getenv(
    "DATABASE_WRITE_URL",
    "postgresql://postgres:Guru%40123@postgres-primary:5432/my_flask_db"
)
READ_DB_URL = os.getenv(
    "DATABASE_READ_URL",
    "postgresql://postgres:Guru%40123@postgres-replicas:5432/my_flask_db"
)

# ------------------------------------------------------------------------------
# 2. CREATE DEDICATED DATABASE ENGINES
# ------------------------------------------------------------------------------
engine_writer = create_engine(WRITE_DB_URL, pool_size=10, max_overflow=20)
engine_reader = create_engine(READ_DB_URL, pool_size=20, max_overflow=30)

WriteSession = sessionmaker(bind=engine_writer)
ReadSession = sessionmaker(bind=engine_reader)

Base = declarative_base()

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True)
    username = Column(String(50), nullable=False)
    role = Column(String(20), default="user")

# ------------------------------------------------------------------------------
# 3. ROUTE EXAMPLES: WRITE VS READ
# ------------------------------------------------------------------------------

# WRITE ROUTE: Routed directly to PRIMARY
@app.route("/api/users", methods=["POST"])
def create_user():
    data = request.json
    db = WriteSession()  # <--- CONNECTS TO PRIMARY SERVICE
    try:
        new_user = User(username=data["username"], role=data.get("role", "user"))
        db.add(new_user)
        db.commit()
        return jsonify({"message": "User created", "user_id": new_user.id}), 201
    except Exception as e:
        db.rollback()
        return jsonify({"error": str(e)}), 400
    finally:
        db.close()

# READ ROUTE: Load-balanced across REPLICAS
@app.route("/api/users", methods=["GET"])
def get_users():
    db = ReadSession()  # <--- CONNECTS TO REPLICA SERVICE (Fast & Scalable)
    try:
        users = db.query(User).all()
        return jsonify([{"id": u.id, "username": u.username, "role": u.role} for u in users])
    finally:
        db.close()

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8090)
