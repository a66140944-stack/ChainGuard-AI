"""
MQTT subscriber for ingesting shipment telemetry into the backend.
"""

from __future__ import annotations

import json
import os
import sys
from pathlib import Path

from pydantic import ValidationError

BASE_DIR = Path(__file__).resolve().parents[1]
CONFIG_DIR = BASE_DIR / "config"
AI_ENGINE_PATH = Path(__file__).resolve().parents[2] / "ai-engine"
sys.path.insert(0, str(BASE_DIR))
sys.path.insert(0, str(CONFIG_DIR))
sys.path.insert(0, str(AI_ENGINE_PATH))

from logging_config import get_logger
from schemas.shipment_schema import validate_ingest_payload
from controllers.shipment_controller import process_incoming_reading

logger = get_logger("chainguard.mqtt")

try:
    import paho.mqtt.client as mqtt

    MQTT_AVAILABLE = True
except Exception as exc:
    mqtt = None
    MQTT_AVAILABLE = False
    MQTT_IMPORT_ERROR = exc


def _env_flag(name: str, default: str = "false") -> bool:
    return os.getenv(name, default).strip().lower() in {"1", "true", "yes", "on"}


def mqtt_is_enabled() -> bool:
    return _env_flag("MQTT_ENABLED", "false")


def create_mqtt_client(app):
    if not MQTT_AVAILABLE:
        logger.warning("MQTT support unavailable: %s", MQTT_IMPORT_ERROR)
        return None

    broker_host = os.getenv("MQTT_BROKER_HOST", "127.0.0.1")
    broker_port = int(os.getenv("MQTT_BROKER_PORT", "1883"))
    topic = os.getenv("MQTT_TOPIC", "chainguard/shipments/#")
    client_id = os.getenv("MQTT_CLIENT_ID", "chainguard-backend")
    username = os.getenv("MQTT_USERNAME", "")
    password = os.getenv("MQTT_PASSWORD", "")
    keepalive = int(os.getenv("MQTT_KEEPALIVE", "60"))

    client_kwargs = {"client_id": client_id}
    if hasattr(mqtt, "CallbackAPIVersion"):
        client_kwargs["callback_api_version"] = mqtt.CallbackAPIVersion.VERSION2
    client = mqtt.Client(**client_kwargs)
    if username:
        client.username_pw_set(username, password)

    def on_connect(client, userdata, flags, reason_code, properties):
        rc = getattr(reason_code, "value", reason_code)
        if rc == 0:
            logger.info("MQTT connected to %s:%s, subscribing to %s", broker_host, broker_port, topic)
            client.subscribe(topic, qos=1)
            app.config["MQTT_STATUS"] = f"connected:{topic}"
        else:
            logger.error("MQTT connection failed with rc=%s", rc)
            app.config["MQTT_STATUS"] = f"connect-failed:{rc}"

    def on_disconnect(client, userdata, flags, reason_code, properties):
        rc = getattr(reason_code, "value", reason_code)
        logger.warning("MQTT disconnected with rc=%s", rc)
        app.config["MQTT_STATUS"] = f"disconnected:{rc}"

    def on_message(client, userdata, msg):
        try:
            payload = json.loads(msg.payload.decode("utf-8"))
            reading = validate_ingest_payload(payload)
        except (UnicodeDecodeError, json.JSONDecodeError) as exc:
            logger.warning("MQTT payload decode failed on %s: %s", msg.topic, exc)
            return
        except ValidationError as exc:
            logger.warning("MQTT payload validation failed on %s: %s", msg.topic, exc)
            return

        with app.app_context():
            db = app.config["DB"]
            store_lock = app.config["STORE_LOCK"]
            shipment_store = app.config["SHIPMENT_STORE"]
            socketio = app.config["SOCKETIO"]

            processed = process_incoming_reading(reading, db)
            if processed is None:
                logger.warning("MQTT reading rejected for topic %s", msg.topic)
                return

            shipment_id = processed["shipment_id"]
            with store_lock:
                shipment_store[shipment_id] = processed
                all_shipments = list(shipment_store.values())

            socketio.emit("shipment_update", all_shipments)
            socketio.emit("shipment_ingested", processed)
            logger.info("MQTT ingested shipment %s from %s", shipment_id, msg.topic)

    client.on_connect = on_connect
    client.on_disconnect = on_disconnect
    client.on_message = on_message

    try:
        client.connect(broker_host, broker_port, keepalive)
        client.loop_start()
    except Exception as exc:
        logger.exception("MQTT startup failed: %s", exc)
        app.config["MQTT_STATUS"] = "startup-failed"
        return None

    return client
