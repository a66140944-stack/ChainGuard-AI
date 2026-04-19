"""
Rerouting engine using OpenRouteService API with a mock fallback.
"""

from __future__ import annotations

import datetime
import math
import os

import requests
from dotenv import load_dotenv

load_dotenv()

OPEN_ROUTE_SERVICE_KEY = os.getenv("OPEN_ROUTE_SERVICE_KEY", "")

CITY_COORDS = {
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


def _minutes_to_eta(minutes: int) -> str:
    eta = datetime.datetime.now() + datetime.timedelta(minutes=int(minutes))
    return eta.strftime("%I:%M %p")


def _mock_routes(origin_lat: float, origin_lng: float, dest_lat: float, dest_lng: float) -> list[dict]:
    r = 6371
    dlat = math.radians(dest_lat - origin_lat)
    dlng = math.radians(dest_lng - origin_lng)
    a = (
        math.sin(dlat / 2) ** 2
        + math.cos(math.radians(origin_lat))
        * math.cos(math.radians(dest_lat))
        * math.sin(dlng / 2) ** 2
    )
    straight_line_km = r * 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    road_distance = round(straight_line_km * 1.35, 1)
    return [
        {
            "route_index": 0,
            "label": "Primary (NH route)",
            "distance_km": road_distance,
            "duration_min": round(road_distance / 65 * 60),
            "polyline": "",
            "source": "mock",
        },
        {
            "route_index": 1,
            "label": "Alternate (State route)",
            "distance_km": round(road_distance * 1.12, 1),
            "duration_min": round(road_distance * 1.12 / 55 * 60),
            "polyline": "",
            "source": "mock",
        },
    ]


def get_ors_routes(origin_lat: float, origin_lng: float, dest_lat: float, dest_lng: float) -> list[dict]:
    if not OPEN_ROUTE_SERVICE_KEY:
        return _mock_routes(origin_lat, origin_lng, dest_lat, dest_lng)

    url = "https://api.openrouteservice.org/v2/directions/driving-car"
    headers = {
        "Content-Type": "application/json",
        "Authorization": OPEN_ROUTE_SERVICE_KEY,
    }
    body = {
        # ORS expects [lng, lat]
        "coordinates": [[origin_lng, origin_lat], [dest_lng, dest_lat]],
        "alternative_routes": {"share_factor": 0.6, "target_count": 1, "weight_factor": 1.4},
        "instructions": False,
        "geometry": False,
    }

    try:
        resp = requests.post(url, json=body, headers=headers, timeout=8)
        if resp.status_code != 200:
            return _mock_routes(origin_lat, origin_lng, dest_lat, dest_lng)

        routes = []
        payload = resp.json()
        for i, route in enumerate(payload.get("routes", [])[:2]):
            summary = route.get("summary", {})
            duration_sec = float(summary.get("duration", 0))
            distance_m = float(summary.get("distance", 0))
            routes.append(
                {
                    "route_index": i,
                    "label": "Primary" if i == 0 else f"Alternate {i}",
                    "distance_km": round(distance_m / 1000, 1),
                    "duration_min": round(duration_sec / 60),
                    "polyline": "",
                    "source": "openrouteservice",
                }
            )
        return routes or _mock_routes(origin_lat, origin_lng, dest_lat, dest_lng)
    except Exception:
        return _mock_routes(origin_lat, origin_lng, dest_lat, dest_lng)


def get_rerouting_decision(shipment_data: dict, risk_score: float) -> dict:
    origin_lat = float(shipment_data.get("lat", 20.0))
    origin_lng = float(shipment_data.get("lng", 78.0))
    destination = shipment_data.get("destination", "Delhi")
    dest_lat, dest_lng = CITY_COORDS.get(destination, (28.7041, 77.1025))

    routes = get_ors_routes(origin_lat, origin_lng, dest_lat, dest_lng)
    if not routes:
        return {"reroute_recommended": False, "reason": "Route data unavailable"}

    primary = routes[0]
    alternate = routes[1] if len(routes) > 1 else None

    reroute = False
    recommendation = "MONITOR - Current route optimal"
    time_saving = 0

    if risk_score >= 0.70:
        reroute = True
        recommendation = "AUTO_REROUTE - Critical risk"
        if alternate:
            time_saving = primary["duration_min"] - alternate["duration_min"]
    elif risk_score >= 0.45 and alternate and alternate["duration_min"] < primary["duration_min"]:
        reroute = True
        time_saving = primary["duration_min"] - alternate["duration_min"]
        recommendation = f"RECOMMEND_REROUTE - save {time_saving} min"

    return {
        "reroute_recommended": reroute,
        "recommendation": recommendation,
        "time_saving_min": time_saving,
        "primary_route": {
            "label": primary["label"],
            "distance_km": primary["distance_km"],
            "duration_min": primary["duration_min"],
            "eta_text": _minutes_to_eta(primary["duration_min"]),
            "polyline": primary.get("polyline", ""),
        },
        "alternate_route": (
            {
                "label": alternate["label"],
                "distance_km": alternate["distance_km"],
                "duration_min": alternate["duration_min"],
                "eta_text": _minutes_to_eta(alternate["duration_min"]),
                "polyline": alternate.get("polyline", ""),
            }
            if alternate
            else None
        ),
        "destination_coords": {"lat": dest_lat, "lng": dest_lng},
        "source": routes[0].get("source", "unknown"),
    }
