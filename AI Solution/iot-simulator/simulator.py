"""
Simulates IoT sensor data emitted by shipment tracking devices.
"""

from __future__ import annotations

import importlib.util
import random
import time
from pathlib import Path

CONFIG_PATH = Path(__file__).with_name("config.py")
CONFIG_SPEC = importlib.util.spec_from_file_location("iot_simulator_config", CONFIG_PATH)
CONFIG_MODULE = importlib.util.module_from_spec(CONFIG_SPEC)
assert CONFIG_SPEC is not None and CONFIG_SPEC.loader is not None
CONFIG_SPEC.loader.exec_module(CONFIG_MODULE)

REFRESH_INTERVAL = CONFIG_MODULE.REFRESH_INTERVAL
SHIPMENTS = CONFIG_MODULE.SHIPMENTS

EXTERNAL_EVENTS = [
    {"name": "Cyclone warning on eastern corridor", "severity": 0.35},
    {"name": "Road accident blocking NH-44", "severity": 0.28},
    {"name": "Dense fog - visibility < 50m", "severity": 0.22},
    {"name": "Protest blocking state highway", "severity": 0.20},
    {"name": "Flash floods reported on route", "severity": 0.38},
    {"name": "Bridge closure - weight restriction", "severity": 0.25},
]


def generate_reading(shipment: dict) -> dict:
    """
    Generate one simulated sensor reading for a shipment.
    """
    current_lat = shipment["lat"] + random.uniform(-0.2, 0.2)
    current_lng = shipment["lng"] + random.uniform(-0.2, 0.2)

    if random.random() < 0.80:
        speed = random.uniform(
            shipment["normal_speed_min"],
            shipment["normal_speed_max"],
        )
    else:
        speed = random.choice(
            [
                random.uniform(5, 30),
                random.uniform(95, 120),
            ]
        )

    temperature = random.uniform(12, 40)
    battery = random.uniform(20, 100)
    humidity = random.uniform(25, 85)
    signal_strength = random.uniform(40, 100)

    external_event = None
    if random.random() < 0.15:
        external_event = random.choice(EXTERNAL_EVENTS)

    return {
        "shipment_id": shipment["id"],
        "origin": shipment["origin"],
        "destination": shipment["destination"],
        "carrier": shipment["carrier"],
        "lat": round(current_lat, 6),
        "lng": round(current_lng, 6),
        "speed_kmh": round(speed, 1),
        "temperature_c": round(temperature, 1),
        "battery_pct": round(battery, 1),
        "humidity_pct": round(humidity, 1),
        "signal_strength": round(signal_strength, 1),
        "external_event": external_event,
        "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
    }


def generate_sensor_reading(shipment: dict) -> dict:
    """
    Compatibility wrapper for the existing backend import.
    """
    return generate_reading(shipment)


def get_all_readings() -> list[dict]:
    """
    Return sensor readings for all shipments.
    """
    return [generate_reading(shipment) for shipment in SHIPMENTS]


if __name__ == "__main__":
    print("IoT Simulator running...")
    while True:
        readings = get_all_readings()
        for reading in readings:
            print(
                f"[{reading['shipment_id']}] "
                f"Speed:{reading['speed_kmh']} "
                f"Temp:{reading['temperature_c']} "
                f"Bat:{reading['battery_pct']}"
            )
        print("---")
        time.sleep(REFRESH_INTERVAL)
