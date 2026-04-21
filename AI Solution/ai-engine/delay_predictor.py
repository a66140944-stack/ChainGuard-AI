"""
Standalone delay prediction helper.
Used by predictor.py and can be imported independently.
"""

from __future__ import annotations

import os
import datetime
import joblib
import numpy as np

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

_model_bundle = None


def _extract_hour(reading: dict) -> int:
    ts = reading.get("timestamp", "")
    if "T" in ts:
        try:
            return int(ts.split("T")[1].split(":")[0])
        except (ValueError, IndexError):
            return datetime.datetime.now().hour
    return datetime.datetime.now().hour


def _build_feature_vector(reading: dict) -> np.ndarray:
    ext = reading.get("external_event") or {}
    hour = _extract_hour(reading)
    is_rush = 1 if (7 <= hour <= 10 or 17 <= hour <= 21) else 0
    if "rule_risk_score" in reading:
        rule_risk_score = float(reading.get("rule_risk_score", 0.3))
    else:
        speed = float(reading.get("speed_kmh", 60.0))
        temp = float(reading.get("temperature_c", 24.0))
        battery = float(reading.get("battery_pct", 80.0))
        route = float(reading.get("route_quality", 0.0))
        event = float(ext.get("severity", 0.0))
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
        score += float(is_rush) * 0.05
        rule_risk_score = min(1.0, max(0.0, score))
    return np.array([[
        float(reading.get("speed_kmh", 60.0)),
        float(reading.get("temperature_c", 24.0)),
        float(reading.get("battery_pct", 80.0)),
        float(reading.get("humidity_pct", 50.0)),
        float(reading.get("signal_strength", 80.0)),
        float(1 if ext else 0),
        float(ext.get("severity", 0.0)),
        float(hour),
        float(is_rush),
        float(reading.get("distance_remaining_km", 200.0)),
        float(reading.get("route_quality", 0)),
        float(reading.get("carrier_delay_rate", 0.1)),
        float(rule_risk_score),
    ]], dtype=float)


def _load_delay_model():
    global _model_bundle
    if _model_bundle is not None:
        return _model_bundle
    model_path = os.path.join(os.path.dirname(__file__), "models", "delay_model.pkl")
    if os.path.exists(model_path):
        _model_bundle = joblib.load(model_path)
        if hasattr(_model_bundle.get("model"), "set_params"):
            try:
                _model_bundle["model"].set_params(device="cpu")
            except Exception:
                pass
    return _model_bundle


def predict_delay_minutes(reading: dict) -> int:
    bundle = _load_delay_model()
    if bundle and "model" in bundle:
        model = bundle["model"]
        pred = float(model.predict(_build_feature_vector(reading))[0])
        if bundle.get("use_log_target", False):
            pred = float(np.expm1(pred))
        return max(0, round(pred))

    speed = float(reading.get("speed_kmh", 60.0))
    if speed < 15:
        return 120
    if speed < 35:
        return 55
    if speed < 50:
        return 20
    return 5
