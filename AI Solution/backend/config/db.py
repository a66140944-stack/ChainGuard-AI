"""
Persistence helpers with Google Cloud Storage first, MongoDB second,
and in-memory fallback as the last resort.
"""

from __future__ import annotations

import json
import os
import sys
import time
from pathlib import Path
from typing import Any

from pymongo import DESCENDING, MongoClient

try:
    from google.cloud import storage

    GCS_AVAILABLE = True
except Exception:
    storage = None
    GCS_AVAILABLE = False

BASE_DIR = Path(__file__).resolve().parents[1]
ROOT_DIR = BASE_DIR.parent
CONFIG_DIR = BASE_DIR / "config"
sys.path.insert(0, str(BASE_DIR))
sys.path.insert(0, str(CONFIG_DIR))

from env_loader import load_environment

load_environment(BASE_DIR, ROOT_DIR)

from logging_config import get_logger

logger = get_logger("chainguard.db")

_db_client = None
_db = None


def get_db():
    global _db_client, _db
    if _db is not None:
        return _db

    gcs = _try_gcs()
    if gcs is not None:
        _db = gcs
        return _db

    mongo = _try_mongodb()
    if mongo is not None:
        _db = mongo
        return _db

    logger.warning("No persistent backend available, using in-memory mode")
    return None


def get_storage_label(db) -> str:
    if db is None:
        return "memory-only"
    if db.get("kind") == "mongo":
        return "mongodb"
    if db.get("kind") == "gcs":
        return "google-cloud-storage"
    return "unknown"


def save_reading(db, reading_data: dict[str, Any]) -> None:
    if db is None:
        return

    payload = dict(reading_data)
    if db.get("kind") == "mongo":
        _save_to_mongodb(db["db"], payload)
        return
    if db.get("kind") == "gcs":
        _save_to_gcs(db["bucket"], payload)


def get_recent_readings(db, shipment_id: str, limit: int = 10) -> list[dict[str, Any]]:
    if db is None:
        return []
    if db.get("kind") == "mongo":
        return _get_recent_readings_mongodb(db["db"], shipment_id, limit)
    if db.get("kind") == "gcs":
        return _get_recent_readings_gcs(db["bucket"], shipment_id, limit)
    return []


def load_current_shipments(db) -> list[dict[str, Any]]:
    if db is None:
        return []
    if db.get("kind") == "mongo":
        try:
            return list(db["db"]["shipments"].find({}, {"_id": 0}))
        except Exception as exc:
            logger.exception("MongoDB current shipments load error: %s", exc)
            return []
    if db.get("kind") == "gcs":
        return _load_current_shipments_gcs(db["bucket"])
    return []


def _try_mongodb():
    global _db_client
    try:
        uri = os.getenv("MONGO_URI", "mongodb://localhost:27017/chainguard")
        _db_client = MongoClient(uri, serverSelectionTimeoutMS=3000)
        _db_client.admin.command("ping")
        database = _db_client.get_default_database()
        if database is None:
            database = _db_client["chainguard"]
        database["readings"].create_index([("shipment_id", DESCENDING), ("timestamp", DESCENDING)])
        database["readings"].create_index([("risk_score", DESCENDING)])
        database["shipments"].create_index("shipment_id", unique=True)
        database["alerts"].create_index([("priority", DESCENDING), ("timestamp", DESCENDING)])
        logger.info("MongoDB connected")
        return {"kind": "mongo", "db": database}
    except Exception as exc:
        logger.warning("MongoDB unavailable: %s", exc)
        return None


def _try_gcs():
    if not GCS_AVAILABLE:
        logger.info("google-cloud-storage package not installed")
        return None

    bucket_name = os.getenv("GCS_BUCKET_NAME", "").strip()
    if not bucket_name:
        logger.info("GCS bucket not configured")
        return None

    try:
        client = storage.Client()
        bucket = client.bucket(bucket_name)
        if not bucket.exists():
            logger.warning("GCS bucket does not exist: %s", bucket_name)
            return None
        logger.info("Google Cloud Storage connected: %s", bucket_name)
        return {"kind": "gcs", "bucket": bucket}
    except Exception as exc:
        logger.warning("Google Cloud Storage unavailable: %s", exc)
        return None


def _save_to_mongodb(database, payload: dict[str, Any]) -> None:
    payload["_mongo_timestamp"] = time.time()
    try:
        reading_document = dict(payload)
        shipment_document = dict(payload)
        shipment_document.pop("_id", None)

        database["readings"].insert_one(reading_document)
        database["shipments"].update_one(
            {"shipment_id": shipment_document["shipment_id"]},
            {"$set": shipment_document},
            upsert=True,
        )
        if shipment_document.get("action") != "MONITOR":
            database["alerts"].insert_one(
                {
                    "shipment_id": shipment_document["shipment_id"],
                    "priority": shipment_document.get("priority", "LOW"),
                    "risk_score": shipment_document.get("risk_score", 0.0),
                    "action": shipment_document.get("action", "MONITOR"),
                    "timestamp": shipment_document.get("timestamp"),
                    "message": shipment_document.get("gemini_explanation", ""),
                }
            )
    except Exception as exc:
        logger.exception("MongoDB write error: %s", exc)


def _get_recent_readings_mongodb(database, shipment_id: str, limit: int) -> list[dict[str, Any]]:
    try:
        cursor = (
            database["readings"]
            .find({"shipment_id": shipment_id}, {"_id": 0})
            .sort("_mongo_timestamp", DESCENDING)
            .limit(limit)
        )
        return list(cursor)
    except Exception as exc:
        logger.exception("MongoDB read error: %s", exc)
        return []


def _save_to_gcs(bucket, payload: dict[str, Any]) -> None:
    try:
        shipment_id = payload.get("shipment_id", "UNKNOWN")
        timestamp_key = _build_timestamp_key(payload)

        current_blob = bucket.blob(f"shipments/current/{shipment_id}.json")
        current_blob.upload_from_string(json.dumps(payload, default=str), content_type="application/json")

        reading_blob = bucket.blob(f"readings/{shipment_id}/{timestamp_key}.json")
        reading_blob.upload_from_string(json.dumps(payload, default=str), content_type="application/json")

        if payload.get("action") != "MONITOR":
            alert_blob = bucket.blob(f"alerts/{shipment_id}/{timestamp_key}.json")
            alert_blob.upload_from_string(
                json.dumps(
                    {
                        "shipment_id": shipment_id,
                        "priority": payload.get("priority", "LOW"),
                        "risk_score": payload.get("risk_score", 0.0),
                        "action": payload.get("action", "MONITOR"),
                        "timestamp": payload.get("timestamp"),
                        "message": payload.get("gemini_explanation", ""),
                    },
                    default=str,
                ),
                content_type="application/json",
            )
    except Exception as exc:
        logger.exception("GCS write error: %s", exc)


def _get_recent_readings_gcs(bucket, shipment_id: str, limit: int) -> list[dict[str, Any]]:
    try:
        prefix = f"readings/{shipment_id}/"
        blobs = sorted(bucket.list_blobs(prefix=prefix), key=lambda item: item.name, reverse=True)
        readings = []
        for blob in blobs[:limit]:
            readings.append(json.loads(blob.download_as_text()))
        return readings
    except Exception as exc:
        logger.exception("GCS read error: %s", exc)
        return []


def _load_current_shipments_gcs(bucket) -> list[dict[str, Any]]:
    try:
        blobs = sorted(bucket.list_blobs(prefix="shipments/current/"), key=lambda item: item.name)
        shipments = []
        for blob in blobs:
            shipments.append(json.loads(blob.download_as_text()))
        return shipments
    except Exception as exc:
        logger.exception("GCS current shipments load error: %s", exc)
        return []


def _build_timestamp_key(payload: dict[str, Any]) -> str:
    timestamp = str(payload.get("timestamp", ""))
    safe_timestamp = timestamp.replace(":", "-").replace("/", "-")
    return f"{safe_timestamp or 'reading'}-{int(time.time() * 1000)}"
