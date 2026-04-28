# ChainGuard Presentation Outline

## Slide 1 – Title

- Project name: ChainGuard
- Tagline: "AI-powered logistics risk monitoring and smart rerouting"
- Team name and hackathon details

## Slide 2 – Problem Statement

- Global supply chains face delays, temperature risk, and vehicle breakdowns.
- Operations teams need a single view to make faster decisions.

## Slide 3 – Solution Summary

- ChainGuard ingests live shipment telemetry.
- It scores risk, predicts delays, and recommends reroutes.
- It provides a dashboard for logistics operators.

## Slide 4 – Architecture

- Show `architecture.png`.
- Explain frontend, backend, AI engine, MQTT, storage, and real-time updates.

## Slide 5 – Data Flow

- Show `flow_diagram.png`.
- Walk through telemetry ingestion, AI enrichment, persistence, and UI refresh.

## Slide 6 – Core Capabilities

- Live shipment monitoring
- Risk and delay prediction
- Gemini-powered alert explanations
- Reroute recommendation
- In-memory / MongoDB / GCS storage modes

## Slide 7 – AI and Reliability

- Hybrid rule-based + ML scoring
- Fallback logic for missing services
- Transparent risk factors and suggestions

## Slide 8 – Demo Screens

- Frontend screenshots or live demo flow
- Dashboard, add shipment, selected shipment view

## Slide 9 – Deployment Plan

- Backend on Google Cloud Run
- Frontend on Vercel or Firebase Hosting
- Use GitHub repo + public URL for submission

## Slide 10 – Impact

- Faster exception handling
- Better visibility for temperature-sensitive cargo
- Reduced operational risk

## Slide 11 – Future Work

- Add map visualization and route playback
- Add user authentication and roles
- Add multi-carrier analytics and predictive scheduling

## Slide 12 – Submission Links

- GitHub repository URL
- Live prototype URL
- Contact information
