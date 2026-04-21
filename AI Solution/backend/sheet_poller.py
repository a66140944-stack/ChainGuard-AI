import csv
import io
import time
import requests
from flask import Flask
from flask_socketio import SocketIO

from controllers.shipment_controller import process_incoming_reading
from external_apis import get_weather_for_location
from logging_config import get_logger

logger = get_logger("chainguard.sheet_poller")

SHEET_CSV_URL = "https://docs.google.com/spreadsheets/d/1AaD9OnJb1J-ErVkC8SwRZrzlCfoouy0yzjDSO8_sr8g/export?format=csv"
SHIPMENT_ID = "SHP-ESP32"

def fetch_latest_reading():
    try:
        response = requests.get(SHEET_CSV_URL, timeout=10)
        response.raise_for_status()
        
        reader = csv.DictReader(io.StringIO(response.text))
        rows = list(reader)
        if not rows:
            return None
            
        # Get the latest row that actually has coordinates
        latest_row = None
        for row in reversed(rows):
            lat_str = row.get("Latitude", "")
            lng_str = row.get("Longitude", "")
            if lat_str and lng_str and float(lat_str) != 0 and float(lng_str) != 0:
                latest_row = row
                break

        if not latest_row:
            logger.debug("No valid rows found in CSV")
            return None
        
        lat = float(latest_row.get("Latitude", 0) or 0)
        lng = float(latest_row.get("Longitude", 0) or 0)
        
        # Override temperature with OpenWeather API
        weather = get_weather_for_location(lat, lng)
        if weather and "temperature_c" in weather:
            temp = float(weather["temperature_c"])
        else:
            temp = 25.0 # Fallback if API fails
        
        reading = {
            "shipment_id": SHIPMENT_ID,
            "origin": "ESP Node",
            "destination": "Delhi",
            "lat": lat,
            "lng": lng,
            "temperature_c": temp,
            "cargo_type": "Sensitive Electronics",
            "carrier": "ESP Telemetry",
            "speed_kmh": 60.0, 
            "humidity_pct": 50.0,
            "battery_pct": 100.0,
            "signal_strength": 90.0,
            "timestamp": latest_row.get("Time")
        }
        return reading
        
    except Exception as e:
        logger.error("Failed to fetch sheet data: %s", e)
        return None

def sheet_polling_loop(app: Flask, socketio: SocketIO):
    last_timestamp = None

    while True:
        try:
            with app.app_context():
                reading = fetch_latest_reading()
                if reading is not None:
                    current_timestamp = reading.get("timestamp")
                    # Process reading only if it's a new row or we haven't seen one yet
                    if current_timestamp != last_timestamp:
                        last_timestamp = current_timestamp
                        
                        db = app.config["DB"]
                        store_lock = app.config["STORE_LOCK"]
                        shipment_store = app.config["SHIPMENT_STORE"]
                        
                        processed = process_incoming_reading(reading, db)
                        if processed:
                            with store_lock:
                                shipment_store[processed["shipment_id"]] = processed
                            socketio.emit("shipment_update", list(shipment_store.values()))
                            logger.info("Polled latest data for %s", SHIPMENT_ID)
        except Exception as e:
            logger.exception("Error in sheet polling loop: %s", e)

        time.sleep(10)

def start_sheet_poller(app: Flask, socketio: SocketIO):
    import threading
    t = threading.Thread(target=sheet_polling_loop, args=(app, socketio), daemon=True)
    t.start()
