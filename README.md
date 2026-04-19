# ChainGuard: Intelligent Supply Chain AI Engine 🚚🤖

**ChainGuard** is a next-generation AI-powered logistics framework designed to predict supply chain delays, monitor cold-chain variables (like temperature and battery life), and execute smart re-routing during severe external events (e.g., cyclones, traffic).

> **Built for the Google Solution Challenge**
> Tackling **UN Sustainable Development Goals (SDGs):**
> * **Goal 9:** Industry, Innovation and Infrastructure
> * **Goal 13:** Climate Action (optimized routing reduces emissions)

## 🌟 Key Features

1. **Dual ML Architecture (XGBoost):** 
   - **Risk Classifier:** Evaluates real-time sensor data (Safe / Warning / Critical).
   - **Delay Regressor:** Predicts the exact minutes a shipment will be delayed.
   - *GPU-accelerated and capable of handling data imbalances.*

2. **Gemini AI Explanations 🧠:**
   - Interprets complex routing and risk data into plain, actionable language for logistics managers utilizing Google's Gemini LLM.

3. **Smart Re-routing Engine:**
   - Continuously monitors routes via **OpenRouteService**. If a risk score surpasses `0.40`, the model automatically suggests faster Alternate Routes complete with new ETA calculations and Map Polylines.

4. **Hybrid Rule-Based Fallback:**
   - Combines traditional threshold rules (e.g., temperature > 35°C) with Machine Learning confidence scores to prevent hallucination and guarantee system reliability.

## 🛠 Project Structure

```
├── ai-engine/                  # The brain of ChainGuard (AI models & prediction)
│   ├── predictor.py            # Primary API Entry Point (full_prediction method)
│   ├── rerouting_engine.py     # Map & OpenRouteService Integration
│   ├── gemini_explainer.py     # Google Gemini API integration
│   ├── train.py                # Model training (GPU-First XGBoost)
│   └── models/                 # Saved artifacts (risk_model.pkl, delay_model.pkl)
├── backend/                    # Core API layer (Flask/FastAPI) to expose ML to the web
├── frontend/                   # User dashboard and Map UI
└── docs/                       # Architecture diagrams and flow logic
```

## 🚀 Integrating the AI (For Backend Developers)

The entire AI framework is accessible via a single function call. Import the `full_prediction` function in your backend routing logic.

```python
from ai_engine.predictor import full_prediction

# Sample payload from IoT vehicle sensors
sensor_reading = {
    "shipment_id": "SHP-002",
    "speed_kmh": 11.0,
    "temperature_c": 38.5,
    "battery_pct": 18.0,
    "external_event": {"name": "Cyclone warning", "severity": 0.38},
    "lat": 14.5,
    "lng": 80.5
}

# The AI analyzes risk, delay, and calculates new map routes instantly
ai_analysis_result = full_prediction(sensor_reading)
```

## 📦 How to Train the Model Locally
1. Navigate to the model directory: `cd ai-engine`
2. Install requirements (XGBoost, Pandas, scikit-learn): `pip install -r requirements_ai.txt`
3. Execute the training pipeline: `python train.py`
4. The script will output training metrics (accuracy, macro-F1, MAE) and update the `.pkl` files in the `models/` directory along with a `training_report.png`.
