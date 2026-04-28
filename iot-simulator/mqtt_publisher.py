"""
Publishes simulated shipment readings to an MQTT broker.
"""

from __future__ import annotations

import importlib.util
import json
import os
import time
from pathlib import Path

import paho.mqtt.client as mqtt

from simulator import generate_sensor_reading

CONFIG_PATH = Path(__file__).with_name("config.py")
CONFIG_SPEC = importlib.util.spec_from_file_location("iot_simulator_config", CONFIG_PATH)
CONFIG_MODULE = importlib.util.module_from_spec(CONFIG_SPEC)
assert CONFIG_SPEC is not None and CONFIG_SPEC.loader is not None
CONFIG_SPEC.loader.exec_module(CONFIG_MODULE)

REFRESH_INTERVAL = CONFIG_MODULE.REFRESH_INTERVAL
SHIPMENTS = CONFIG_MODULE.SHIPMENTS

MQTT_BROKER_HOST = os.getenv("MQTT_BROKER_HOST", "127.0.0.1")
MQTT_BROKER_PORT = int(os.getenv("MQTT_BROKER_PORT", "1883"))
MQTT_TOPIC_PREFIX = os.getenv("MQTT_TOPIC_PREFIX", "chainguard/shipments")
MQTT_CLIENT_ID = os.getenv("MQTT_CLIENT_ID", "chainguard-simulator")
MQTT_USERNAME = os.getenv("MQTT_USERNAME", "")
MQTT_PASSWORD = os.getenv("MQTT_PASSWORD", "")
MQTT_KEEPALIVE = int(os.getenv("MQTT_KEEPALIVE", "60"))


def create_client() -> mqtt.Client:
    """
    Create and connect an MQTT client.
    """
    client_kwargs = {"client_id": MQTT_CLIENT_ID}
    if hasattr(mqtt, "CallbackAPIVersion"):
        client_kwargs["callback_api_version"] = mqtt.CallbackAPIVersion.VERSION2
    client = mqtt.Client(**client_kwargs)
    if MQTT_USERNAME:
        client.username_pw_set(MQTT_USERNAME, MQTT_PASSWORD)
    client.connect(MQTT_BROKER_HOST, MQTT_BROKER_PORT, MQTT_KEEPALIVE)
    client.loop_start()
    return client


def publish_reading(client: mqtt.Client, reading: dict) -> bool:
    """
    Publish one reading as JSON to a shipment-specific topic.
    """
    topic = f"{MQTT_TOPIC_PREFIX}/{reading['shipment_id']}"
    payload = json.dumps(reading)

    result = client.publish(topic, payload=payload, qos=1)
    result.wait_for_publish()
    if result.rc == mqtt.MQTT_ERR_SUCCESS:
        print(f"[OK] {reading['shipment_id']} -> {topic}")
        return True

    print(f"[ERROR] {reading['shipment_id']} -> publish rc={result.rc}")
    return False


def publish_all_readings(client: mqtt.Client) -> tuple[int, int]:
    """
    Generate and publish one batch for all configured shipments.
    """
    success_count = 0
    failure_count = 0

    for shipment in SHIPMENTS:
        reading = generate_sensor_reading(shipment)
        if publish_reading(client, reading):
            success_count += 1
        else:
            failure_count += 1

    return success_count, failure_count


if __name__ == "__main__":
    print("IoT publisher running...")
    print(f"Broker: {MQTT_BROKER_HOST}:{MQTT_BROKER_PORT}")
    print(f"Topic prefix: {MQTT_TOPIC_PREFIX}")
    client = create_client()
    try:
        while True:
            success_count, failure_count = publish_all_readings(client)
            print(f"Batch complete: success={success_count} failed={failure_count}")
            print("---")
            time.sleep(REFRESH_INTERVAL)
    finally:
        client.loop_stop()
        client.disconnect()
