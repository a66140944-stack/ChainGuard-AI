# ChainGuard Backend

Production-minded backend for the ChainGuard logistics risk platform.

## What This Backend Does

- receives shipment telemetry through REST
- validates incoming payloads with Pydantic
- enriches data with weather and route intelligence
- calls the AI engine for risk and delay analysis
- publishes live updates with Socket.IO
- persists data using:
  1. Google Cloud Storage
  2. MongoDB
  3. in-memory fallback
- supports routing via OpenRouteService, Google Maps, or a calculated fallback

## Backend Layout

- `app.py`: Flask + Socket.IO bootstrap
- `config/`: persistence, security, logging, external APIs, rate limiting
- `controllers/`: business logic
- `models/`: payload normalization
- `routes/`: REST API endpoints
- `schemas/`: request validation
- `tests/`: starter API tests
- `wsgi.py`: WSGI entrypoint

## Local Setup

```powershell
cd "C:\Users\HP\Downloads\Backend AI Google\4-Person-Project\AI Solution\backend"
pip install -r requirements_backend.txt
python app.py
```

## Environment

The backend reads environment variables from:

1. `backend/.env`
2. project-root `.env`

Start by editing `backend/.env`.

## Required Installs

### Python packages

Install everything with:

```powershell
pip install -r requirements_backend.txt
```

### MongoDB Atlas

For the cleanest hackathon setup, use MongoDB Atlas free tier:

- create a free Atlas cluster
- create a database user
- allow your IP in Atlas Network Access
- put the `mongodb+srv://...` URI in `MONGO_URI`

Atlas SRV connections require the dependencies in `requirements_backend.txt`, including `dnspython`.

### Google Cloud Storage

For GCS persistence you need:

- a GCP project
- a storage bucket
- a service account key JSON
- `GCS_BUCKET_NAME` and `GOOGLE_APPLICATION_CREDENTIALS` set in `.env`

## Auth

JWT auth is optional and controlled by:

- `AUTH_REQUIRED=true`
- `JWT_SECRET_KEY`
- `JWT_ISSUER`

When auth is disabled, the backend still runs for local development and demos.

## Saas-Oriented Improvements Already Added

- structured logging
- env-driven CORS
- optional JWT auth
- request validation
- global error handling
- seed fallback when simulator is missing
- persistence abstraction
- WSGI entrypoint
- rate limiting hooks

## Recommended Next Installs

For a stronger local/dev experience:

```powershell
pip install -r requirements_backend.txt
```

For Windows production-style serving:

```powershell
python -m waitress --listen=0.0.0.0:5000 wsgi:application
```

## Routing Providers

The backend checks routing providers in this order:

1. `OPEN_ROUTE_SERVICE_KEY`
2. `GOOGLE_MAPS_KEY`
3. built-in calculated fallback

If you do not have Google Maps, leaving `GOOGLE_MAPS_KEY` empty is fine.

## Health Check

```text
GET /api/health
```

## Main Endpoints

- `GET /api/shipments`
- `POST /api/ingest`
- `GET /api/shipments/<shipment_id>`
- `GET /api/shipments/<shipment_id>/history`
- `GET /api/alerts`
- `GET /api/stats`
- `POST /api/simulate-disruption`
- `POST /api/reset`
