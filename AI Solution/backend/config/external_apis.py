"""
External API integrations for weather and routing.
"""

from __future__ import annotations

import math
import os
import sys
import time

import requests
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parents[1]
ROOT_DIR = BASE_DIR.parent
CONFIG_DIR = BASE_DIR / "config"
sys.path.insert(0, str(BASE_DIR))
sys.path.insert(0, str(CONFIG_DIR))

from env_loader import load_environment

load_environment(BASE_DIR, ROOT_DIR)

from logging_config import get_logger

logger = get_logger("chainguard.external_apis")

OPENWEATHER_KEY = os.getenv("OPENWEATHER_API_KEY", "")
OPEN_ROUTE_SERVICE_KEY = os.getenv("OPEN_ROUTE_SERVICE_KEY", "")
GOOGLE_MAPS_KEY = os.getenv("GOOGLE_MAPS_KEY", "")
_weather_cache: dict[str, tuple[float, dict]] = {}
CACHE_DURATION_SEC = 300

INDIA_CITIES = {
    "Mumbai": (19.0760, 72.8777),
    "Delhi": (28.7041, 77.1025),
    "Chennai": (13.0827, 80.2707),
    "Kolkata": (22.5726, 88.3639),
    "Pune": (18.5204, 73.8567),
    "Ahmedabad": (23.0225, 72.5714),
    "Hyderabad": (17.3850, 78.4867),
    "Jaipur": (26.9124, 75.7873),
    "Nagpur": (21.1458, 79.0882),
    "Surat": (21.1702, 72.8311),
    "Bhopal": (23.2599, 77.4126),
    "Lucknow": (26.8467, 80.9462),
    "Bengaluru": (12.9716, 77.5946),
    "Patna": (25.5941, 85.1376),
}


def get_weather_for_location(lat: float, lng: float) -> dict | None:
    if not OPENWEATHER_KEY:
        return None

    cache_key = f"{round(lat, 2)}_{round(lng, 2)}"
    cached = _weather_cache.get(cache_key)
    if cached and time.time() - cached[0] < CACHE_DURATION_SEC:
        return cached[1]

    try:
        response = requests.get(
            "https://api.openweathermap.org/data/2.5/weather",
            params={"lat": lat, "lon": lng, "appid": OPENWEATHER_KEY, "units": "metric"},
            timeout=5,
        )
        if response.status_code != 200:
            return None
        data = response.json()
        wind_speed_kmh = round(float(data.get("wind", {}).get("speed", 0)) * 3.6, 1)
        result = {
            "description": data["weather"][0]["description"],
            "temperature_c": round(float(data["main"]["temp"]), 1),
            "feels_like_c": round(float(data["main"]["feels_like"]), 1),
            "humidity_pct": int(data["main"]["humidity"]),
            "wind_speed_kmh": wind_speed_kmh,
            "visibility_m": int(data.get("visibility", 10000)),
            "weather_code": int(data["weather"][0]["id"]),
            "city_name": data.get("name", "Unknown"),
            "is_dangerous": int(data["weather"][0]["id"]) < 700 or wind_speed_kmh > 60,
        }
        _weather_cache[cache_key] = (time.time(), result)
        return result
    except Exception as exc:
        logger.warning("Weather lookup failed: %s", exc)
        return None


def weather_to_risk(weather_data: dict | None) -> tuple[float, str]:
    if not weather_data:
        return 0.0, ""

    code = weather_data.get("weather_code", 800)
    wind = weather_data.get("wind_speed_kmh", 0)
    visibility = weather_data.get("visibility_m", 10000)
    description = weather_data.get("description", "clear")

    risk = 0.0
    reason = ""

    if 200 <= code <= 299:
        risk, reason = 0.40, f"Thunderstorm on route: {description}"
    elif 500 <= code <= 531:
        if code <= 501:
            risk, reason = 0.15, f"Light rain: {description}"
        elif code <= 502:
            risk, reason = 0.22, f"Moderate rain: {description}"
        else:
            risk, reason = 0.30, f"Heavy rain: {description}"
    elif 300 <= code <= 321:
        risk, reason = 0.08, f"Drizzle: {description}"
    elif 600 <= code <= 622:
        risk, reason = 0.30, f"Snowfall on route: {description}"
    elif 700 <= code <= 781:
        if code == 741:
            risk, reason = 0.28, "Fog with severe visibility reduction"
        elif code == 781:
            risk, reason = 0.40, "Tornado warning on route"
        else:
            risk, reason = 0.18, f"Low-visibility conditions: {description}"

    if visibility < 200:
        risk, reason = max(risk, 0.35), f"Critical visibility {visibility}m: {description}"
    elif visibility < 1000:
        risk, reason = max(risk, 0.22), f"Reduced visibility {visibility}m: {description}"

    if wind > 80:
        risk = max(risk, 0.38)
        reason = f"{reason} + dangerous winds {wind} km/h".strip()
    elif wind > 50:
        risk = max(risk, 0.20)
        reason = f"{reason} + high winds {wind} km/h".strip()

    return round(risk, 2), reason.strip()


def get_routes(origin_lat: float, origin_lng: float, destination_name: str) -> dict:
    destination = INDIA_CITIES.get(destination_name)
    if destination is None:
        return _mock_route_data(origin_lat, origin_lng, destination_name)

    if OPEN_ROUTE_SERVICE_KEY:
        ors_routes = _get_routes_from_openrouteservice(origin_lat, origin_lng, destination_name, destination)
        if ors_routes is not None:
            return ors_routes

    if not GOOGLE_MAPS_KEY:
        return _mock_route_data(origin_lat, origin_lng, destination_name)

    dest_lat, dest_lng = destination
    try:
        response = requests.post(
            "https://routes.googleapis.com/directions/v2:computeRoutes",
            json={
                "origin": {"location": {"latLng": {"latitude": origin_lat, "longitude": origin_lng}}},
                "destination": {"location": {"latLng": {"latitude": dest_lat, "longitude": dest_lng}}},
                "travelMode": "DRIVE",
                "routingPreference": "TRAFFIC_AWARE",
                "computeAlternativeRoutes": True,
                "units": "METRIC",
            },
            headers={
                "Content-Type": "application/json",
                "X-Goog-Api-Key": GOOGLE_MAPS_KEY,
                "X-Goog-FieldMask": (
                    "routes.duration,routes.distanceMeters,"
                    "routes.polyline.encodedPolyline,routes.description"
                ),
            },
            timeout=8,
        )
        if response.status_code != 200:
            return _mock_route_data(origin_lat, origin_lng, destination_name)
        routes = response.json().get("routes", [])
        parsed = []
        for index, route in enumerate(routes[:2]):
            duration_sec = int(str(route.get("duration", "0s")).replace("s", ""))
            parsed.append(
                {
                    "index": index,
                    "label": "Primary Route" if index == 0 else "Alternate Route",
                    "distance_km": round(float(route.get("distanceMeters", 0)) / 1000, 1),
                    "duration_min": round(duration_sec / 60),
                    "polyline": route.get("polyline", {}).get("encodedPolyline", ""),
                    "source": "google_maps",
                    "dest_lat": dest_lat,
                    "dest_lng": dest_lng,
                }
            )
        return {
            "primary": parsed[0] if parsed else None,
            "alternate": parsed[1] if len(parsed) > 1 else None,
            "destination": {"name": destination_name, "lat": dest_lat, "lng": dest_lng},
            "source": "google_maps",
        }
    except Exception as exc:
        logger.warning("Routes lookup failed: %s", exc)
        return _mock_route_data(origin_lat, origin_lng, destination_name)


def _get_routes_from_openrouteservice(
    origin_lat: float,
    origin_lng: float,
    destination_name: str,
    destination: tuple[float, float],
) -> dict | None:
    dest_lat, dest_lng = destination
    try:
        response = requests.post(
            "https://api.openrouteservice.org/v2/directions/driving-car",
            json={
                "coordinates": [
                    [origin_lng, origin_lat],
                    [dest_lng, dest_lat],
                ]
            },
            headers={
                "Authorization": OPEN_ROUTE_SERVICE_KEY,
                "Content-Type": "application/json",
            },
            timeout=8,
        )
        if response.status_code != 200:
            logger.warning("OpenRouteService lookup failed with status %s", response.status_code)
            return None

        features = response.json().get("features", [])
        if not features:
            return None

        summary = features[0].get("properties", {}).get("summary", {})
        primary_distance_km = round(float(summary.get("distance", 0.0)) / 1000, 1)
        primary_duration_min = round(float(summary.get("duration", 0.0)) / 60)

        fallback = _mock_route_data(origin_lat, origin_lng, destination_name)
        alternate = fallback.get("alternate")
        if alternate:
            alternate = {
                **alternate,
                "source": "calculated-fallback",
            }

        return {
            "primary": {
                "index": 0,
                "label": "Primary Route",
                "distance_km": primary_distance_km,
                "duration_min": primary_duration_min,
                "polyline": "",
                "source": "openrouteservice",
                "dest_lat": dest_lat,
                "dest_lng": dest_lng,
            },
            "alternate": alternate,
            "destination": {"name": destination_name, "lat": dest_lat, "lng": dest_lng},
            "source": "openrouteservice",
        }
    except Exception as exc:
        logger.warning("OpenRouteService lookup failed: %s", exc)
        return None


def _mock_route_data(origin_lat: float, origin_lng: float, destination_name: str) -> dict:
    dest_lat, dest_lng = INDIA_CITIES.get(destination_name, (20.0, 77.0))
    radius_km = 6371
    dlat = math.radians(dest_lat - origin_lat)
    dlng = math.radians(dest_lng - origin_lng)
    a = (
        math.sin(dlat / 2) ** 2
        + math.cos(math.radians(origin_lat))
        * math.cos(math.radians(dest_lat))
        * math.sin(dlng / 2) ** 2
    )
    distance = radius_km * 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))

    primary_dist = round(distance * 1.32, 1)
    primary_duration = round(primary_dist / 62 * 60)
    alternate_dist = round(distance * 1.48, 1)
    alternate_duration = round(alternate_dist / 55 * 60)

    return {
        "primary": {
            "index": 0,
            "label": "Primary Route (NH)",
            "distance_km": primary_dist,
            "duration_min": primary_duration,
            "polyline": "",
            "source": "calculated",
            "dest_lat": dest_lat,
            "dest_lng": dest_lng,
        },
        "alternate": {
            "index": 1,
            "label": "Alternate Route (State bypass)",
            "distance_km": alternate_dist,
            "duration_min": alternate_duration,
            "polyline": "",
            "source": "calculated",
            "dest_lat": dest_lat,
            "dest_lng": dest_lng,
        },
        "destination": {"name": destination_name, "lat": dest_lat, "lng": dest_lng},
        "source": "mock",
    }
