"""
Alert and health routes.
"""

from __future__ import annotations

import time
from pathlib import Path

from flask import Blueprint, current_app, jsonify

import sys

BASE_DIR = Path(__file__).resolve().parents[1]
CONFIG_DIR = BASE_DIR / "config"
sys.path.insert(0, str(BASE_DIR))
sys.path.insert(0, str(CONFIG_DIR))

from security import auth_required
from controllers.alert_controller import AlertController

alert_bp = Blueprint("alerts", __name__)


@alert_bp.route("/api/alerts", methods=["GET"])
@auth_required
def get_alerts():
    store_lock = current_app.config["STORE_LOCK"]
    shipment_store = current_app.config["SHIPMENT_STORE"]
    with store_lock:
        alerts = AlertController.get_active_alerts(list(shipment_store.values()))
    return jsonify(alerts)


@alert_bp.route("/api/stats", methods=["GET"])
@auth_required
def get_stats():
    store_lock = current_app.config["STORE_LOCK"]
    shipment_store = current_app.config["SHIPMENT_STORE"]
    with store_lock:
        stats = AlertController.get_stats(list(shipment_store.values()))
    return jsonify(stats)


@alert_bp.route("/api/health", methods=["GET"])
def health():
    store_lock = current_app.config["STORE_LOCK"]
    shipment_store = current_app.config["SHIPMENT_STORE"]
    db = current_app.config["DB"]
    with store_lock:
        shipment_count = len(shipment_store)
    return jsonify(
        {
            "status": "online",
            "service": "ChainGuard Backend API",
            "shipments": shipment_count,
            "database": current_app.config.get("STORAGE_BACKEND", "memory-only") if db else "memory-only",
            "ai_engine": "connected" if current_app.config.get("AI_AVAILABLE") else "fallback",
            "timestamp": time.strftime("%Y-%m-%d %H:%M:%S", time.localtime()),
        }
    )
