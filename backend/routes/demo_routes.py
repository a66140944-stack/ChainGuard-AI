"""
Demo routes for hackathon presentation flow.
"""

from __future__ import annotations

import random
import sys
import time
from pathlib import Path

from flask import Blueprint, current_app, jsonify

BASE_DIR = Path(__file__).resolve().parents[1]
CONFIG_DIR = BASE_DIR / "config"
sys.path.insert(0, str(BASE_DIR))
sys.path.insert(0, str(CONFIG_DIR))

from security import auth_required
from rate_limit import rate_limit
from db import save_reading

demo_bp = Blueprint("demo", __name__)


@demo_bp.route("/api/simulate-disruption", methods=["POST"])
@auth_required
@rate_limit("simulate_disruption", limit=10, window_seconds=60)
def simulate_disruption():
    store_lock = current_app.config["STORE_LOCK"]
    shipment_store = current_app.config["SHIPMENT_STORE"]
    socketio = current_app.config["SOCKETIO"]
    db = current_app.config["DB"]

    affected_ids = ["SHP-ESP32"]
    disruption = {
        "name": "Cyclone corridor disruption",
        "severity": 0.92,
        "source": "demo-button",
    }

    with store_lock:
        for shipment_id, shipment in shipment_store.items():
            if shipment_id in affected_ids:
                risk_score = round(random.uniform(0.82, 0.96), 2)
                shipment.update(
                    {
                        "risk_score": risk_score,
                        "risk_category": "CRITICAL",
                        "action": "AUTO_REROUTE",
                        "color": "red",
                        "priority": "HIGH",
                        "delay_minutes": random.randint(120, 240),
                        "eta_impact": "Critical delay unless rerouted immediately",
                        "external_event": disruption,
                        "factors": [
                            "Cyclone warning across the active corridor.",
                            "Flooding risk near highway segment.",
                            "Operations intervention required.",
                        ],
                        "suggestions": [
                            "Initiate inland bypass route.",
                            "Escalate to operations command center.",
                        ],
                        "gemini_explanation": (
                            f"Shipment {shipment_id} is in a critical disruption zone. "
                            "The system recommends immediate rerouting and escalation."
                        ),
                        "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
                        "processed_at": time.strftime("%H:%M:%S", time.localtime()),
                    }
                )
                save_reading(db, shipment)
        all_shipments = list(shipment_store.values())

    socketio.emit(
        "disruption_alert",
        {
            "event": "Cyclone corridor disruption",
            "affected": affected_ids,
            "severity": "CRITICAL",
            "timestamp": time.strftime("%H:%M:%S", time.localtime()),
        },
    )
    socketio.emit("shipment_update", all_shipments)
    return jsonify(
        {
            "status": "disruption_simulated",
            "affected": affected_ids,
            "message": "Critical rerouting scenario published",
        }
    )


@demo_bp.route("/api/reset", methods=["POST"])
@auth_required
@rate_limit("reset_demo", limit=10, window_seconds=60)
def reset_demo():
    store_lock = current_app.config["STORE_LOCK"]
    shipment_store = current_app.config["SHIPMENT_STORE"]
    socketio = current_app.config["SOCKETIO"]
    db = current_app.config["DB"]

    with store_lock:
        for shipment in shipment_store.values():
            shipment.update(
                {
                    "risk_score": round(random.uniform(0.10, 0.35), 2),
                    "risk_category": "SAFE",
                    "action": "MONITOR",
                    "color": "green",
                    "priority": "LOW",
                    "delay_minutes": 0,
                    "eta_impact": "On schedule",
                    "external_event": None,
                    "factors": ["All systems nominal."],
                    "suggestions": ["Continue monitoring."],
                    "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
                    "processed_at": time.strftime("%H:%M:%S", time.localtime()),
                }
            )
            save_reading(db, shipment)
        all_shipments = list(shipment_store.values())

    socketio.emit("shipment_update", all_shipments)
    return jsonify({"status": "reset_complete", "message": "All shipments restored"})
