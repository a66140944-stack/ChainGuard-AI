"""
Authentication and security helpers.
"""

from __future__ import annotations

import os
from functools import wraps

from flask import current_app, jsonify, request

try:
    import jwt

    JWT_AVAILABLE = True
except Exception:
    jwt = None
    JWT_AVAILABLE = False


def parse_allowed_origins() -> list[str]:
    raw = os.getenv("ALLOWED_ORIGINS", "http://localhost:3000,http://127.0.0.1:3000")
    return [origin.strip() for origin in raw.split(",") if origin.strip()]


def is_auth_required() -> bool:
    return os.getenv("AUTH_REQUIRED", "false").strip().lower() in {"1", "true", "yes", "on"}


def auth_required(fn):
    @wraps(fn)
    def wrapper(*args, **kwargs):
        if not current_app.config.get("AUTH_REQUIRED", False):
            return fn(*args, **kwargs)

        if not JWT_AVAILABLE:
            return jsonify({"error": "PyJWT is not installed on the server"}), 500

        auth_header = request.headers.get("Authorization", "").strip()
        if not auth_header.startswith("Bearer "):
            return jsonify({"error": "Missing bearer token"}), 401

        token = auth_header.split(" ", 1)[1].strip()
        secret = current_app.config.get("JWT_SECRET_KEY")
        issuer = current_app.config.get("JWT_ISSUER")
        if not secret:
            return jsonify({"error": "Server auth configuration is incomplete"}), 500

        try:
            payload = jwt.decode(
                token,
                secret,
                algorithms=["HS256"],
                issuer=issuer if issuer else None,
                options={"require": ["exp"]},
            )
        except jwt.ExpiredSignatureError:
            return jsonify({"error": "Token expired"}), 401
        except jwt.InvalidTokenError:
            return jsonify({"error": "Invalid token"}), 401

        request.user = payload
        return fn(*args, **kwargs)

    return wrapper
