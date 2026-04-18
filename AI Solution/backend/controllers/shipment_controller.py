"""
Business logic for shipment ingestion and enrichment.
"""

from __future__ import annotations

import sys
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parents[1]
CONFIG_DIR = BASE_DIR / "config"
AI_ENGINE_PATH = Path(__file__).resolve().parents[2] / "ai-engine"
sys.path.insert(0, str(BASE_DIR))
sys.path.insert(0, str(CONFIG_DIR))
sys.path.insert(0, str(AI_ENGINE_PATH))

from db import get_recent_readings, save_reading
from external_apis import get_routes, get_weather_for_location, weather_to_risk
from logging_config import get_logger
from models.shipment_model import build_shipment, validate_reading

logger = get_logger("chainguard.shipment_controller")

try:
    from predictor import full_prediction

    AI_AVAILABLE = True
except Exception as exc:
    AI_AVAILABLE = False
    logger.warning("Falling back because predictor import failed: %s", exc)

    def full_prediction(reading: dict) -> dict:
        speed = float(reading.get("speed_kmh", 60))
        score = 0.2 if speed >= 50 else 0.5 if speed >= 25 else 0.8
        category = "SAFE" if score < 0.4 else "WARNING" if score < 0.7 else "CRITICAL"
        color = "green" if score < 0.4 else "yellow" if score < 0.7 else "red"
        action = "MONITOR" if score < 0.4 else "RECOMMEND_REROUTE" if score < 0.7 else "AUTO_REROUTE"
        return {
            "risk_score": score,
            "risk_category": category,
            "action": action,
            "color": color,
            "priority": "LOW" if score < 0.4 else "MEDIUM" if score < 0.7 else "HIGH",
            "delay_minutes": 0 if score < 0.4 else 30 if score < 0.7 else 120,
            "eta_text": "On time" if score < 0.4 else "Delayed",
            "eta_impact": "On schedule" if score < 0.4 else "Investigate delay risk",
            "ml_predicted": False,
            "confidence": 60.0,
            "factors": ["Fallback risk scoring active because AI engine import failed."],
            "suggestions": ["Verify AI model files and dependencies before demo."],
            "gemini_explanation": "Fallback scoring mode is active.",
            "rerouting": None,
        }


def process_incoming_reading(raw_reading: dict, db) -> dict | None:
    is_valid, error = validate_reading(raw_reading)
    if not is_valid:
        logger.warning("Validation failed: %s", error)
        return None

    reading = dict(raw_reading)
    lat = float(reading.get("lat", 20.0))
    lng = float(reading.get("lng", 78.0))

    weather = get_weather_for_location(lat, lng)
    weather_risk, weather_reason = weather_to_risk(weather)
    existing_event = reading.get("external_event")

    if weather_risk > 0.10:
        if existing_event:
            existing_severity = float(existing_event.get("severity", 0.0))
            if weather_risk >= existing_severity:
                reading["external_event"] = {
                    "name": weather_reason,
                    "severity": weather_risk,
                    "source": "openweathermap",
                }
        else:
            reading["external_event"] = {
                "name": weather_reason,
                "severity": weather_risk,
                "source": "openweathermap",
            }

    ai_result = full_prediction(reading)
    rerouting = None
    if float(ai_result.get("risk_score", 0.0)) >= 0.40:
        rerouting = get_routes(lat, lng, reading.get("destination", "Delhi"))
        ai_result["rerouting"] = rerouting

    complete = build_shipment(
        raw_reading=reading,
        ai_result=ai_result,
        weather=weather,
        rerouting=rerouting,
    )
    save_reading(db, complete)
    return complete


def get_shipment_history(db, shipment_id: str, limit: int = 20) -> list[dict]:
    readings = get_recent_readings(db, shipment_id, limit=limit)
    return [
        {
            "timestamp": reading.get("timestamp") or reading.get("processed_at", ""),
            "risk_score": reading.get("risk_score", 0.0),
            "action": reading.get("action", "MONITOR"),
            "delay_minutes": reading.get("delay_minutes", 0),
        }
        for reading in readings
    ]
