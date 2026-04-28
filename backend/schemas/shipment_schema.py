"""
Request validation schemas for shipment ingestion.
"""

from __future__ import annotations

from typing import Any

from pydantic import BaseModel, ConfigDict, Field


class ExternalEventSchema(BaseModel):
    model_config = ConfigDict(extra="allow")

    name: str = Field(min_length=1)
    severity: float = Field(ge=0.0, le=1.0)
    source: str | None = None


class ShipmentIngestSchema(BaseModel):
    model_config = ConfigDict(extra="allow")

    shipment_id: str = Field(min_length=1)
    origin: str | None = None
    destination: str | None = None
    carrier: str | None = None
    cargo_type: str | None = None
    lat: float = Field(ge=-90.0, le=90.0)
    lng: float = Field(ge=-180.0, le=180.0)
    speed_kmh: float | None = Field(default=None, ge=0.0)
    temperature_c: float | None = None
    battery_pct: float | None = Field(default=None, ge=0.0, le=100.0)
    humidity_pct: float | None = Field(default=None, ge=0.0, le=100.0)
    signal_strength: float | None = Field(default=None, ge=0.0, le=100.0)
    timestamp: str | None = None
    device_id: str | None = None
    external_event: ExternalEventSchema | None = None


def validate_ingest_payload(payload: dict[str, Any]) -> dict[str, Any]:
    model = ShipmentIngestSchema.model_validate(payload)
    return model.model_dump(exclude_none=True)
