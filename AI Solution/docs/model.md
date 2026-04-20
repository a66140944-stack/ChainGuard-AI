# ChainGuard AI Model Documentation

## AI Engine Overview

The AI engine delivers shipment risk scoring, delay prediction, rerouting decisions, and alert explanations.

### Main entry point

- `ai-engine/predictor.py`
- `full_prediction(reading)` is called by `backend/controllers/shipment_controller.py`

## Components

### Rule-based scoring

- Implemented in `ai-engine/risk_scorer.py`
- Evaluates temperature, speed, battery level, signal strength, external events, and remaining distance.
- Always available as a fallback when the ML model is missing or fails.

### Machine learning prediction

- Also in `ai-engine/predictor.py`
- Loads `ai-engine/models/risk_model.pkl`
- Builds a feature vector from telemetry and shipment context.
- Uses a trained classifier to estimate risk probabilities for `SAFE`, `WARNING`, and `CRITICAL`.
- Blends ML score with rule-based score to improve resilience.

### Delay prediction

- `ai-engine/delay_predictor.py` estimates delay minutes based on current shipment conditions.
- Delay values are used to generate ETA and delay text for the dashboard.

### Rerouting engine

- `ai-engine/rerouting_engine.py`
- Uses OpenRouteService by default if `OPEN_ROUTE_SERVICE_KEY` is configured.
- Otherwise returns mock alternate route information.
- Recommends reroute decisions when risk score exceeds 0.40.

### Gemini explanations

- `ai-engine/gemini_explainer.py`
- If `GEMINI_API_KEY` is configured, it requests a natural language alert summary.
- Otherwise it falls back to a template-based explanation.

## Risk Logic

### Output fields

- `risk_score` – floating score between 0.0 and 1.0.
- `risk_category` – `SAFE`, `WARNING`, or `CRITICAL`.
- `action` – `MONITOR`, `RECOMMEND_REROUTE`, or `AUTO_REROUTE`.
- `delay_minutes` – predicted delay in minutes.
- `eta_text` – estimated arrival time.
- `gemini_explanation` – human-readable alert.
- `rerouting` – route alternatives when risk is high.

## Fallback Behavior

- If the ML model is unavailable, the system uses rule-based scoring only.
- If OpenRouteService is unavailable, the engine returns a simulated alternate route.
- If Gemini is unavailable, the engine returns a structured template explanation.

## Notes for Submission

The AI design is intentionally hybrid: it uses both rule-based validation and model inference to maintain reliability during a hackathon demo.
