# ChainGuard Backend Architecture

## Why Flask

Flask keeps the hackathon backend simple, readable, and easy to demo while still supporting:
- REST APIs for judges and frontend integration
- Socket.IO for live shipment updates
- pluggable persistence backends
- clean controller and route separation

## Current Runtime Design

- `app.py` boots Flask, Socket.IO, storage, and startup seeding
- `routes/` exposes REST endpoints
- `controllers/` owns business logic and AI integration
- `config/db.py` selects persistence in this order:
  1. Google Cloud Storage
  2. MongoDB
  3. In-memory fallback
- `config/external_apis.py` enriches readings with weather and routing data
- routing can come from OpenRouteService, Google Maps, or a calculated fallback

## Security Model

- JWT bearer authentication can be enabled with `AUTH_REQUIRED=true`
- CORS origins are restricted through `ALLOWED_ORIGINS`
- Environment variables are loaded from backend-local or project-root `.env`

## Scalability Direction

For production, this backend would evolve toward:
- Gunicorn or another production WSGI/ASGI server
- Firestore, MongoDB Atlas, or PostgreSQL for richer querying
- Redis-backed websocket/event fanout
- background workers for AI enrichment and external API calls
- centralized logging and monitoring

## Production Upgrade Path

1. Put the app behind Gunicorn/Waitress and a reverse proxy
2. Move from blob-style GCS persistence to a query-first database
3. Add request tracing, metrics, and alerting
4. Add role-based authorization and token issuer verification
5. Expand test coverage for routes, controllers, and persistence adapters
