"""
Shipment routes.
"""

from __future__ import annotations

from pathlib import Path

from flask import Blueprint, current_app, jsonify, request

import sys

BASE_DIR = Path(__file__).resolve().parents[1]
CONFIG_DIR = BASE_DIR / "config"
sys.path.insert(0, str(BASE_DIR))
sys.path.insert(0, str(CONFIG_DIR))

from security import auth_required
from rate_limit import rate_limit
from controllers.shipment_controller import get_shipment_history, process_incoming_reading
from schemas.shipment_schema import validate_ingest_payload

shipment_bp = Blueprint("shipments", __name__)


@shipment_bp.route("/api/shipments", methods=["GET"])
@auth_required
def get_all_shipments():
    store_lock = current_app.config["STORE_LOCK"]
    shipment_store = current_app.config["SHIPMENT_STORE"]
    with store_lock:
        shipments = list(shipment_store.values())
    shipments.sort(key=lambda item: item.get("risk_score", 0.0), reverse=True)
    return jsonify(shipments)


@shipment_bp.route("/api/shipments/<shipment_id>", methods=["GET"])
@auth_required
def get_shipment(shipment_id: str):
    store_lock = current_app.config["STORE_LOCK"]
    shipment_store = current_app.config["SHIPMENT_STORE"]
    with store_lock:
        shipment = shipment_store.get(shipment_id)
    if shipment is None:
        return jsonify({"error": "Shipment not found", "shipment_id": shipment_id}), 404
    return jsonify(shipment)


@shipment_bp.route("/api/ingest", methods=["POST"])
@auth_required
@rate_limit("ingest", limit=60, window_seconds=60)
def ingest_iot_data():
    reading = request.get_json(silent=True)
    if not reading:
        return jsonify({"error": "No JSON body received"}), 400
    reading = validate_ingest_payload(reading)

    db = current_app.config["DB"]
    store_lock = current_app.config["STORE_LOCK"]
    shipment_store = current_app.config["SHIPMENT_STORE"]
    socketio = current_app.config["SOCKETIO"]

    processed = process_incoming_reading(reading, db)
    if processed is None:
        return jsonify({"error": "Invalid reading data"}), 422

    shipment_id = processed["shipment_id"]
    with store_lock:
        shipment_store[shipment_id] = processed
        all_shipments = list(shipment_store.values())

    socketio.emit("shipment_update", all_shipments)
    socketio.emit("shipment_ingested", processed)

    # Return full processed payload so simulator UIs can render AI outputs instantly.
    return jsonify(processed)


@shipment_bp.route("/api/shipments/<shipment_id>/history", methods=["GET"])
@auth_required
def get_history(shipment_id: str):
    db = current_app.config["DB"]
    history = get_shipment_history(db, shipment_id, limit=20)
    return jsonify(history)
