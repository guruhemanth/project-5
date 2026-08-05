import hashlib
import os
import json
import http.client
import base64

from flask import Flask, request, jsonify, redirect, send_from_directory
from models import db
from routes.auth import auth_bp

app = Flask(__name__, static_folder=".", template_folder="html")

PORT = 8090
UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

# ── Database Configuration ───────────────────────────────────────────────────
DEFAULT_DB_URL = "postgresql://postgres:Guru%40123@localhost:5432/my_flask_db"
app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get(
    'DATABASE_URL', DEFAULT_DB_URL
)
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Initialize DB extension with Flask App
db.init_app(app)

# Register authentication blueprint routes (/api/register, /api/login)
app.register_blueprint(auth_bp)

# Create Database Tables on startup
# (skip in test mode so SQLite memory fixture handles it)
if not app.config.get('TESTING'):
    with app.app_context():
        db.create_all()


# ── HTTP connection ──────────────────────────────────────────────────────────
def send_http_request(host, port, endpoint, payload, headers):
    try:
        conn = http.client.HTTPConnection(host, port)
        conn.request("POST", endpoint, payload, headers)
        print(" 🚀 request API sent for token ")
        res = conn.getresponse()
        response_data = res.read().decode("utf-8")
        print(response_data)
        return res.status, json.loads(response_data)
    except Exception as e:
        return None, {"error": str(e)}


# ── GET routes ───────────────────────────────────────────────────────────────
@app.route("/scripts/<path:filename>")
def serve_scripts(filename):
    return send_from_directory("scripts", filename)


@app.route("/")
@app.route("/login")
def login():
    return send_from_directory("html", "login.html")


@app.route("/register")
def register_page():
    return send_from_directory("html", "register.html")


@app.route("/formtransaction")
def formtransaction():
    return send_from_directory("html", "formtransaction.html")


@app.route("/success", methods=["GET"])
def success_get():
    return send_from_directory("html", "success.html")


@app.route("/home", methods=["GET"])
def home_get():
    return send_from_directory("html", "home.html")


@app.route("/generate-ecc-key")
def generate_ecc_key():
    return send_from_directory("html", "generate-ecc-key.html")


@app.route("/LoginAPI")
def login_api():
    return send_from_directory("html", "LoginAPI.html")


@app.route("/TransactionAPI")
def transaction_api():
    return send_from_directory("html", "TransactionAPI.html")


@app.route("/Pre-Requsites")
def pre_requisites():
    return send_from_directory("html", "Pre-Requsites.html")


@app.route("/JWTAPI")
def jwt_api():
    return send_from_directory("html", "JWTAPI.html")


@app.route("/filetransaction")
def filetransaction():
    return send_from_directory("html", "filetransaction.html")


@app.route("/upload", methods=["GET"])
def upload_get():
    return send_from_directory("html", "upload.html")


# Fallback for any other GET paths under /html/
@app.route("/<path:filename>", methods=["GET"])
def serve_html(filename):
    return send_from_directory("html", filename)


# ── POST /home ───────────────────────────────────────────────────────────────
@app.route("/home", methods=["POST"])
def home_post():
    if not request.is_json:
        return jsonify({"error": "Content-Type must be application/json"}), 400

    data = request.get_json()
    print("JSON Data:", data)
    return send_from_directory("html", "home.html")


# ── POST /success ────────────────────────────────────────────────────────────
@app.route("/success", methods=["POST"])
def success_post():
    if not request.is_json:
        return jsonify({"error": "Content-Type must be application/json"}), 400

    data = request.get_json()
    print("JSON Data:", data)
    print("📨 Success page data received:", data)

    return send_from_directory("html", "success.html")


# ── POST /upload ─────────────────────────────────────────────────────────────
@app.route("/upload", methods=["POST"])
def upload_post():
    print("request received for upload file")

    if "filename[]" not in request.files:
        return jsonify({"error": "No files received"}), 400

    files = request.files.getlist("filename[]")

    # Compute SHA-256 hash for each file
    multifile = []
    file_data_map = []  # store (filename, bytes) for saving later

    for file_item in files:
        if not file_item.filename:
            continue

        file_bytes = file_item.read()
        hasher = hashlib.sha256()
        hasher.update(file_bytes)
        digest_bytes = hasher.digest()
        tbs_base64 = base64.b64encode(digest_bytes).decode()
        multifile.append(tbs_base64)
        file_data_map.append((file_item.filename, file_bytes))

    print("printing multiple hashes", multifile)

    # Save files to local directory
    saved_files = []
    for filename, file_bytes in file_data_map:
        safe_name = os.path.basename(filename)
        file_path = os.path.join(UPLOAD_DIR, safe_name)
        with open(file_path, "wb") as f:
            f.write(file_bytes)
        saved_files.append(safe_name)

    if not saved_files:
        return jsonify({"error": "No valid files received"}), 400

    print("📁 Uploaded files:", saved_files)
    return redirect("/upload", code=303)


# ── Entry point ──────────────────────────────────────────────────────────────
if __name__ == "__main__":
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    print(f"🚀 Server is live at http://localhost:{PORT}")
    app.run(host="0.0.0.0", port=PORT, debug=False)  # nosec B104
