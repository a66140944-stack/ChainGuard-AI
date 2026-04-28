"""
Shipment data modeling helpers.
"""

from __future__ import annotations

import time

SHIPMENT_DEFAULTS = {
    "shipment_id": "UNKNOWN",
    "origin": "Unknown",
    "destination": "Unknown",
    "carrier": "Unknown",
    "cargo_type": "General",
    "lat": 20.0,
    "lng": 78.0,
    "speed_kmh": 0.0,
    "temperature_c": 25.0,
    "battery_pct": 100.0,
    "humidity_pct": 50.0,
    "signal_strength": 80.0,
    "risk_score": 0.0,
    "risk_category": "SAFE",
    "action": "MONITOR",
    "color": "green",
    "priority": "LOW",
    "delay_minutes": 0,
    "eta_text": "--:--",
    "eta_impact": "On schedule",
    "ml_predicted": False,
    "confidence": 0.0,
    "factors": [],
    "suggestions": [],
    "gemini_explanation": "",
    "rerouting": None,
    "weather": None,
    "external_event": None,
    "timestamp": "",
    "processed_at": "",
    "device_id": "",
}


def build_shipment(
    raw_reading: dict,
    ai_result: dict | None = None,
    weather: dict | None = None,
    rerouting: dict | None = None,
) -> dict:
    shipment = dict(SHIPMENT_DEFAULTS)
    for key, value in raw_reading.items():
        if key != "_id":
            shipment[key] = value

    if ai_result:
        for field in (
            "risk_score",
            "risk_category",
            "action",
            "color",
            "priority",
            "delay_minutes",
            "eta_text",
            "eta_impact",
            "ml_predicted",
            "confidence",
            "factors",
            "suggestions",
            "gemini_explanation",
            "probabilities",
            "rerouting",
        ):
            if field in ai_result:
                shipment[field] = ai_result[field]

    if weather is not None:
        shipment["weather"] = weather
    if rerouting is not None:
        shipment["rerouting"] = rerouting

    if not shipment.get("timestamp"):
        shipment["timestamp"] = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
    shipment["processed_at"] = time.strftime("%H:%M:%S", time.localtime())
    return shipment


def validate_reading(reading: dict) -> tuple[bool, str]:
    for field in ("shipment_id", "lat", "lng"):
        if field not in reading:
            return False, f"Missing required field: {field}"
        if reading[field] is None:
            return False, f"Field '{field}' cannot be null"

    try:
        lat = float(reading.get("lat"))
        lng = float(reading.get("lng"))
    except (TypeError, ValueError):
        return False, "Latitude and longitude must be numeric"

    if not -90 <= lat <= 90:
        return False, f"Invalid latitude: {lat}"
    if not -180 <= lng <= 180:
        return False, f"Invalid longitude: {lng}"
    return True, "OK"
