# ChainGuard Backend

Production-minded backend for the ChainGuard logistics risk platform.

## What This Backend Does

- receives shipment telemetry through REST and MQTT
- validates incoming payloads with Pydantic
- enriches telemetry with weather and route intelligence
- calls the AI engine for risk and delay analysis
- emits live updates with Socket.IO
- persists data using:
  1. Google Cloud Storage
  2. MongoDB
  3. in-memory fallback

## Core Files

- `app.py`: Flask + Socket.IO bootstrap
- `config/db.py`: persistence layer
- `config/external_apis.py`: weather and routing integrations
- `config/mqtt_subscriber.py`: MQTT subscriber for live telemetry ingestion
- `routes/`: REST endpoints
- `controllers/`: business logic
- `models/`: payload normalization

## Local Setup

```powershell
cd "backend"
pip install -r requirements_backend.txt
python app.py
```

## Environment

The backend loads environment variables from:

1. `backend/.env`
2. project-root `.env`

Start from `.env.example` and create `backend/.env`.

## Required Environment

### MongoDB

```env
MONGO_URI=mongodb+srv://<username>:<password>@<cluster>/<db>?retryWrites=true&w=majority
```

### MQTT

```env
MQTT_ENABLED=true
MQTT_BROKER_HOST=127.0.0.1
MQTT_BROKER_PORT=1883
MQTT_TOPIC=chainguard/shipments/#
MQTT_CLIENT_ID=chainguard-backend
```

### Optional Auth

```env
AUTH_REQUIRED=false
JWT_SECRET_KEY=
JWT_ISSUER=chainguard-backend
```

## Main Endpoints

- `GET /api/health`
- `GET /api/shipments`
- `GET /api/shipments/<shipment_id>`
- `GET /api/shipments/<shipment_id>/history`
- `GET /api/alerts`
- `GET /api/stats`
- `POST /api/ingest`
- `POST /api/simulate-disruption`
- `POST /api/reset`

## Local Run Flow

1. Start Mosquitto broker
2. Start this backend
3. Start `iot-simulator/mqtt_publisher.py`
4. Open `/api/shipments` or connect a frontend dashboard

## Windows Production-Style Serving

```powershell
python -m waitress --listen=0.0.0.0:5000 wsgi:application
```
