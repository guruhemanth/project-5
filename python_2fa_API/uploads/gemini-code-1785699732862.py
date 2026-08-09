import os
import zipfile

# Define project root name
project_root = "flask_app_modular"

# File structures
files = {}

# 1. app.py
files["app.py"] = '''import os
from flask import Flask, send_from_directory, jsonify, request
from routes.auth import auth_bp
from routes.crypto import crypto_bp
from routes.transactions import transactions_bp

app = Flask(__name__, static_folder=".", template_folder="html")
PORT = 8090

# Register Modular Blueprints
app.register_blueprint(auth_bp)
app.register_blueprint(crypto_bp)
app.register_blueprint(transactions_bp)

# Static Asset Route
@app.route("/scripts/<path:filename>")
def serve_scripts(filename):
    return send_from_directory("scripts", filename)

# Core Page Routes
@app.route("/")
@app.route("/home", methods=["GET"])
def home_get():
    return send_from_directory("html", "home.html")

@app.route("/home", methods=["POST"])
def home_post():
    if not request.is_json:
        return jsonify({"error": "Content-Type must be application/json"}), 400
    data = request.get_json()
    print("JSON Data received at /home:", data)
    return send_from_directory("html", "home.html")

@app.route("/Pre-Requsites")
def pre_requisites():
    return send_from_directory("html", "Pre-Requsites.html")

# Fallback GET route for HTML templates
@app.route("/<path:filename>", methods=["GET"])
def serve_html(filename):
    return send_from_directory("html", filename)

if __name__ == "__main__":
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    print(f"🚀 Server is live at http://localhost:{PORT}")
    app.run(host="0.0.0.0", port=PORT, debug=True)
'''

# 2. routes/__init__.py
files["routes/__init__.py"] = '''# Routes package initializer'''

# 3. routes/auth.py
files["routes/auth.py"] = '''from flask import Blueprint, send_from_directory, request, jsonify

auth_bp = Blueprint("auth", __name__)

@auth_bp.route("/login", methods=["GET"])
def login():
    return send_from_directory("html", "login.html")

@auth_bp.route("/LoginAPI", methods=["GET", "POST"])
def login_api():
    if request.method == "POST":
        data = request.get_json() or {}
        # Place authentication logic / JWT generation here
        return jsonify({"status": "success", "token": "example-jwt-token"})
    return send_from_directory("html", "LoginAPI.html")

@auth_bp.route("/JWTAPI", methods=["GET"])
def jwt_api():
    return send_from_directory("html", "JWTAPI.html")
'''

# 4. routes/crypto.py
files["routes/crypto.py"] = '''import os
import base64
import hashlib
from flask import Blueprint, send_from_directory, request, jsonify, redirect

crypto_bp = Blueprint("crypto", __name__)
UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@crypto_bp.route("/generate-ecc-key", methods=["GET"])
def generate_ecc_key():
    return send_from_directory("html", "generate-ecc-key.html")

@crypto_bp.route("/upload", methods=["GET"])
def upload_get():
    return send_from_directory("html", "upload.html")

@crypto_bp.route("/upload", methods=["POST"])
def upload_post():
    print("📥 Request received for file upload")

    if "filename[]" not in request.files:
        return jsonify({"error": "No files received"}), 400

    files = request.files.getlist("filename[]")
    multifile = []
    file_data_map = []

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

    saved_files = []
    for filename, file_bytes in file_data_map:
        safe_name = os.path.basename(filename)
        file_path = os.path.join(UPLOAD_DIR, safe_name)
        with open(file_path, "wb") as f:
            f.write(file_bytes)
        saved_files.append(safe_name)

    if not saved_files:
        return jsonify({"error": "No valid files received"}), 400

    print("📁 Uploaded files saved:", saved_files)
    print("🔑 File Hashes (SHA-256):", multifile)
    
    return redirect("/upload", code=303)
'''

# 5. routes/transactions.py
files["routes/transactions.py"] = '''from flask import Blueprint, send_from_directory, request, jsonify

transactions_bp = Blueprint("transactions", __name__)

@transactions_bp.route("/formtransaction", methods=["GET"])
def form_transaction():
    return send_from_directory("html", "formtransaction.html")

@transactions_bp.route("/filetransaction", methods=["GET"])
def file_transaction():
    return send_from_directory("html", "filetransaction.html")

@transactions_bp.route("/success", methods=["GET"])
def success_get():
    return send_from_directory("html", "success.html")

@transactions_bp.route("/TransactionAPI", methods=["GET", "POST"])
def transaction_api():
    if request.method == "POST":
        if not request.is_json:
            return jsonify({"error": "Content-Type must be application/json"}), 400
        
        data = request.get_json()
        print("💳 Transaction API Data Received:", data)
        return jsonify({"status": "success", "message": "Transaction processed successfully"})
        
    return send_from_directory("html", "TransactionAPI.html")

@transactions_bp.route("/success", methods=["POST"])
def success_post():
    if not request.is_json:
        return jsonify({"error": "Content-Type must be application/json"}), 400

    data = request.get_json()
    print("📨 Success page data received:", data)
    return send_from_directory("html", "success.html")
'''

# 6. HTML Files Boilerplate
html_pages = [
    ("login.html", "Login", "<h1>Login Page</h1><p>Welcome to the authentication section.</p>"),
    ("home.html", "Home", "<h1>Home Dashboard</h1><p>Modular Flask Application running successfully!</p>"),
    ("success.html", "Success", "<h1>Transaction Successful</h1><p>Your request has been processed.</p>"),
    ("formtransaction.html", "Form Transaction", "<h1>Form Transaction</h1><form><input type='text' placeholder='Transaction ID'/><button type='submit'>Submit</button></form>"),
    ("filetransaction.html", "File Transaction", "<h1>File Transaction</h1><p>Manage file transfers here.</p>"),
    ("upload.html", "Upload Files", "<h1>Upload Files</h1><form action='/upload' method='POST' enctype='multipart/form-data'><input type='file' name='filename[]' multiple/><button type='submit'>Upload</button></form>"),
    ("generate-ecc-key.html", "Generate ECC Key", "<h1>Generate ECC Key</h1><p>ECC Key Generation Suite.</p>"),
    ("LoginAPI.html", "Login API", "<h1>Login API Documentation / Interface</h1>"),
    ("TransactionAPI.html", "Transaction API", "<h1>Transaction API Interface</h1>"),
    ("Pre-Requsites.html", "Pre-Requisites", "<h1>System Pre-Requisites</h1>"),
    ("JWTAPI.html", "JWT API", "<h1>JWT API Management</h1>")
]

for filename, title, body in html_pages:
    files[f"html/{filename}"] = f'''<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{title}</title>
    <style>
        body {{ font-family: system-ui, -apple-system, sans-serif; padding: 2rem; line-height: 1.5; background: #f8fafc; color: #0f172a; }}
        .container {{ max-width: 800px; margin: 0 auto; background: white; padding: 2rem; border-radius: 8px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); }}
        a {{ color: #2563eb; text-decoration: none; }}
        a:hover {{ text-decoration: underline; }}
    </style>
</head>
<body>
    <div class="container">
        {body}
        <hr style="margin-top: 2rem; border: none; border-top: 1px solid #e2e8f0;"/>
        <p><a href="/home">← Back to Home</a></p>
    </div>
</body>
</html>'''

# 7. scripts/app.js
files["scripts/app.js"] = "// Client-side JavaScript scripts folder\nconsole.log('Static script loaded successfully');"

# 8. requirements.txt
files["requirements.txt"] = "Flask>=3.0.0\n"

# 9. README.md
files["README.md"] = '''# Refactored Modular Flask Application

This repository contains the modularized Python Flask application split using **Flask Blueprints**.

## Directory Structure