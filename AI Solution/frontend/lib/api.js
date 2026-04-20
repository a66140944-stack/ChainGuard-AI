import { dummyShipments } from "../data/dummyData.js";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:5000";

function joinUrl(path) {
  const base = API_BASE_URL.replace(/\/$/, "");
  const suffix = path.startsWith("/") ? path : `/${path}`;
  return `${base}${suffix}`;
}

function getFallbackShipment(id) {
  return dummyShipments.find((shipment) => shipment.id === id) || null;
}

function normalizeShipment(apiShipment) {
  if (!apiShipment) return null;

  const shipmentId = apiShipment.shipment_id || apiShipment.id || `CG-${Date.now()}`;
  const startDate = apiShipment.timestamp?.slice(0, 10) || "2026-04-01";
  const endDate = apiShipment.timestamp?.slice(0, 10) || "2026-04-10";

  return {
    id: shipmentId,
    shipmentNumber: shipmentId,
    fromLocation: apiShipment.origin || "Unknown",
    toLocation: apiShipment.destination || "Unknown",
    startDate,
    endDate,
    delayToleranceDays: 2,
    logisticsType: apiShipment.cargo_type || "Road",
    deviceId: apiShipment.device_id || "IOT-UNKNOWN",
    temperatureC: Number(apiShipment.temperature_c ?? 0),
    temperatureSeries: [
      {
        timestamp: startDate,
        temperatureC: Number(apiShipment.temperature_c ?? 0)
      }
    ],
    fragility: "Medium",
    vehicleNumber: apiShipment.vehicle_number || "Unassigned",
    delayDays: Number(apiShipment.delay_minutes ?? 0) / 60,
    predictedDeliveryDate: apiShipment.timestamp?.slice(0, 10) || endDate,
    riskLevel:
      apiShipment.risk_category === "CRITICAL"
        ? "High"
        : apiShipment.risk_category === "WARNING"
          ? "Medium"
          : "Low",
    status:
      Number(apiShipment.delay_minutes ?? 0) > 0
        ? "Delayed"
        : apiShipment.action || "In Transit",
    deliveredDate: null,
    currentLocation: {
      label: apiShipment.origin || "En route",
      lat: Number(apiShipment.lat ?? 22.7196),
      lng: Number(apiShipment.lng ?? 75.8577)
    },
    route: [
      {
        name: apiShipment.origin || "Origin",
        lat: Number(apiShipment.lat ?? 22.7196),
        lng: Number(apiShipment.lng ?? 75.8577)
      },
      {
        name: apiShipment.destination || "Destination",
        lat: Number(apiShipment.lat ?? 22.7196),
        lng: Number(apiShipment.lng ?? 75.8577)
      }
    ],
    backendData: apiShipment
  };
}

async function request(path, options = {}) {
  const response = await fetch(joinUrl(path), {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {})
    },
    cache: "no-store"
  });

  if (!response.ok) {
    let message = `Request failed with status ${response.status}`;
    try {
      const payload = await response.json();
      message = payload?.error || payload?.message || message;
    } catch {}
    throw new Error(message);
  }

  if (response.status === 204) return null;
  return response.json();
}

export async function fetchHealth() {
  return request("/api/health");
}

export async function fetchShipments() {
  try {
    const shipments = await request("/api/shipments");
    return shipments.map(normalizeShipment);
  } catch (error) {
    console.error("fetchShipments failed, falling back to dummy data:", error);
    return dummyShipments;
  }
}

export async function fetchShipment(id) {
  try {
    const shipment = await request(`/api/shipments/${id}`);
    return normalizeShipment(shipment);
  } catch (error) {
    console.error("fetchShipment failed, falling back to dummy data:", error);
    return getFallbackShipment(id);
  }
}

export async function fetchShipmentHistory(id) {
  try {
    return await request(`/api/shipments/${id}/history`);
  } catch (error) {
    console.error("fetchShipmentHistory failed, falling back to dummy data:", error);
    const fallbackShipment = getFallbackShipment(id);
    return (
      fallbackShipment?.temperatureSeries?.map((item) => ({
        timestamp: item.timestamp,
        risk_score:
          fallbackShipment.riskLevel === "High"
            ? 0.8
            : fallbackShipment.riskLevel === "Medium"
              ? 0.45
              : 0.2,
        action: fallbackShipment.status,
        delay_minutes: fallbackShipment.delayDays * 24 * 60
      })) || []
    );
  }
}

export async function createShipment(payload) {
  const requestBody = {
    shipment_id: payload.shipmentNumber,
    origin: payload.fromLocation,
    destination: payload.toLocation,
    carrier: payload.vehicleNumber || "ChainGuard Fleet",
    cargo_type: payload.logisticsType,
    lat: payload.currentLocation?.lat || 22.7196,
    lng: payload.currentLocation?.lng || 75.8577,
    speed_kmh: 48,
    temperature_c: Number(payload.temperatureC),
    battery_pct: 82,
    humidity_pct: 56,
    signal_strength: 88
  };

  try {
    return await request("/api/ingest", {
      method: "POST",
      body: JSON.stringify(requestBody)
    });
  } catch (error) {
    console.error("createShipment failed, continuing with local state:", error);
    return null;
  }
}
