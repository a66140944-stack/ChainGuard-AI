"""
Simple terminal CLI to test the AI engine with user-provided inputs.

Run from repo root:
  .\.venv\Scripts\python.exe "AI Solution\ai-engine\cli_predict.py"
"""

from __future__ import annotations

import json

from predictor import full_prediction


def _prompt_float(label: str, default: float) -> float:
    raw = input(f"{label} [{default}]: ").strip()
    if not raw:
        return float(default)
    return float(raw)


def _prompt_text(label: str, default: str) -> str:
    raw = input(f"{label} [{default}]: ").strip()
    return raw or default


def main() -> int:
    print("ChainGuard AI CLI (enter values, press Enter for defaults)\n")

    temp = _prompt_float("Initial truck temperature (C)", 24.0)

    reading = {
        # Minimal fields; predictor fills defaults for the rest.
        "shipment_id": _prompt_text("Shipment ID", "SHP-CLI"),
        "origin": _prompt_text("Origin", "Chennai"),
        "destination": _prompt_text("Destination", "Kolkata"),
        "carrier": _prompt_text("Carrier", "Test Carrier"),
        "initial_temperature_c": temp,
        "speed_kmh": _prompt_float("Speed (km/h)", 60.0),
        "battery_pct": _prompt_float("Battery (%)", 80.0),
        "signal_strength": _prompt_float("Signal strength", 80.0),
    }

    result = full_prediction(reading)
    print("\nPrediction:")
    print(json.dumps(result, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

