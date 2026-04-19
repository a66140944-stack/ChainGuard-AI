# ChainGuard

ChainGuard is a 4-part logistics intelligence project for hackathon/demo use. The repository currently contains:

- `backend/`: the most complete part of the project, with Flask APIs, Socket.IO, persistence adapters, and AI-engine integration
- `ai-engine/`: model training, risk scoring, rerouting, and Gemini explanation modules
- `frontend/`: dashboard scaffold and static assets
- `iot-simulator/`: simulator scaffold for shipment telemetry
- `docs/`: architecture images

## Current State

- The backend is the primary working application layer.
- The AI engine contains real processing logic and can be called by the backend.
- The frontend and IoT simulator folders are still mostly scaffolding in this snapshot.

## Recommended Setup

Install the backend dependencies:

```powershell
cd "C:\Users\HP\Downloads\Backend AI Google\4-Person-Project\AI Solution\backend"
pip install -r requirements_backend.txt
```

If you want the AI engine training environment as well:

```powershell
cd "C:\Users\HP\Downloads\Backend AI Google\4-Person-Project\AI Solution\ai-engine"
pip install -r requirements_ai.txt
```

## Backend Environment

Start from:

```text
backend/.env.example
```

Then create:

```text
backend/.env
```

For Atlas, use a `mongodb+srv://...` connection string in `MONGO_URI`.

## GitHub Readiness Notes

- Do not commit `backend/.env`
- Rotate any secrets that were previously pasted into chat or committed locally
- The repo uses backend-owned fallback seed data because `iot-simulator/` is currently empty
- Routing works with OpenRouteService, Google Maps, or a built-in calculated fallback
