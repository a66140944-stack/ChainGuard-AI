"""
ChainGuard backend application.
"""

from __future__ import annotations

import os
import sys
import threading
import time
from pathlib import Path
from typing import Iterable

from pydantic import ValidationError
from flask import Flask
from flask_cors import CORS
from flask_socketio import SocketIO
from werkzeug.exceptions import HTTPException

BASE_DIR = Path(__file__).resolve().parent
ROOT_DIR = BASE_DIR.parent
AI_ENGINE_DIR = ROOT_DIR / "ai-engine"
IOT_SIMULATOR_DIR = ROOT_DIR / "iot-simulator"
CONFIG_DIR = BASE_DIR / "config"

sys.path.insert(0, str(BASE_DIR))
sys.path.insert(0, str(CONFIG_DIR))
sys.path.insert(0, str(AI_ENGINE_DIR))
sys.path.insert(0, str(IOT_SIMULATOR_DIR))

from env_loader import load_environment

load_environment(BASE_DIR, ROOT_DIR)

from logging_config import configure_logging, get_logger
from mqtt_subscriber import create_mqtt_client, mqtt_is_enabled
from security import is_auth_required, parse_allowed_origins
from db import get_db, get_storage_label, load_current_shipments
from routes.alert_routes import alert_bp
from routes.demo_routes import demo_bp
from routes.shipment_routes import shipment_bp
from websocket.socket_handler import register_socket_events

configure_logging()
logger = get_logger("chainguard.app")


def create_app() -> tuple[Flask, SocketIO]:
    app = Flask(__name__)
    app.config["SECRET_KEY"] = os.getenv("SECRET_KEY", "chainguard-dev-secret")
    app.config["JWT_SECRET_KEY"] = os.getenv("JWT_SECRET_KEY", app.config["SECRET_KEY"])
    app.config["JWT_ISSUER"] = os.getenv("JWT_ISSUER", "")
    app.config["AUTH_REQUIRED"] = is_auth_required()
    app.config["ALLOWED_ORIGINS"] = parse_allowed_origins()

    CORS(app, resources={r"/api/*": {"origins": app.config["ALLOWED_ORIGINS"]}})

    socketio = SocketIO(
        app,
        cors_allowed_origins=app.config["ALLOWED_ORIGINS"],
        async_mode="threading",
        logger=False,
        engineio_logger=False,
    )

    db = get_db()
    shipment_store: dict[str, dict] = {}
    store_lock = threading.Lock()

    app.config["DB"] = db
    app.config["STORAGE_BACKEND"] = get_storage_label(db)
    app.config["SHIPMENT_STORE"] = shipment_store
    app.config["STORE_LOCK"] = store_lock
    app.config["SOCKETIO"] = socketio
    app.config["MQTT_STATUS"] = "disabled"

    try:
        from predictor import full_prediction as _full_prediction  # noqa: F401

        app.config["AI_AVAILABLE"] = True
    except Exception:
        app.config["AI_AVAILABLE"] = False

    for shipment in load_current_shipments(db):
        shipment_id = shipment.get("shipment_id")
        if shipment_id:
            shipment_store[shipment_id] = shipment

    app.register_blueprint(shipment_bp)
    app.register_blueprint(alert_bp)
    app.register_blueprint(demo_bp)

    register_error_handlers(app)
    register_socket_events(socketio)
    return app, socketio


def seed_initial_data() -> None:
    time.sleep(1)
    try:
        from controllers.shipment_controller import process_incoming_reading
        from simulator import SHIPMENTS, generate_sensor_reading
        seed_readings = [generate_sensor_reading(shipment) for shipment in SHIPMENTS]
        seed_source = "iot-simulator"
    except Exception as exc:
        logger.warning("Simulator seed unavailable, using backend sample data: %s", exc)
        from controllers.shipment_controller import process_incoming_reading

        seed_readings = list(_default_seed_readings())
        seed_source = "backend-sample"

    db = app.config["DB"]
    store_lock = app.config["STORE_LOCK"]
    shipment_store = app.config["SHIPMENT_STORE"]

    seeded = []
    for reading in seed_readings:
        try:
            processed = process_incoming_reading(reading, db)
        except Exception as exc:
            logger.exception("Seed shipment failed: %s", exc)
            continue
        if processed:
            seeded.append(processed)
            with store_lock:
                shipment_store[processed["shipment_id"]] = processed

    if seeded:
        socketio.emit("shipment_update", list(shipment_store.values()))
        logger.info("Loaded %s seed shipments from %s", len(seeded), seed_source)


def _default_seed_readings() -> Iterable[dict]:
    return (
        {
            "shipment_id": "SHP-001",
            "origin": "Mumbai",
            "destination": "Delhi",
            "carrier": "BlueDart",
            "cargo_type": "Medicines",
            "lat": 19.0760,
            "lng": 72.8777,
            "speed_kmh": 56.0,
            "temperature_c": 26.5,
            "battery_pct": 88.0,
            "humidity_pct": 54.0,
            "signal_strength": 82.0,
        },
        {
            "shipment_id": "SHP-002",
            "origin": "Chennai",
            "destination": "Kolkata",
            "carrier": "Delhivery",
            "cargo_type": "Vaccines",
            "lat": 13.0827,
            "lng": 80.2707,
            "speed_kmh": 28.0,
            "temperature_c": 36.8,
            "battery_pct": 41.0,
            "humidity_pct": 73.0,
            "signal_strength": 64.0,
        },
        {
            "shipment_id": "SHP-003",
            "origin": "Hyderabad",
            "destination": "Pune",
            "carrier": "Ecom Express",
            "cargo_type": "Electronics",
            "lat": 17.3850,
            "lng": 78.4867,
            "speed_kmh": 67.0,
            "temperature_c": 29.4,
            "battery_pct": 76.0,
            "humidity_pct": 48.0,
            "signal_strength": 90.0,
        },
        {
            "shipment_id": "SHP-004",
            "origin": "Bengaluru",
            "destination": "Patna",
            "carrier": "DHL",
            "cargo_type": "Fresh Produce",
            "lat": 12.9716,
            "lng": 77.5946,
            "speed_kmh": 18.0,
            "temperature_c": 38.2,
            "battery_pct": 29.0,
            "humidity_pct": 67.0,
            "signal_strength": 58.0,
        },
    )


def heartbeat_loop() -> None:
    while True:
        time.sleep(10)
        with app.app_context():
            store_lock = app.config["STORE_LOCK"]
            shipment_store = app.config["SHIPMENT_STORE"]
            with store_lock:
                count = len(shipment_store)
            socketio.emit(
                "heartbeat",
                {
                    "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
                    "count": count,
                },
            )


def print_banner() -> None:
    db_state = app.config.get("STORAGE_BACKEND", "memory-only")
    ai_state = "connected" if app.config["AI_AVAILABLE"] else "fallback"
    mqtt_state = app.config.get("MQTT_STATUS", "disabled")
    port = int(os.getenv("PORT", "5000"))
    print("=" * 52)
    print("ChainGuard Backend")
    print("=" * 52)
    print(f"Health:    http://localhost:{port}/api/health")
    print(f"Shipments: http://localhost:{port}/api/shipments")
    print(f"Alerts:    http://localhost:{port}/api/alerts")
    print(f"Stats:     http://localhost:{port}/api/stats")
    print(f"Database:  {db_state}")
    print(f"AI Engine: {ai_state}")
    print(f"MQTT:      {mqtt_state}")
    print(f"Auth:      {'required' if app.config['AUTH_REQUIRED'] else 'disabled'}")
    print("=" * 52)


def register_error_handlers(app: Flask) -> None:
    @app.errorhandler(ValidationError)
    def handle_validation_error(exc: ValidationError):
        return {"error": "Validation failed", "details": exc.errors()}, 422

    @app.errorhandler(HTTPException)
    def handle_http_error(exc: HTTPException):
        return {"error": exc.description}, exc.code

    @app.errorhandler(Exception)
    def handle_unexpected_error(exc: Exception):
        logger.exception("Unhandled application error: %s", exc)
        return {"error": "Internal server error"}, 500


app, socketio = create_app()


if __name__ == "__main__":
    mqtt_client = None
    if mqtt_is_enabled():
        mqtt_client = create_mqtt_client(app)
        if mqtt_client is None and app.config.get("MQTT_STATUS") == "disabled":
            app.config["MQTT_STATUS"] = "unavailable"

    print_banner()

    threading.Thread(target=seed_initial_data, daemon=True).start()
    threading.Thread(target=heartbeat_loop, daemon=True).start()

    try:
        socketio.run(
            app,
            host="0.0.0.0",
            port=int(os.getenv("PORT", "5000")),
            debug=os.getenv("FLASK_DEBUG", "false").lower() == "true",
            use_reloader=False,
            allow_unsafe_werkzeug=True,
        )
    finally:
        if mqtt_client is not None:
            mqtt_client.loop_stop()
            mqtt_client.disconnect()
