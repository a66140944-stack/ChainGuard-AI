"""
Gemini-based natural language explainer.
Falls back to template text if API key/package is unavailable.
"""

from __future__ import annotations

import os
import time

from dotenv import load_dotenv
import warnings

# Suppress the FutureWarnings from GenAI and XGBoost for cleaner terminal output
warnings.filterwarnings("ignore", category=FutureWarning)
warnings.filterwarnings("ignore", category=UserWarning)

load_dotenv()
GEMINI_KEY = os.getenv("GEMINI_API_KEY", "")

GEMINI_AVAILABLE = False
genai = None
gemini_model = None

try:
    import google.generativeai as _genai

    genai = _genai
    if GEMINI_KEY:
        genai.configure(api_key=GEMINI_KEY)
        gemini_model = genai.GenerativeModel("gemini-1.5-flash")
        GEMINI_AVAILABLE = True
except Exception:
    GEMINI_AVAILABLE = False

_cache: dict[str, tuple[float, str]] = {}
_cache_timeout_sec = 30


def _template_explain(shipment_data: dict, risk_result: dict) -> str:
    sid = shipment_data.get("shipment_id", "?")
    origin = shipment_data.get("origin", "?")
    dest = shipment_data.get("destination", "?")
    carrier = shipment_data.get("carrier", "?")
    risk_score = risk_result.get("risk_score", 0)
    delay_min = risk_result.get("delay_minutes", 0)
    action = risk_result.get("action", "MONITOR")
    factors = risk_result.get("factors", [])
    suggestions = risk_result.get("suggestions", [])

    level = "CRITICAL" if risk_score >= 0.7 else "WARNING" if risk_score >= 0.4 else "SAFE"
    factor = factors[0] if factors else "multiple anomalies detected"
    suggestion = suggestions[0] if suggestions else "Continue monitoring."
    return (
        f"[{level}] Shipment {sid} ({origin} -> {dest}, {carrier}) has risk score {risk_score}. "
        f"Primary concern: {factor} Action: {action}. "
        f"Predicted delay is {delay_min} minutes. Recommendation: {suggestion}"
    )


def _gemini_explain(shipment_data: dict, risk_result: dict) -> str:
    sid = shipment_data.get("shipment_id", "?")
    origin = shipment_data.get("origin", "?")
    dest = shipment_data.get("destination", "?")
    carrier = shipment_data.get("carrier", "?")
    speed = shipment_data.get("speed_kmh", 0)
    temp = shipment_data.get("temperature_c", 0)
    battery = shipment_data.get("battery_pct", 0)
    risk = risk_result.get("risk_score", 0)
    delay = risk_result.get("delay_minutes", 0)
    action = risk_result.get("action", "MONITOR")
    factors = "; ".join(risk_result.get("factors", []))
    suggestions = "; ".join(risk_result.get("suggestions", []))

    prompt = f"""
You are a logistics AI assistant for ChainGuard.
Write a concise 2-3 sentence alert explanation for operations managers.

Shipment ID: {sid}
Route: {origin} to {dest}
Carrier: {carrier}
Speed: {speed} km/h
Temperature: {temp} C
Battery: {battery}%
Risk score: {risk}/1.0
Predicted delay: {delay} minutes
Action required: {action}
Risk factors: {factors}
Recommendations: {suggestions}
"""
    try:
        response = gemini_model.generate_content(
            prompt,
            generation_config=genai.GenerationConfig(max_output_tokens=120, temperature=0.3),
        )
        text = getattr(response, "text", None)
        if text:
            return text.strip()
    except Exception:
        pass
    return _template_explain(shipment_data, risk_result)


def explain_risk(shipment_data: dict, risk_result: dict) -> str:
    sid = shipment_data.get("shipment_id", "unknown")
    risk_score = round(float(risk_result.get("risk_score", 0.0)), 2)
    cache_key = f"{sid}:{risk_score}"
    now = time.time()

    cached = _cache.get(cache_key)
    if cached and (now - cached[0] < _cache_timeout_sec):
        return cached[1]

    if GEMINI_AVAILABLE and gemini_model is not None:
        explanation = _gemini_explain(shipment_data, risk_result)
    else:
        explanation = _template_explain(shipment_data, risk_result)

    _cache[cache_key] = (now, explanation)
    return explanation
