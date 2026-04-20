# ChainGuard Setup Guide

## Prerequisites

- Python 3.11+ or 3.13
- Node.js 18+ (for frontend)
- npm
- Git
- Optional: Mosquitto MQTT broker
- Optional: MongoDB Atlas or local MongoDB server
- Optional: Google Cloud account for deployment

## 1. Install Python Dependencies

Open a terminal in `AI Solution/backend`:

```powershell
cd "AI Solution/backend"
pip install -r requirements_backend.txt
```

Open a terminal in `AI Solution/ai-engine` (if needed):

```powershell
cd "AI Solution/ai-engine"
pip install -r requirements_ai.txt
```

## 2. Install Frontend Dependencies

Open a terminal in `AI Solution/frontend`:

```powershell
cd "AI Solution/frontend"
npm install
```

## 3. Configure Environment

Create `AI Solution/backend/.env` based on `.env.example` and set values:

```env
MQTT_ENABLED=true
MQTT_BROKER_HOST=127.0.0.1
MQTT_BROKER_PORT=1883
MQTT_TOPIC=chainguard/shipments/#
MQTT_CLIENT_ID=chainguard-backend
MONGO_URI=mongodb://localhost:27017/chainguard
AUTH_REQUIRED=false
JWT_SECRET_KEY=secret
```

Optional environment variables for AI and rerouting:

```env
OPEN_ROUTE_SERVICE_KEY=<your_openrouteservice_key>
GEMINI_API_KEY=<your_gemini_api_key>
GCS_BUCKET_NAME=<your_gcs_bucket>
```

## 4. Run the Backend

```powershell
cd "AI Solution/backend"
python app.py
```

The backend will start at **[http://localhost:5000](http://localhost:5000)**.

## 5. Run the Frontend

```powershell
cd "AI Solution/frontend"
npm run dev
```

The frontend will start at **[http://localhost:3000](http://localhost:3000)**.

## 6. Optional: Run the Simulator

If MQTT is enabled and Mosquitto is running, start the simulator:

```powershell
cd "AI Solution/iot-simulator"
python simulator.py
```

## 7. Test the API

- Health check: [`http://localhost:5000/api/health`](http://localhost:5000/api/health)
- Shipments list: `http://localhost:5000/api/shipments`
- Add shipment: `POST http://localhost:5000/api/ingest`

## Deployment Notes

For hackathon submission, use a public deployment URL. Recommended options:

- Frontend: **Vercel** or **Firebase Hosting**
- Backend: **Google Cloud Run**
- Database: **MongoDB Atlas** or **Google Cloud Storage**

Use the deployed frontend URL and GitHub repository link as your submission assets.
