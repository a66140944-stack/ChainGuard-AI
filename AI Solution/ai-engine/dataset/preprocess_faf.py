"""
Convert FAF5.7.1.csv into ChainGuard training schema using chunked processing.

Input:
  dataset/FAF5.7.1.csv  (copied from Downloads/FAF5.7.1)

Output:
  dataset/faf_supply_chain_data.csv
"""

from __future__ import annotations

from pathlib import Path

import numpy as np
import pandas as pd

RNG = np.random.default_rng(42)

INPUT_FILE = Path(__file__).with_name("FAF5.7.1.csv")
OUTPUT_FILE = Path(__file__).with_name("faf_supply_chain_data.csv")


def _safe_num(df: pd.DataFrame, col: str, default: float = 0.0) -> pd.Series:
    if col not in df.columns:
        return pd.Series(default, index=df.index, dtype=float)
    return pd.to_numeric(df[col], errors="coerce").fillna(default).astype(float)


def _clip(series: pd.Series, low: float, high: float) -> pd.Series:
    return series.clip(lower=low, upper=high)


def transform_chunk(df: pd.DataFrame) -> pd.DataFrame:
    tons = _safe_num(df, "tons_2024", 0.0)
    value = _safe_num(df, "value_2024", 0.0)
    tmiles = _safe_num(df, "tmiles_2024", 0.0)
    dist_band = _safe_num(df, "dist_band", 1.0)
    trade_type = _safe_num(df, "trade_type", 1.0)
    mode = _safe_num(df, "dms_mode", 1.0)
    sctg2 = _safe_num(df, "sctg2", 1.0)

    ton_density = tmiles / np.maximum(tons, 0.1)
    economic_density = value / np.maximum(tons, 0.1)

    speed_kmh = _clip(
        88 - np.log1p(ton_density) * 7 - dist_band * 1.8 - (trade_type == 2).astype(float) * 6 + RNG.normal(0, 7, len(df)),
        5,
        120,
    ).round(1)
    temperature_c = _clip(23 + (trade_type == 2).astype(float) * 4 + RNG.normal(0, 4, len(df)), -5, 50).round(1)
    battery_pct = _clip(86 - dist_band * 2.5 - np.log1p(tons) * 1.2 + RNG.normal(0, 9, len(df)), 10, 100).round(1)
    humidity_pct = _clip(52 + dist_band * 2.0 + RNG.normal(0, 11, len(df)), 15, 95).round(1)
    signal_strength = _clip(84 - dist_band * 3.2 - (mode == 7).astype(float) * 8 + RNG.normal(0, 10, len(df)), 10, 100).round(1)

    has_external_event = ((trade_type == 2) | (dist_band >= 4)).astype(int)
    event_severity = _clip(
        0.05 + (trade_type == 2).astype(float) * 0.16 + (dist_band >= 4).astype(float) * 0.12 + (mode == 7).astype(float) * 0.06,
        0,
        0.42,
    ).round(3)
    event_severity = np.where(has_external_event == 1, event_severity, 0.0)

    hour_of_day = RNG.integers(0, 24, len(df))
    is_rush_hour = ((hour_of_day >= 7) & (hour_of_day <= 10) | (hour_of_day >= 17) & (hour_of_day <= 21)).astype(int)

    distance_remaining_km = _clip(45 + dist_band * 85 + np.log1p(tmiles) * 2.2 + RNG.normal(0, 35, len(df)), 10, 800).round(1)
    route_quality = np.where(dist_band <= 2, 0, np.where(dist_band <= 4, 1, 2)).astype(int)
    carrier_delay_rate = _clip(
        0.04 + (dist_band / 12) * 0.24 + (trade_type == 2).astype(float) * 0.08 + (mode == 7).astype(float) * 0.04,
        0,
        0.4,
    ).round(3)

    risk_raw = (
        0.21 * (speed_kmh < 30).astype(float)
        + 0.14 * (temperature_c > 35).astype(float)
        + 0.15 * (battery_pct < 35).astype(float)
        + 0.12 * (signal_strength < 40).astype(float)
        + 0.12 * has_external_event
        + 0.10 * (route_quality == 2).astype(float)
        + 0.08 * carrier_delay_rate
        + 0.08 * (trade_type == 2).astype(float)
        + RNG.normal(0, 0.025, len(df))
    )
    # Percentile-normalize to keep class spread healthy.
    risk_rank = pd.Series(risk_raw).rank(pct=True)
    risk_score = np.clip(risk_rank + RNG.normal(0, 0.02, len(df)), 0.0, 1.0).round(4)
    risk_label = np.where(risk_score < 0.58, 0, np.where(risk_score < 0.84, 1, 2)).astype(int)

    delay_minutes = np.maximum(
        0,
        (
            dist_band * 14
            + np.log1p(ton_density) * 22
            + (trade_type == 2).astype(float) * 55
            + (route_quality == 2).astype(float) * 30
            + event_severity * 150
            + RNG.normal(0, 18, len(df))
        ).round(),
    ).astype(int)
    reroute_needed = ((risk_score > 0.55) | ((has_external_event == 1) & (event_severity > 0.25))).astype(int)

    return pd.DataFrame(
        {
            "speed_kmh": speed_kmh,
            "temperature_c": temperature_c,
            "battery_pct": battery_pct,
            "humidity_pct": humidity_pct,
            "signal_strength": signal_strength,
            "has_external_event": has_external_event.astype(int),
            "event_severity": event_severity,
            "hour_of_day": hour_of_day.astype(int),
            "is_rush_hour": is_rush_hour.astype(int),
            "distance_remaining_km": distance_remaining_km,
            "route_quality": route_quality.astype(int),
            "carrier_delay_rate": carrier_delay_rate,
            "risk_score": risk_score,
            "risk_label": risk_label.astype(int),
            "delay_minutes": delay_minutes,
            "reroute_needed": reroute_needed.astype(int),
        }
    )


def main() -> None:
    if not INPUT_FILE.exists():
        raise FileNotFoundError(f"Missing FAF input file: {INPUT_FILE}")

    if OUTPUT_FILE.exists():
        OUTPUT_FILE.unlink()

    chunksize = 250_000
    total_in = 0
    total_out = 0

    reader = pd.read_csv(INPUT_FILE, chunksize=chunksize, low_memory=False)
    for i, chunk in enumerate(reader, start=1):
        out = transform_chunk(chunk)
        out.to_csv(OUTPUT_FILE, mode="a", header=(i == 1), index=False)
        total_in += len(chunk)
        total_out += len(out)
        print(f"Processed chunk {i}: {len(chunk):,} rows")

    print(f"Saved: {OUTPUT_FILE}")
    print(f"Input rows:  {total_in:,}")
    print(f"Output rows: {total_out:,}")

    # Quick distribution summary
    sample = pd.read_csv(OUTPUT_FILE, nrows=200_000)
    print("Sample risk distribution:")
    print(f"  Safe (0):     {(sample['risk_label'] == 0).mean() * 100:.1f}%")
    print(f"  Warning (1):  {(sample['risk_label'] == 1).mean() * 100:.1f}%")
    print(f"  Critical (2): {(sample['risk_label'] == 2).mean() * 100:.1f}%")


if __name__ == "__main__":
    main()

