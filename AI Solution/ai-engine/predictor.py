"""
Main AI entry point used by backend.
Backend should call full_prediction(reading).
"""

from __future__ import annotations

import datetime
import os
import sys

import joblib
import numpy as np

sys.path.insert(0, os.path.dirname(__file__))

from delay_predictor import predict_delay_minutes
from gemini_explainer import explain_risk
from rerouting_engine import get_rerouting_decision
from risk_scorer import calculate_risk as rule_based_risk

_risk_model_data = None

FEATURES = [
    "speed_kmh",
    "temperature_c",
    "battery_pct",
    "humidity_pct",
    "signal_strength",
    "has_external_event",
    "event_severity",
    "hour_of_day",
    "is_rush_hour",
    "distance_remaining_km",
    "route_quality",
    "carrier_delay_rate",
    "rule_risk_score",
]


def _get_temperature_c(reading: dict) -> float:
    if "temperature_c" in reading:
        return float(reading.get("temperature_c", 24.0))
    if "initial_temperature_c" in reading:
        return float(reading.get("initial_temperature_c", 24.0))
    if "truck_temperature_c" in reading:
        return float(reading.get("truck_temperature_c", 24.0))
    return 24.0


def _extract_hour(reading: dict) -> int:
    ts = reading.get("timestamp", "")
    if "T" in ts:
        try:
            return int(ts.split("T")[1].split(":")[0])
        except (ValueError, IndexError):
            return datetime.datetime.now().hour
    return datetime.datetime.now().hour


def _compute_rule_risk_score_proxy(reading: dict) -> float:
    speed = float(reading.get("speed_kmh", 60.0))
    temp = _get_temperature_c(reading)
    battery = float(reading.get("battery_pct", 80.0))
    route = float(reading.get("route_quality", 0.0))
    ext = reading.get("external_event") or {}
    event = float(ext.get("severity", 0.0))
    hour = _extract_hour(reading)
    rush = 1.0 if (7 <= hour <= 10 or 17 <= hour <= 21) else 0.0
    score = 0.0
    if speed < 25:
        score += 0.22
    if temp > 35:
        score += 0.18
    if battery < 35:
        score += 0.14
    score += min(max(event, 0.0), 0.42)
    if route >= 2:
        score += 0.07
    score += rush * 0.05
    return round(min(1.0, max(0.0, score)), 4)


def _build_feature_vector(reading: dict, rule_risk_score: float | None = None) -> np.ndarray:
    ext = reading.get("external_event") or {}
    hour = _extract_hour(reading)
    is_rush = 1 if (7 <= hour <= 10 or 17 <= hour <= 21) else 0
    if rule_risk_score is None:
        rule_risk_score = float(reading.get("rule_risk_score", _compute_rule_risk_score_proxy(reading)))
    return np.array([[
        float(reading.get("speed_kmh", 60.0)),
        _get_temperature_c(reading),
        float(reading.get("battery_pct", 80.0)),
        float(reading.get("humidity_pct", 50.0)),
        float(reading.get("signal_strength", 80.0)),
        float(1 if ext else 0),
        float(ext.get("severity", 0)),
        float(hour),
        float(is_rush),
        float(reading.get("distance_remaining_km", 200)),
        float(reading.get("route_quality", 0)),
        float(reading.get("carrier_delay_rate", 0.1)),
        float(rule_risk_score),
    ]], dtype=float)


def _load_risk_model():
    global _risk_model_data
    if _risk_model_data is not None:
        return _risk_model_data
    path = os.path.join(os.path.dirname(__file__), "models", "risk_model.pkl")
    if os.path.exists(path):
        _risk_model_data = joblib.load(path)
        if hasattr(_risk_model_data.get("model"), "set_params"):
            try:
                _risk_model_data["model"].set_params(device="cpu")
            except Exception:
                pass
    return _risk_model_data


def _ml_risk_prediction(reading: dict, rule_risk_score: float | None = None) -> dict | None:
    bundle = _load_risk_model()
    if not bundle or "model" not in bundle:
        return None
    model = bundle["model"]
    X = _build_feature_vector(reading, rule_risk_score=rule_risk_score)
    proba = model.predict_proba(X)[0]
    critical_threshold = float(bundle.get("critical_threshold", 0.30))
    # Improve critical recall by using tuned probability threshold for class 2.
    if float(proba[2]) >= critical_threshold:
        label = 2
    else:
        label = int(model.predict(X)[0])
    risk_score = round(min(1.0, float(proba[1] * 0.55 + proba[2] * 1.0)), 3)
    confidence = round(float(np.max(proba)) * 100, 1)
    return {
        "risk_score": risk_score,
        "risk_label": label,
        "confidence": confidence,
        "probabilities": {
            "safe": round(float(proba[0]), 3),
            "warning": round(float(proba[1]), 3),
            "critical": round(float(proba[2]), 3),
        },
    }


def full_prediction(reading: dict) -> dict:
    rule_result = rule_based_risk(reading)
    ml_result = _ml_risk_prediction(reading, rule_risk_score=float(rule_result["risk_score"]))

    if ml_result:
        ml_score = ml_result["risk_score"]
        rule_score = rule_result["risk_score"]
        if abs(ml_score - rule_score) > 0.3:
            risk_score = max(ml_score, rule_score)
        else:
            risk_score = round(0.7 * ml_score + 0.3 * rule_score, 3)
        ml_predicted = True
        confidence = ml_result["confidence"]
        risk_label = ml_result["risk_label"]
    else:
        risk_score = rule_result["risk_score"]
        ml_predicted = False
        confidence = 75.0
        risk_label = 0 if risk_score < 0.4 else 1 if risk_score < 0.7 else 2

    if risk_score < 0.40:
        action, color, priority, category = ("MONITOR", "green", "LOW", "SAFE")
        eta_impact = "On schedule"
    elif risk_score < 0.70:
        action, color, priority, category = ("RECOMMEND_REROUTE", "yellow", "MEDIUM", "WARNING")
        eta_impact = "Delay risk: 30-90 minutes"
    else:
        action, color, priority, category = ("AUTO_REROUTE", "red", "HIGH", "CRITICAL")
        eta_impact = "Critical delay: 2+ hours without action"

    delay_minutes = int(predict_delay_minutes(reading))
    eta_dt = datetime.datetime.now() + datetime.timedelta(minutes=delay_minutes)
    eta_text = eta_dt.strftime("%I:%M %p")

    result = {
        "risk_score": risk_score,
        "risk_label": risk_label,
        "risk_category": category,
        "action": action,
        "color": color,
        "priority": priority,
        "eta_impact": eta_impact,
        "delay_minutes": delay_minutes,
        "delay_text": f"{delay_minutes} min delay" if delay_minutes > 5 else "On time",
        "eta_text": eta_text,
        "factors": rule_result["factors"],
        "suggestions": rule_result["suggestions"],
        "ml_predicted": ml_predicted,
        "confidence": confidence,
    }
    if ml_result:
        result["probabilities"] = ml_result["probabilities"]

    result["rerouting"] = get_rerouting_decision(reading, risk_score) if risk_score >= 0.40 else None
    result["gemini_explanation"] = explain_risk(reading, result)
    return result


if __name__ == "__main__":
    test_case = {
        "shipment_id": "SHP-002",
        "origin": "Chennai",
        "destination": "Kolkata",
        "carrier": "FedEx India",
        "cargo_type": "Pharmaceuticals",
        "lat": 14.5,
        "lng": 80.5,
        "speed_kmh": 11.0,
        "temperature_c": 38.5,
        "battery_pct": 18.0,
        "humidity_pct": 80.0,
        "signal_strength": 45.0,
        "external_event": {"name": "Cyclone warning", "severity": 0.38},
        "timestamp": "2026-04-15T08:30:00Z",
    }
    print(full_prediction(test_case))
