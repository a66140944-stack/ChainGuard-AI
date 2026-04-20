# ChainGuard: Intelligent Supply Chain AI Prototype 🚚🤖

ChainGuard is an AI-powered supply chain monitoring platform built to help logistics operations teams detect risk, predict delays, and recommend smarter routes in real time.

This repository contains the full prototype for a hackathon-ready logistics solution, including:

- a **Flask backend** with telemetry ingestion, risk scoring, and Socket.IO updates
- an **AI engine** for risk classification, delay estimation, and rerouting
- a **Next.js frontend** dashboard for operations visibility
- an **IoT simulator** for publishing sample shipment telemetry via MQTT
- documentation and deployment guidance for submission

## 🚀 What ChainGuard Does

- Ingests shipment telemetry from REST or MQTT sources
- Computes hybrid risk scores using both ML and rule-based logic
- Predicts shipment delays and estimated arrival times
- Recommends alternate routes when risk becomes elevated
- Provides human-friendly explanations via Gemini or template fallback
- Streams live shipment updates to the frontend dashboard

## 🎯 Key Features

- **Hybrid AI Architecture**: Combines XGBoost prediction, rule-based safety checks, and model fallback.
- **Smart rerouting**: Generates alternate route options when risk exceeds the defined threshold.
- **Live telemetry**: Supports MQTT ingestion and REST API ingestion.
- **Fallback reliability**: Works without Gemini, OpenRouteService, or persistent storage.
- **Demo-ready UI**: Includes a Next.js dashboard with shipment cards, search, and add-shipment workflows.

## 📁 Repository Structure

```text
├── AI Solution/                # Main prototype codebase
│   ├── backend/                # API and real-time backend services
│   ├── ai-engine/              # Risk scoring, delay prediction, rerouting, explanations
│   ├── frontend/               # Next.js dashboard and UI
│   ├── iot-simulator/          # MQTT telemetry publisher and simulator scripts
│   └── docs/                   # Architecture, flow, and presentation assets
└── README.md                   # Project overview and starter guide
```

## 🧭 Quick Start

### 1. Run the backend

```powershell
cd "AI Solution/backend"
pip install -r requirements_backend.txt
python app.py
```

### 2. Run the frontend

```powershell
cd "AI Solution/frontend"
npm install
npm run dev
```

### 3. Optional: run the simulator

```powershell
cd "AI Solution/iot-simulator"
python mqtt_publisher.py
```

### 4. Open the dashboard

Visit **[http://localhost:3000](http://localhost:3000)** in your browser.

## 🛠 Environment Configuration

Create `AI Solution/backend/.env` using `AI Solution/backend/.env.example` as a starting point.

Minimum recommended values:

```env
PORT=5000
AUTH_REQUIRED=false
MONGO_URI=mongodb://localhost:27017/chainguard
MQTT_ENABLED=false
MQTT_BROKER_HOST=127.0.0.1
MQTT_BROKER_PORT=1883
MQTT_TOPIC=chainguard/shipments/#
MQTT_CLIENT_ID=chainguard-backend
```

## 📦 Deployment Recommendations

For a hackathon submission, use hosted services so the prototype can be accessed publicly.

- **Frontend**: Vercel or Firebase Hosting
- **Backend**: Google Cloud Run
- **Database**: MongoDB Atlas or Google Cloud Storage
- **Secrets**: Google Secret Manager or environment variables

## 📌 Submission Guidance

Submit the public frontend URL as your live prototype link, along with the GitHub repository URL.

Include notes that the backend supports:

- `GET /api/health`
- `GET /api/shipments`
- `POST /api/ingest`
- `GET /api/shipments/<shipment_id>/history`

## 💡 Notes for Developers

- The AI engine entry point is `AI Solution/ai-engine/predictor.py`
- The backend is implemented in `AI Solution/backend/app.py`
- The frontend is implemented in `AI Solution/frontend/app/page.js`

## 📘 Additional Documentation

See `AI Solution/docs/README.md` for full architecture, setup, and presentation guidance.
