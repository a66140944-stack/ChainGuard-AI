# ChainGuard Architecture

## Core Components

### 1. Frontend

- Built with **Next.js** using the `/app` directory.
- Provides a responsive dashboard with shipment overview, search, and add shipment workflow.
- Integrates with backend REST APIs and uses a React context (`ShipmentContext`) to manage shipment state.
- Supports fallback dummy data when API connectivity is unavailable.

### 2. Backend

- Built with **Flask** and **Flask-SocketIO**.
- Exposes REST APIs for:
  - `/api/health`
  - `/api/shipments`
  - `/api/shipments/<shipment_id>`
  - `/api/shipments/<shipment_id>/history`
  - `/api/ingest`
- Supports live MQTT ingestion via `backend/config/mqtt_subscriber.py` if `MQTT_ENABLED=true`.
- Stores data using:
  - Google Cloud Storage if configured
  - MongoDB if available
  - In-memory fallback otherwise
- Emits real-time updates using Socket.IO.

### 3. AI Engine

- Located under `AI Solution/ai-engine`.
- Main entry point is `predictor.full_prediction(reading)`.
- Combines:
  - rule-based risk scoring (`risk_scorer.py`)
  - trained ML risk model (`models/risk_model.pkl`)
  - delay prediction (`delay_predictor.py`)
  - rerouting decisioning (`rerouting_engine.py`)
  - Gemini natural language explanation (`gemini_explainer.py`)

### 4. IoT Simulator

- Located under `AI Solution/iot-simulator`.
- Generates telemetry and publishes to MQTT topics or provides sample readings for backend seeding.

## Integration Diagram

- Frontend ↔ Backend REST API
- Backend ↔ AI engine for risk and delay predictions
- Backend ↔ MQTT broker for live telemetry ingestion
- Backend ↔ MongoDB / GCS for persistence
- Backend ↔ Socket.IO for live updates to the frontend

## Deployment Recommendation

- **Frontend**: Vercel or Firebase Hosting
- **Backend**: Google Cloud Run
- **Database**: MongoDB Atlas or Google Cloud Firestore / Storage
- **MQTT Broker**: Mosquitto for local demo, or managed broker for production

Use a public deployment URL for hackathon submission and link it to your GitHub repo.
