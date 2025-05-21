from flask import Flask, request, jsonify, send_file
import pyotp
import qrcode
import io
import logging
import jwt
import datetime
from functools import wraps

# === Config ===
SECRET_KEY = 'super-secret-key'  # 🔐 Change this in production!
JWT_SECRET = 'jwt-secret-key'    # 🔐 Change this too!

app = Flask(__name__)
logging.basicConfig(level=logging.INFO)

# === In-Memory "Database" ===
user_store = {
    "test@example.com": {
        "password": "password123",
        "is_2fa_enabled": False,
        "is_2fa_required": True,
        "totp_secret": None
    }
}

# === JWT Token Generator ===
def generate_token(email):
    payload = {
        'email': email,
        'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=1)
    }
    return jwt.encode(payload, JWT_SECRET, algorithm='HS256')

# === JWT Auth Decorator ===
def require_auth(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.headers.get('Authorization', '').replace('Bearer ', '')
        if not token:
            return jsonify({"error": "Missing token"}), 401
        try:
            decoded = jwt.decode(token, JWT_SECRET, algorithms=['HS256'])
            request.user_email = decoded['email']
        except jwt.ExpiredSignatureError:
            return jsonify({"error": "Token expired"}), 401
        except jwt.InvalidTokenError:
            return jsonify({"error": "Invalid token"}), 401
        return f(*args, **kwargs)
    return decorated

# === 1. Setup 2FA ===
@app.route('/2fa/setup', methods=['POST'])
def setup_2fa():
    email = request.json.get('email')
    user = user_store.get(email)
    if not user:
        return jsonify({"error": "User not found"}), 404

    # Generate TOTP secret and save
    secret = pyotp.random_base32()
    user['totp_secret'] = secret
    user['is_2fa_enabled'] = False

    # Generate QR code for authenticator app
    uri = pyotp.totp.TOTP(secret).provisioning_uri(name=email, issuer_name="MyApp")
    img = qrcode.make(uri)
    buf = io.BytesIO()
    img.save(buf, format='PNG')
    buf.seek(0)

    logging.info(f"2FA setup QR generated for {email}")
    return send_file(buf, mimetype='image/png')

# === 2. Verify 2FA Code ===
@app.route('/2fa/verify', methods=['POST'])
def verify_2fa():
    email = request.json.get('email')
    code = request.json.get('code')
    user = user_store.get(email)

    if not user or not user.get('totp_secret'):
        return jsonify({"error": "2FA not set up"}), 400

    totp = pyotp.TOTP(user['totp_secret'])
    if totp.verify(code):
        user['is_2fa_enabled'] = True
        logging.info(f"2FA verified for {email}")
        return jsonify({"success": True, "message": "2FA enabled"})
    else:
        logging.warning(f"Invalid 2FA code for {email}")
        return jsonify({"error": "Invalid 2FA code"}), 400

# === 3. Login with 2FA ===
@app.route('/login', methods=['POST'])
def login():
    email = request.json.get('email')
    password = request.json.get('password')
    code = request.json.get('code')  # Optional

    user = user_store.get(email)
    if not user or user['password'] != password:
        return jsonify({"error": "Invalid credentials"}), 401

    if user.get('is_2fa_required'):
        if not user.get('is_2fa_enabled'):
            return jsonify({"error": "2FA setup required"}), 403
        if not code:
            return jsonify({"error": "2FA code required"}), 401
        totp = pyotp.TOTP(user['totp_secret'])
        if not totp.verify(code):
            return jsonify({"error": "Invalid 2FA code"}), 401

    token = generate_token(email)
    logging.info(f"User logged in: {email}")
    return jsonify({"success": True, "token": token})

# === 4. Disable 2FA ===
@app.route('/2fa/disable', methods=['POST'])
def disable_2fa():
    email = request.json.get('email')
    password = request.json.get('password')
    code = request.json.get('code')

    user = user_store.get(email)
    if not user or user['password'] != password:
        return jsonify({"error": "Invalid credentials"}), 401

    if not user.get('is_2fa_enabled'):
        return jsonify({"error": "2FA not enabled"}), 400

    if user.get('is_2fa_required'):
        return jsonify({"error": "2FA is required and cannot be disabled"}), 403

    totp = pyotp.TOTP(user['totp_secret'])
    if totp.verify(code):
        user['totp_secret'] = None
        user['is_2fa_enabled'] = False
        logging.info(f"2FA disabled for {email}")
        return jsonify({"success": True, "message": "2FA disabled"})
    else:
        return jsonify({"error": "Invalid 2FA code"}), 400

# === 5. Protected Route ===
@app.route('/profile', methods=['GET'])
@require_auth
def profile():
    return jsonify({
        "email": request.user_email,
        "message": "This is your protected profile data."
    })

# === Run Server ===
if __name__ == '__main__':
    logging.info("🚀 Starting 2FA Flask server...")
    app.run(debug=True)
