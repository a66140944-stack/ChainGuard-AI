"""
Run predictions for a scenario that contains initial + changing conditions.

Usage (from repo root):
  .\.venv\Scripts\python.exe "AI Solution\ai-engine\run_scenario.py"

Or with a custom file:
  .\.venv\Scripts\python.exe "AI Solution\ai-engine\run_scenario.py" "AI Solution\ai-engine\scenario.json"
"""

from __future__ import annotations

import json
import os
import sys
from typing import Any

from predictor import full_prediction


def _load_json(path: str) -> dict[str, Any]:
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)


def main(argv: list[str]) -> int:
    default_path = os.path.join(os.path.dirname(__file__), "scenario.json")
    scenario_path = argv[1] if len(argv) > 1 else default_path

    scenario = _load_json(scenario_path)
    initial = dict(scenario.get("initial") or {})
    current_delta = dict(scenario.get("current") or {})
    current = {**initial, **current_delta}

    print(f"Scenario file: {scenario_path}\n")

    print("INITIAL:")
    print(json.dumps(full_prediction(initial), indent=2))

    print("\nCURRENT (initial + changes):")
    print(json.dumps(full_prediction(current), indent=2))

    return 0


if __name__ == "__main__":
    raise SystemExit(main(sys.argv))

