"""
Preprocess DataCo dataset into ChainGuard training schema.

Input:
  dataset/DataCoSupplyChainDataset.csv

Output:
  dataset/supply_chain_data.csv
"""

from __future__ import annotations

from pathlib import Path

import numpy as np
import pandas as pd

RNG = np.random.default_rng(42)

INPUT_FILE = Path(__file__).with_name("DataCoSupplyChainDataset.csv")
OUTPUT_FILE = Path(__file__).with_name("supply_chain_data.csv")


def _clip(series: pd.Series, low: float, high: float) -> pd.Series:
    return series.astype(float).clip(lower=low, upper=high)


def main() -> None:
    if not INPUT_FILE.exists():
        raise FileNotFoundError(f"Missing input dataset: {INPUT_FILE}")

    try:
        df = pd.read_csv(INPUT_FILE, low_memory=False, encoding="utf-8")
    except UnicodeDecodeError:
        df = pd.read_csv(INPUT_FILE, low_memory=False, encoding="latin-1")

    # Core columns used from DataCo
    late_risk = df.get("Late_delivery_risk", pd.Series(0, index=df.index)).fillna(0).astype(float)
    real_days = df.get("Days for shipping (real)", pd.Series(4, index=df.index)).fillna(4).astype(float)
    sched_days = df.get("Days for shipment (scheduled)", pd.Series(4, index=df.index)).fillna(4).astype(float)
    discount_rate = df.get("Order Item Discount Rate", pd.Series(0, index=df.index)).fillna(0).astype(float)
    quantity = df.get("Order Item Quantity", pd.Series(1, index=df.index)).fillna(1).astype(float)
    sales = df.get("Sales", pd.Series(100, index=df.index)).fillna(100).astype(float)
    lat = df.get("Latitude", pd.Series(20, index=df.index)).fillna(20).astype(float)
    lng = df.get("Longitude", pd.Series(78, index=df.index)).fillna(78).astype(float)
    shipping_mode = df.get("Shipping Mode", pd.Series("Standard Class", index=df.index)).fillna("Standard Class").astype(str)
    order_region = df.get("Order Region", pd.Series("Unknown", index=df.index)).fillna("Unknown").astype(str)
    order_dt = pd.to_datetime(df.get("order date (DateOrders)"), errors="coerce")

    # Derive features expected by ChainGuard models
    base_speed = 72 - (real_days - sched_days) * 9 - late_risk * 18 + RNG.normal(0, 7, len(df))
    speed_kmh = _clip(base_speed, 5, 120).round(1)

    temperature_c = _clip(24 + (lat.abs() / 90) * 7 + RNG.normal(0, 3, len(df)), -5, 50).round(1)

    battery_pct = _clip(88 - (real_days.clip(lower=0, upper=12) / 12) * 45 + RNG.normal(0, 10, len(df)), 10, 100).round(1)

    humidity_pct = _clip(55 + (lng.abs() / 180) * 20 + RNG.normal(0, 10, len(df)), 15, 95).round(1)

    signal_strength = _clip(82 - late_risk * 25 + RNG.normal(0, 10, len(df)), 10, 100).round(1)

    has_external_event = (late_risk > 0).astype(int)
    event_severity = _clip(0.08 + late_risk * 0.22 + discount_rate * 0.4, 0, 0.42).round(3)
    event_severity = np.where(has_external_event == 1, event_severity, 0.0)

    random_hours = pd.Series(RNG.integers(0, 24, len(df)), index=df.index)
    hour_of_day = order_dt.dt.hour.fillna(random_hours).astype(int)
    is_rush_hour = ((hour_of_day.between(7, 10)) | (hour_of_day.between(17, 21))).astype(int)

    distance_remaining_km = _clip(70 + real_days * 85 + quantity * 7 + RNG.normal(0, 30, len(df)), 10, 800).round(1)

    route_quality = pd.Series(0, index=df.index, dtype=int)
    route_quality = np.where(shipping_mode.str.contains("Same Day|First Class", case=False, na=False), 0, route_quality)
    route_quality = np.where(shipping_mode.str.contains("Second Class", case=False, na=False), 1, route_quality)
    route_quality = np.where(shipping_mode.str.contains("Standard Class", case=False, na=False), 2, route_quality)

    carrier_delay_rate = _clip(0.03 + late_risk * 0.22 + discount_rate * 0.3, 0, 0.4).round(3)

    risk_score = (
        0.28 * late_risk
        + 0.18 * (speed_kmh < 30).astype(float)
        + 0.18 * (temperature_c > 35).astype(float)
        + 0.14 * (battery_pct < 35).astype(float)
        + 0.10 * has_external_event
        + 0.07 * (route_quality == 2).astype(float)
        + 0.05 * carrier_delay_rate
        + RNG.normal(0, 0.02, len(df))
    )
    risk_score = np.clip(risk_score, 0.0, 1.0).round(4)

    risk_label = np.where(risk_score < 0.40, 0, np.where(risk_score < 0.70, 1, 2)).astype(int)

    delay_minutes = np.maximum(
        0,
        (
            (real_days - sched_days).clip(lower=0) * 24 * 60
            + late_risk * 45
            + (route_quality == 2).astype(float) * 25
            + has_external_event * (event_severity * 120)
            + RNG.normal(0, 20, len(df))
        ).round(),
    ).astype(int)

    reroute_needed = ((risk_score > 0.55) | ((has_external_event == 1) & (event_severity > 0.25))).astype(int)

    out = pd.DataFrame(
        {
            "speed_kmh": speed_kmh,
            "temperature_c": temperature_c,
            "battery_pct": battery_pct,
            "humidity_pct": humidity_pct,
            "signal_strength": signal_strength,
            "has_external_event": has_external_event,
            "event_severity": event_severity,
            "hour_of_day": hour_of_day,
            "is_rush_hour": is_rush_hour,
            "distance_remaining_km": distance_remaining_km,
            "route_quality": route_quality,
            "carrier_delay_rate": carrier_delay_rate,
            "risk_score": risk_score,
            "risk_label": risk_label,
            "delay_minutes": delay_minutes,
            "reroute_needed": reroute_needed,
        }
    )

    out.to_csv(OUTPUT_FILE, index=False)

    print(f"Input rows:  {len(df):,}")
    print(f"Output rows: {len(out):,}")
    print(f"Saved:       {OUTPUT_FILE}")
    print("Risk distribution:")
    print(f"  Safe (0):     {(out['risk_label'] == 0).sum():,}")
    print(f"  Warning (1):  {(out['risk_label'] == 1).sum():,}")
    print(f"  Critical (2): {(out['risk_label'] == 2).sum():,}")


if __name__ == "__main__":
    main()
