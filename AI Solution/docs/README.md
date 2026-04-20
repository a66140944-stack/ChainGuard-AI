# ChainGuard Documentation

This documentation describes the ChainGuard prototype: an AI-powered supply chain monitoring and rerouting system with live telemetry, backend analysis, and a production-ready frontend.

## Project Overview

ChainGuard combines IoT telemetry, AI risk scoring, and smart reroute decisioning into a single logistics control center. It is designed for real-time shipment tracking and automated operational alerts.

## Repository Structure

- `backend/` – Flask API, Socket.IO server, MQTT ingestion, persistence layer, demo endpoints, and backend business logic.
- `ai-engine/` – Machine learning prediction, rule-based scoring, rerouting engine, Gemini natural language explanations, and model utilities.
- `frontend/` – Next.js dashboard prototype, shipment management UI, API integration, and fallback dummy data.
- `iot-simulator/` – Mock telemetry publisher for live shipment simulation.
- `docs/` – Documentation, architecture diagrams, flow diagrams, and presentation materials.

## Highlights

- AI risk classification with fallback mode when model or cloud APIs are unavailable.
- Real-time telemetry ingestion via MQTT and REST API.
- In-memory, MongoDB, and Google Cloud Storage persistence support.
- Frontend dashboard with shipment cards, search, and shipment creation.
- Natural language explanations via Gemini API or template fallback.
- OpenRouteService rerouting integration with mock fallback.

## Recommended Usage

1. Read `docs/setup.md` to configure your environment.
2. Run the backend from `AI Solution/backend`.
3. Run the frontend from `AI Solution/frontend`.
4. Start the simulator if you want live MQTT telemetry.

## Where to Deploy

For a global hackathon prototype, deploy as:

- Backend: **Google Cloud Run** (recommended for Flask API and managed scaling)
- Frontend: **Vercel** or **Firebase Hosting** (excellent for Next.js static/SSR apps)
- Optional Services: **MongoDB Atlas** for persistence, **Cloud Run** + **Pub/Sub** if you later upgrade MQTT ingestion.

Use the resulting public URL plus your GitHub repository link for submission.
