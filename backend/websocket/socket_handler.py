"""
Socket.IO event handlers.
"""

from __future__ import annotations

from pathlib import Path

from flask import current_app
from flask_socketio import emit

import sys

BASE_DIR = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(BASE_DIR))

from controllers.shipment_controller import get_shipment_history


def register_socket_events(socketio) -> None:
    @socketio.on("connect")
    def handle_connect():
        store_lock = current_app.config["STORE_LOCK"]
        shipment_store = current_app.config["SHIPMENT_STORE"]
        with store_lock:
            current_data = list(shipment_store.values())
        emit("shipment_update", current_data)

    @socketio.on("disconnect")
    def handle_disconnect():
        return None

    @socketio.on("request_history")
    def handle_history_request(data):
        shipment_id = (data or {}).get("shipment_id", "")
        history = get_shipment_history(current_app.config["DB"], shipment_id)
        emit("shipment_history", {"shipment_id": shipment_id, "history": history})
