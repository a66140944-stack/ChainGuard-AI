from __future__ import annotations

from app import app


def test_health_endpoint():
    client = app.test_client()
    response = client.get("/api/health")
    assert response.status_code == 200


def test_ingest_endpoint():
    client = app.test_client()
    response = client.post(
        "/api/ingest",
        json={
            "shipment_id": "SHP-TEST-001",
            "origin": "Mumbai",
            "destination": "Delhi",
            "carrier": "BlueDart",
            "cargo_type": "Medicines",
            "lat": 19.0760,
            "lng": 72.8777,
            "speed_kmh": 44.0,
            "temperature_c": 28.0,
            "battery_pct": 75.0,
            "humidity_pct": 50.0,
            "signal_strength": 85.0,
        },
    )
    assert response.status_code == 200
    body = response.get_json()
    assert body["status"] == "ingested"
