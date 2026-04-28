"""
Central configuration for the IoT shipment simulator.
"""

SHIPMENTS = [
    {
        "id": "SHP-001",
        "origin": "Mumbai",
        "destination": "Delhi",
        "carrier": "BlueDart",
        "lat": 19.07,
        "lng": 72.87,
        "normal_speed_min": 55,
        "normal_speed_max": 85,
    },
    {
        "id": "SHP-002",
        "origin": "Chennai",
        "destination": "Kolkata",
        "carrier": "FedEx India",
        "lat": 13.08,
        "lng": 80.27,
        "normal_speed_min": 50,
        "normal_speed_max": 80,
    },
    {
        "id": "SHP-003",
        "origin": "Pune",
        "destination": "Ahmedabad",
        "carrier": "DHL",
        "lat": 18.52,
        "lng": 73.85,
        "normal_speed_min": 60,
        "normal_speed_max": 90,
    },
    {
        "id": "SHP-004",
        "origin": "Hyderabad",
        "destination": "Jaipur",
        "carrier": "DTDC",
        "lat": 17.38,
        "lng": 78.48,
        "normal_speed_min": 45,
        "normal_speed_max": 75,
    },
    {
        "id": "SHP-005",
        "origin": "Nagpur",
        "destination": "Surat",
        "carrier": "Delhivery",
        "lat": 21.14,
        "lng": 79.08,
        "normal_speed_min": 55,
        "normal_speed_max": 85,
    },
    {
        "id": "SHP-006",
        "origin": "Bhopal",
        "destination": "Lucknow",
        "carrier": "BlueDart",
        "lat": 23.25,
        "lng": 77.41,
        "normal_speed_min": 50,
        "normal_speed_max": 80,
    },
    {
        "id": "SHP-007",
        "origin": "Ghaziabad",
        "destination": "Jammu",
        "carrier": "BlueDart",
        "lat": 28.67,
        "lng": 77.44,
        "normal_speed_min": 30,
        "normal_speed_max": 80,
    }
]

REFRESH_INTERVAL = 6
