# ChainGuard

ChainGuard is an AI-assisted logistics risk monitoring system built for hackathon/demo use. It combines live shipment telemetry, MQTT-based ingestion, backend risk analysis, rerouting support, and AI-generated operational explanations.

## Project Modules

- `backend/`: Flask API, Socket.IO updates, MongoDB/GCS persistence, MQTT subscriber, and AI-engine integration
- `ai-engine/`: prediction, rerouting, and Gemini explanation logic
- `iot-simulator/`: shipment telemetry generator and MQTT publisher
- `frontend/`: dashboard scaffold for the web prototype
- `docs/`: supporting architecture and presentation assets

## Current Working Flow

```text
iot-simulator -> Mosquitto MQTT broker -> backend -> MongoDB -> frontend/API consumers
                                      -> ai-engine inference
```

## What Is Working

- backend API is live and health-checkable
- IoT simulator publishes shipment telemetry over MQTT
- backend subscribes to MQTT topics and ingests live shipment updates
- AI engine predictions are used during ingestion
- MongoDB persistence is active

## Local Setup

### 1. Install backend dependencies

```powershell
cd "C:\Users\HP\Downloads\Backend AI Google\4-Person-Project\AI Solution\backend"
pip install -r requirements_backend.txt
```

### 2. Install AI engine dependencies if needed

```powershell
cd "C:\Users\HP\Downloads\Backend AI Google\4-Person-Project\AI Solution\ai-engine"
pip install -r requirements_ai.txt
```

### 3. Install Mosquitto

Download and install Mosquitto from [https://mosquitto.org/download/](https://mosquitto.org/download/).

Check installation:

```powershell
& "C:\Program Files\mosquitto\mosquitto.exe" -h
```

Run the broker:

```powershell
& "C:\Program Files\mosquitto\mosquitto.exe" -v
```

### 4. Configure backend environment

Use `backend/.env.example` as the template and create `backend/.env`.

Minimum recommended values:

```env
PORT=5000
AUTH_REQUIRED=false
MONGO_URI=mongodb+srv://<username>:<password>@<cluster>/<db>?retryWrites=true&w=majority
MQTT_ENABLED=true
MQTT_BROKER_HOST=127.0.0.1
MQTT_BROKER_PORT=1883
MQTT_TOPIC=chainguard/shipments/#
MQTT_CLIENT_ID=chainguard-backend
```

### 5. Start the backend

```powershell
cd "C:\Users\HP\Downloads\Backend AI Google\4-Person-Project\AI Solution\backend"
python app.py
```

### 6. Start the IoT simulator publisher

Open a second terminal:

```powershell
cd "C:\Users\HP\Downloads\Backend AI Google\4-Person-Project\AI Solution\iot-simulator"
python mqtt_publisher.py
```

## Useful URLs

- Health: `http://127.0.0.1:5000/api/health`
- Shipments: `http://127.0.0.1:5000/api/shipments`
- Alerts: `http://127.0.0.1:5000/api/alerts`
- Stats: `http://127.0.0.1:5000/api/stats`

## GitHub Safety Notes

- do not commit `backend/.env`
- commit `backend/.env.example` only
- `.env`, `**/.env`, logs, and `.vscode/` are already ignored

## Hackathon Deployment Direction

Recommended deployment split:

- frontend: Firebase Hosting
- backend API: Cloud Run
- secrets: Google Secret Manager
- data store: MongoDB Atlas
- AI service: Gemini / Vertex AI Gemini

For the hackathon submission, the final live prototype link should be the frontend website URL, not the raw backend `/api/health` endpoint.
