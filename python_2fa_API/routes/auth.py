from flask import Blueprint, request, jsonify
from models import db, User

auth_bp = Blueprint("auth", __name__)

# ── User Registration Endpoint ────────────────────────────────────────────────
@auth_bp.route("/api/register", methods=["POST"])
def register():
    data = request.get_json() or {}
    
    username = data.get("username")
    email = data.get("email")
    password = data.get("password")

    if not username or not email or not password:
        return jsonify({"error": "Username, email, and password are required"}), 400

    # Check if user already exists
    if User.query.filter((User.username == username) | (User.email == email)).first():
        return jsonify({"error": "Username or Email already registered"}), 409

    # Create new user record
    new_user = User(username=username, email=email)
    new_user.set_password(password)  # Securely hashes the password

    # Save to PostgreSQL
    db.session.add(new_user)
    db.session.commit()

    return jsonify({"message": "User registered successfully", "user": new_user.to_dict()}), 201


# ── User Login Endpoint ───────────────────────────────────────────────────────
@auth_bp.route("/api/login", methods=["POST"])
def login():
    data = request.get_json() or {}
    
    username = data.get("username")
    email = data.get("email")
    password = data.get("password")

    if not password or (not username and not email):
        return jsonify({"error": "Username or Email and password are required"}), 400

    # Allow login with EITHER username OR email
    if username and email:
        user = User.query.filter((User.username == username) & (User.email == email)).first()
    elif username:
        user = User.query.filter_by(username=username).first()
    else:
        user = User.query.filter_by(email=email).first()

    # Validate password
    if not user or not user.check_password(password):
        return jsonify({"error": "Invalid username/email or password"}), 401

    return jsonify({"message": "Login successful", "user": user.to_dict()}), 200
