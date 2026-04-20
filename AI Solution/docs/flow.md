# ChainGuard Data Flow

## 1. Ingestion

### REST ingestion

- The frontend or external systems POST shipment telemetry to `/api/ingest`.
- The backend validates payloads with Pydantic and normalizes shipment data.

### MQTT ingestion

- When enabled, the backend subscribes to `chainguard/shipments/#`.
- Each incoming MQTT message is parsed, validated, and processed into the backend workflow.

## 2. Enrichment

- The backend calls `get_weather_for_location()` from `backend/config/external_apis.py`.
- Weather data is converted into risk signals using `weather_to_risk()`.
- External events such as weather alerts are attached to shipment data.

## 3. AI Scoring

- `backend/controllers/shipment_controller.py` calls `predictor.full_prediction(reading)`.
- The AI engine computes:
  - a rule-based risk score
  - an ML risk score from a trained XGBoost model
  - a blended risk score
  - delay prediction
  - reroute recommendation if risk is above threshold
  - a natural language explanation via Gemini or template fallback

## 4. Persistence

- The backend saves processed readings to the configured storage backend.
- Available storage options:
  - Google Cloud Storage
  - MongoDB
  - in-memory fallback

## 5. Real-time Notification

- The backend updates the in-memory shipment cache.
- Socket.IO broadcasts shipment updates and heartbeat events.
- The frontend receives live updates and refreshes the dashboard automatically.

## 6. Frontend Workflow

- The frontend fetches shipment data from `/api/shipments`.
- Users can view shipment cards, search active loads, and add new shipments.
- The UI gracefully falls back to dummy data if backend calls fail.
