"""
Synthetic dataset generator for ChainGuard AI engine.

Run:
    python generate_dataset.py

Output:
    supply_chain_data.csv in the same folder
"""

from __future__ import annotations

import random
from pathlib import Path

import numpy as np
import pandas as pd

random.seed(42)
np.random.seed(42)

N_SAMPLES = 10_000


def generate_one_sample() -> dict:
    speed_category = random.choices(
        ["normal", "slow", "very_slow", "fast"],
        weights=[65, 20, 10, 5],
    )[0]

    if speed_category == "normal":
        speed = np.random.normal(68, 12)
    elif speed_category == "slow":
        speed = np.random.normal(38, 10)
    elif speed_category == "very_slow":
        speed = np.random.normal(12, 5)
    else:
        speed = np.random.normal(105, 8)
    speed = float(np.clip(speed, 2, 140))

    temp_type = random.choices(
        ["normal", "hot", "very_hot", "cold"],
        weights=[70, 15, 8, 7],
    )[0]
    if temp_type == "normal":
        temperature = np.random.normal(24, 4)
    elif temp_type == "hot":
        temperature = np.random.normal(33, 2)
    elif temp_type == "very_hot":
        temperature = np.random.normal(39, 2)
    else:
        temperature = np.random.normal(2, 3)
    temperature = float(np.clip(temperature, -5, 50))

    battery = float(np.random.beta(4, 1.5) * 100)
    battery = float(np.clip(battery, 10, 100))

    humidity = float(np.random.normal(55, 18))
    humidity = float(np.clip(humidity, 15, 95))

    signal = float(np.random.beta(5, 2) * 100)
    signal = float(np.clip(signal, 10, 100))

    has_event = random.random() < 0.14
    event_severity = round(random.uniform(0.15, 0.42), 3) if has_event else 0.0

    hour = random.randint(0, 23)
    is_rush = 1 if (7 <= hour <= 10 or 17 <= hour <= 21) else 0

    distance_remaining_km = random.uniform(10, 800)
    route_quality = random.choices([0, 1, 2], weights=[50, 35, 15])[0]
    carrier_delay_rate = round(random.uniform(0, 0.4), 3)

    risk = 0.0
    if speed < 8:
        risk += 0.38
    elif speed < 25:
        risk += 0.24
    elif speed < 45:
        risk += 0.13
    elif speed > 100:
        risk += 0.10

    if temperature > 38:
        risk += 0.26
    elif temperature > 33:
        risk += 0.16
    elif temperature < 2:
        risk += 0.20

    if battery < 12:
        risk += 0.22
    elif battery < 35:
        risk += 0.11

    risk += event_severity
    if is_rush:
        risk += 0.07
    if route_quality == 2:
        risk += 0.06
    risk += carrier_delay_rate * 0.10
    risk += np.random.normal(0, 0.025)
    risk = float(np.clip(risk, 0.0, 1.0))
    risk = round(risk, 4)

    if speed < 8:
        base_delay = random.uniform(90, 240)
    elif speed < 25:
        base_delay = random.uniform(40, 100)
    elif speed < 45:
        base_delay = random.uniform(15, 50)
    else:
        base_delay = random.uniform(0, 20)

    if has_event:
        base_delay += event_severity * 180
    if is_rush:
        base_delay += random.uniform(10, 35)
    if route_quality == 2:
        base_delay += random.uniform(20, 60)
    base_delay += (distance_remaining_km / 800) * 30

    delay_minutes = max(0, round(base_delay + np.random.normal(0, 8)))

    if risk < 0.40:
        risk_label = 0
    elif risk < 0.70:
        risk_label = 1
    else:
        risk_label = 2

    reroute_needed = 1 if (risk > 0.55 or (has_event and event_severity > 0.25)) else 0

    return {
        "speed_kmh": round(speed, 1),
        "temperature_c": round(temperature, 1),
        "battery_pct": round(battery, 1),
        "humidity_pct": round(humidity, 1),
        "signal_strength": round(signal, 1),
        "has_external_event": int(has_event),
        "event_severity": event_severity,
        "hour_of_day": hour,
        "is_rush_hour": is_rush,
        "distance_remaining_km": round(distance_remaining_km, 1),
        "route_quality": route_quality,
        "carrier_delay_rate": carrier_delay_rate,
        "risk_score": risk,
        "risk_label": risk_label,
        "delay_minutes": delay_minutes,
        "reroute_needed": reroute_needed,
    }


def main() -> None:
    print(f"Generating {N_SAMPLES} training samples...")
    rows = [generate_one_sample() for _ in range(N_SAMPLES)]
    df = pd.DataFrame(rows)

    print("\nDataset statistics")
    print("-" * 40)
    print(f"Total samples: {len(df)}")
    print("Risk distribution:")
    print(f"  Safe (0):     {(df['risk_label'] == 0).sum():,} ({(df['risk_label'] == 0).mean() * 100:.1f}%)")
    print(f"  Warning (1):  {(df['risk_label'] == 1).sum():,} ({(df['risk_label'] == 1).mean() * 100:.1f}%)")
    print(f"  Critical (2): {(df['risk_label'] == 2).sum():,} ({(df['risk_label'] == 2).mean() * 100:.1f}%)")
    print(f"Avg delay:      {df['delay_minutes'].mean():.1f} min")
    print(f"Max delay:      {df['delay_minutes'].max()} min")
    print(f"Reroute needed: {df['reroute_needed'].mean() * 100:.1f}%")

    output_path = Path(__file__).with_name("supply_chain_data.csv")
    df.to_csv(output_path, index=False)
    print(f"\nSaved: {output_path}")
    print(f"Shape: {df.shape[0]:,} rows x {df.shape[1]} columns")


if __name__ == "__main__":
    main()
