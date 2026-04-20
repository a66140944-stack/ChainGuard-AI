# ChainGuard API Reference

## Base URL

The backend API runs on **[http://localhost:5000](http://localhost:5000)** by default.

## Endpoints

### GET /api/health

Returns application health status.

#### Health response

```json
{
  "status": "ok"
}
```

### GET /api/shipments

Returns the current in-memory shipment list sorted by risk score.

#### Shipments response

```json
[
  {
    "shipment_id": "SHP-001",
    "origin": "Mumbai",
    "destination": "Delhi",
    "risk_score": 0.42,
    "action": "RECOMMEND_REROUTE",
    ...
  }
]
```

### GET /api/shipments/<shipment_id>

Fetches a single shipment record by ID.

#### Shipment response

```json
{
  "shipment_id": "SHP-001",
  "origin": "Mumbai",
  "destination": "Delhi",
  "risk_score": 0.42,
  "action": "RECOMMEND_REROUTE",
  ...
}
```

### POST /api/ingest

Ingests a new telemetry reading for a shipment.

#### Request Body

```json
{
  "shipment_id": "SHP-005",
  "origin": "Mumbai",
  "destination": "Kolkata",
  "carrier": "DHL",
  "cargo_type": "Vaccines",
  "lat": 19.0760,
  "lng": 72.8777,
  "speed_kmh": 45,
  "temperature_c": 34.2,
  "battery_pct": 62,
  "humidity_pct": 68,
  "signal_strength": 78
}
```

#### Ingest response

```json
{
  "status": "ingested",
  "shipment_id": "SHP-005",
  "risk_score": 0.58,
  "action": "RECOMMEND_REROUTE"
}
```

### GET /api/shipments/<shipment_id>/history

Returns recent history records for a shipment.

#### History response

```json
[
  {
    "timestamp": "2026-04-20T12:05:00Z",
    "risk_score": 0.58,
    "action": "RECOMMEND_REROUTE",
    "delay_minutes": 45
  }
]
```

## MQTT Ingestion

If enabled, the backend subscribes to `chainguard/shipments/#` and ingests JSON payloads that match the API schema.

### MQTT Topic Example

- `chainguard/shipments/device-001`

### Sample Payload

```json
{
  "shipment_id": "SHP-008",
  "origin": "Hyderabad",
  "destination": "Pune",
  "carrier": "FedEx",
  "cargo_type": "Electronics",
  "lat": 17.3850,
  "lng": 78.4867,
  "speed_kmh": 28.0,
  "temperature_c": 29.4,
  "battery_pct": 76.0,
  "humidity_pct": 48.0,
  "signal_strength": 90.0
}
```

## Authentication

Authentication is optional and controlled by `AUTH_REQUIRED` in the environment. By default, the app runs without authentication for easier demo deployment.
