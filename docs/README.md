# ChainGuard Docs

This folder contains the documentation used for judging, onboarding teammates, and deployment.

## System Summary
ChainGuard is a real-time supply chain monitoring prototype that:
- Ingests GPS + sensor telemetry (REST and optional MQTT)
- Enriches telemetry with weather and routing signals
- Runs an AI pipeline: risk score + category, delay prediction, ETA impact, rerouting decision
- Produces a human-readable explanation using Gemini (Google AI) when configured
- Streams updates to the dashboard via Socket.IO

## Docs Index
- `setup.md`: local setup (backend, frontend, env keys)
- `architecture.md`: components and responsibilities
- `flow.md`: end-to-end data flow
- `api.md`: REST + socket event contract
- `model.md`: training and inference notes

## Recommended Demo Flow (Judges)
1. Sign up and login (demo auth).
2. Add a shipment in the dashboard.
3. Open "Track Shipment".
4. Open the IoT Simulator (embedded inside the tracking flow).
5. Change telemetry (temperature/speed/location) and observe:
   - AI risk score/category
   - delay/ETA
   - rerouting recommendation
   - Gemini explanation

## Add A Screenshot (Recommended)
Save a screenshot at `docs/assets/dashboard.png`. The root README will display it automatically on GitHub.
