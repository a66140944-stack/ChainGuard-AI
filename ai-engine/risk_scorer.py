"""
Rule-based risk scoring fallback.
Always available even if ML model files are missing.
"""

from __future__ import annotations


def _get_temperature_c(reading: dict) -> float:
    if "temperature_c" in reading:
        return float(reading.get("temperature_c", 24.0))
    if "initial_temperature_c" in reading:
        return float(reading.get("initial_temperature_c", 24.0))
    if "truck_temperature_c" in reading:
        return float(reading.get("truck_temperature_c", 24.0))
    return 24.0


def calculate_risk(reading: dict) -> dict:
    speed = float(reading.get("speed_kmh", 60))
    temp = _get_temperature_c(reading)
    battery = float(reading.get("battery_pct", 80))
    signal = float(reading.get("signal_strength", 80))
    external_event = reading.get("external_event") or {}
    event_severity = float(external_event.get("severity", 0.0))
    distance_remaining = float(reading.get("distance_remaining_km", 200))

    risk = 0.0
    factors = []
    suggestions = []

    if speed < 8:
        risk += 0.38
        factors.append("Vehicle speed is critically low.")
        suggestions.append("Contact driver immediately and verify blockage or breakdown.")
    elif speed < 25:
        risk += 0.24
        factors.append("Vehicle speed is unusually low.")
        suggestions.append("Monitor traffic conditions and prepare alternate routing.")
    elif speed < 45:
        risk += 0.13
        factors.append("Vehicle is moving slower than planned.")
    elif speed > 100:
        risk += 0.10
        factors.append("Vehicle speed is above safe operating threshold.")
        suggestions.append("Advise safer speed to reduce cargo and safety risk.")

    if temp > 38:
        risk += 0.26
        factors.append("Cargo temperature exceeds critical threshold.")
        suggestions.append("Inspect cooling system and prioritize temperature-sensitive cargo.")
    elif temp > 33:
        risk += 0.16
        factors.append("Cargo temperature is trending high.")
    elif temp < 2:
        risk += 0.20
        factors.append("Cargo temperature is below acceptable lower bound.")

    if battery < 12:
        risk += 0.22
        factors.append("Tracker battery is critically low.")
        suggestions.append("Arrange immediate charging or tracker replacement.")
    elif battery < 35:
        risk += 0.11
        factors.append("Tracker battery is low.")

    if signal < 35:
        risk += 0.10
        factors.append("Signal strength is weak, reducing tracking reliability.")

    if event_severity > 0:
        risk += event_severity
        event_name = external_event.get("name", "external disruption")
        factors.append(f"External event detected: {event_name} (severity {event_severity:.2f}).")
        suggestions.append("Review weather/traffic alerts and increase monitoring frequency.")

    if distance_remaining > 500:
        risk += 0.04
        factors.append("Long remaining route increases uncertainty.")

    risk = max(0.0, min(1.0, round(risk, 3)))

    if risk < 0.40:
        action = "MONITOR"
    elif risk < 0.70:
        action = "RECOMMEND_REROUTE"
        suggestions.append("Evaluate alternate route to reduce delay risk.")
    else:
        action = "AUTO_REROUTE"
        suggestions.append("Trigger urgent escalation to operations team.")

    if not factors:
        factors = ["All monitored parameters are within expected limits."]
    if not suggestions:
        suggestions = ["Continue standard monitoring cadence."]

    return {
        "risk_score": risk,
        "factors": factors,
        "suggestions": suggestions,
        "action": action,
    }
