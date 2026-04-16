"""
Fetch UCI Online Retail dataset (id=352) and convert it into
ChainGuard training schema.

Run:
    python dataset/fetch_uci_online_retail.py

Output:
    dataset/uci_supply_chain_data.csv
"""

from __future__ import annotations

from pathlib import Path

import numpy as np
import pandas as pd
from ucimlrepo import fetch_ucirepo

RNG = np.random.default_rng(42)
OUTPUT_FILE = Path(__file__).with_name("uci_supply_chain_data.csv")


def _clip(series: pd.Series, low: float, high: float) -> pd.Series:
    return series.astype(float).clip(lower=low, upper=high)


def main() -> None:
    print("Fetching UCI Online Retail (id=352)...")
    dataset = fetch_ucirepo(id=352)

    X = dataset.data.features.copy()
    if X is None or len(X) == 0:
        raise RuntimeError("UCI dataset returned no feature rows.")

    X.columns = [str(c).strip() for c in X.columns]

    # Expected columns in UCI Online Retail.
    quantity = pd.to_numeric(X.get("Quantity"), errors="coerce").fillna(1.0)
    unit_price = pd.to_numeric(X.get("UnitPrice"), errors="coerce").fillna(0.0)
    country = X.get("Country", pd.Series("Unknown", index=X.index)).fillna("Unknown").astype(str)
    customer_id = pd.to_numeric(X.get("CustomerID"), errors="coerce")
    invoice_date = pd.to_datetime(X.get("InvoiceDate"), errors="coerce")

    # Basic cleanup.
    df = pd.DataFrame(
        {
            "quantity": quantity,
            "unit_price": unit_price,
            "country": country,
            "customer_id": customer_id,
            "invoice_date": invoice_date,
        }
    )
    df = df[(df["quantity"] != 0) & (df["unit_price"] >= 0)]
    df = df.sample(min(len(df), 120_000), random_state=42)
    df = df.reset_index(drop=True)

    random_hours = pd.Series(RNG.integers(0, 24, len(df)), index=df.index)
    hour = df["invoice_date"].dt.hour.fillna(random_hours).astype(int)
    is_rush = ((hour.between(7, 10)) | (hour.between(17, 21))).astype(int)

    # Synthetic feature mapping to ChainGuard schema.
    quantity_abs = df["quantity"].abs()
    price = df["unit_price"]
    customer_missing = df["customer_id"].isna().astype(int)
    international = (df["country"].str.lower() != "united kingdom").astype(int)

    speed_kmh = _clip(78 - np.log1p(quantity_abs) * 7 - international * 6 + RNG.normal(0, 8, len(df)), 5, 120).round(1)
    temperature_c = _clip(23 + international * 3 + RNG.normal(0, 4, len(df)), -5, 50).round(1)
    battery_pct = _clip(84 - customer_missing * 18 - international * 8 + RNG.normal(0, 10, len(df)), 10, 100).round(1)
    humidity_pct = _clip(52 + international * 8 + RNG.normal(0, 12, len(df)), 15, 95).round(1)
    signal_strength = _clip(85 - international * 15 - customer_missing * 10 + RNG.normal(0, 12, len(df)), 10, 100).round(1)

    has_external_event = ((international == 1) | (customer_missing == 1)).astype(int)
    event_severity = _clip(0.05 + international * 0.18 + customer_missing * 0.11 + np.log1p(price) * 0.01, 0, 0.42).round(3)
    event_severity = np.where(has_external_event == 1, event_severity, 0.0)

    distance_remaining_km = _clip(40 + international * 260 + np.log1p(quantity_abs) * 40 + RNG.normal(0, 35, len(df)), 10, 800).round(1)
    route_quality = np.where(international == 1, 2, np.where(quantity_abs > 20, 1, 0)).astype(int)
    carrier_delay_rate = _clip(0.04 + international * 0.16 + customer_missing * 0.10 + np.log1p(quantity_abs) * 0.03, 0, 0.4).round(3)

    # Labels.
    risk_raw = (
        0.23 * (speed_kmh < 30).astype(float)
        + 0.14 * (temperature_c > 35).astype(float)
        + 0.16 * (battery_pct < 35).astype(float)
        + 0.12 * (signal_strength < 40).astype(float)
        + 0.13 * has_external_event
        + 0.10 * (route_quality == 2).astype(float)
        + 0.10 * carrier_delay_rate
        + 0.08 * (quantity_abs > 50).astype(float)
        + RNG.normal(0, 0.025, len(df))
    )
    # Percentile-normalize for healthier class spread in training.
    risk_rank = pd.Series(risk_raw).rank(pct=True)
    risk_score = np.clip(risk_rank + RNG.normal(0, 0.02, len(df)), 0.0, 1.0).round(4)
    risk_label = np.where(risk_score < 0.60, 0, np.where(risk_score < 0.85, 1, 2)).astype(int)

    delay_minutes = np.maximum(
        0,
        (
            np.log1p(quantity_abs) * 18
            + international * 120
            + customer_missing * 35
            + (route_quality == 2).astype(float) * 40
            + event_severity * 160
            + RNG.normal(0, 15, len(df))
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
            "has_external_event": has_external_event.astype(int),
            "event_severity": event_severity,
            "hour_of_day": hour,
            "is_rush_hour": is_rush.astype(int),
            "distance_remaining_km": distance_remaining_km,
            "route_quality": route_quality,
            "carrier_delay_rate": carrier_delay_rate,
            "risk_score": risk_score,
            "risk_label": risk_label,
            "delay_minutes": delay_minutes,
            "reroute_needed": reroute_needed.astype(int),
        }
    )

    out.to_csv(OUTPUT_FILE, index=False)
    print(f"Saved: {OUTPUT_FILE}")
    print(f"Rows:  {len(out):,}")
    print("Risk distribution:")
    print(f"  Safe (0):     {(out['risk_label'] == 0).sum():,}")
    print(f"  Warning (1):  {(out['risk_label'] == 1).sum():,}")
    print(f"  Critical (2): {(out['risk_label'] == 2).sum():,}")


if __name__ == "__main__":
    main()
