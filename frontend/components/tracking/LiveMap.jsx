"use client";

import { useEffect, useMemo, useState } from "react";
import { MapContainer, Marker, Polyline, TileLayer, useMap } from "react-leaflet";
import L from "leaflet";
import { Expand, MapPin, X } from "lucide-react";

// Fix default marker icons when bundling with Next.
// Leaflet expects image urls that don't exist in our build output by default.
const defaultIcon = L.icon({
  iconUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

function resolveLocationCoordinates(location, fallback) {
  const lat = Number(location?.lat ?? location?.latitude ?? fallback?.lat ?? 22.7196);
  const lng = Number(location?.lng ?? location?.longitude ?? fallback?.lng ?? 75.8577);
  return { lat, lng };
}

function buildRoutePoints(shipment) {
  if (!Array.isArray(shipment?.route) || shipment.route.length === 0) {
    return [];
  }

  return shipment.route
    .map((point) => {
      const lat = Number(point?.lat);
      const lng = Number(point?.lng);
      if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
      return [lat, lng];
    })
    .filter(Boolean);
}

function FitBounds({ points }) {
  const map = useMap();

  useEffect(() => {
    if (!map || !Array.isArray(points) || points.length === 0) return;
    if (points.length === 1) {
      map.setView(points[0], 13);
      return;
    }
    map.fitBounds(points, { padding: [30, 30] });
  }, [map, points]);

  return null;
}

function ShipmentMap({ center, path, height }) {
  const points = useMemo(() => {
    const safePath = Array.isArray(path) ? path : [];
    if (safePath.length) return safePath;
    return center ? [[center.lat, center.lng]] : [];
  }, [center, path]);

  const leafletCenter = useMemo(() => [center.lat, center.lng], [center.lat, center.lng]);

  return (
    <div className="relative z-0 h-full w-full overflow-hidden rounded-xl" style={{ height }}>
      <MapContainer
        center={leafletCenter}
        zoom={13}
        scrollWheelZoom={false}
        className="h-full w-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <FitBounds points={points} />
        {points.length ? <Polyline positions={points} pathOptions={{ color: "#2563eb", weight: 4, opacity: 0.85 }} /> : null}
        <Marker position={leafletCenter} icon={defaultIcon} />
      </MapContainer>
    </div>
  );
}

export default function LiveMap({ shipment, latestShipmentData }) {
  const [isMapOpen, setIsMapOpen] = useState(false);
  const [movementPath, setMovementPath] = useState(() => buildRoutePoints(shipment));
  const [provider, setProvider] = useState("google");

  const center = useMemo(() => {
    return resolveLocationCoordinates(shipment?.currentLocation, { lat: 22.7196, lng: 75.8577 });
  }, [shipment?.currentLocation]);

  useEffect(() => {
    setMovementPath(buildRoutePoints(shipment));
  }, [shipment?.id]);

  useEffect(() => {
    if (!latestShipmentData || !shipment) return;

    const shipmentId = latestShipmentData.shipment_id || latestShipmentData.id;
    if (shipmentId !== shipment.id) return;

    const nextCoordinates = resolveLocationCoordinates(
      latestShipmentData.location || { lat: latestShipmentData.lat, lng: latestShipmentData.lng },
      shipment?.currentLocation
    );

    if (!Number.isFinite(nextCoordinates.lat) || !Number.isFinite(nextCoordinates.lng)) return;

    setMovementPath((previous) => {
      const next = [...(previous || [])];
      const last = next[next.length - 1];
      const candidate = [nextCoordinates.lat, nextCoordinates.lng];
      if (!last || last[0] !== candidate[0] || last[1] !== candidate[1]) {
        next.push(candidate);
      }
      return next.slice(-80);
    });
  }, [latestShipmentData, shipment]);

  const mapBody = (
    provider === "osm" ? (
      <ShipmentMap
        center={center}
        path={movementPath}
        height={isMapOpen ? "calc(100vh - 240px)" : 420}
      />
    ) : (
      <div className="relative z-0 h-full w-full overflow-hidden rounded-xl" style={{ height: isMapOpen ? "calc(100vh - 240px)" : 420 }}>
        <iframe
          title="Google Maps"
          className="h-full w-full border-0"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          src={(() => {
            const lat = center.lat;
            const lng = center.lng;
            const destination = shipment?.backendData?.destination || shipment?.toLocation;
            // No API key required for this embed.
            if (destination) {
              return `https://www.google.com/maps?output=embed&z=13&q=${encodeURIComponent(
                `${lat},${lng}`
              )}&daddr=${encodeURIComponent(destination)}`;
            }
            return `https://www.google.com/maps?output=embed&z=15&q=${encodeURIComponent(`${lat},${lng}`)}`;
          })()}
        />
      </div>
    )
  );

  return (
    <section className="rounded-xl border border-slate-200/80 bg-white/90 p-5 shadow-sm">
      <header className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">Live Map</p>
          <h3 className="text-lg font-semibold text-slate-950">Current shipment position</h3>
          <p className="text-sm text-slate-500">Switch between Google Maps embed and OpenStreetMap view.</p>
        </div>

        <div className="flex flex-col items-end gap-2">
          <div className="inline-flex overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <button
              type="button"
              onClick={() => setProvider("google")}
              className={`px-3 py-2 text-xs font-semibold ${provider === "google" ? "bg-slate-950 text-white" : "text-slate-600 hover:bg-slate-50"}`}
            >
              Google
            </button>
            <button
              type="button"
              onClick={() => setProvider("osm")}
              className={`px-3 py-2 text-xs font-semibold ${provider === "osm" ? "bg-slate-950 text-white" : "text-slate-600 hover:bg-slate-50"}`}
            >
              OSM
            </button>
          </div>
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
            onClick={() => setIsMapOpen(true)}
          >
            <Expand className="h-4 w-4" />
            Open map
          </button>
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <MapPin className="h-4 w-4" />
            {center.lat.toFixed(4)}, {center.lng.toFixed(4)}
          </div>
        </div>
      </header>

      <div className="mt-4">{mapBody}</div>

      {isMapOpen ? (
        <div
          className="fixed inset-0 z-50 bg-slate-950/35 p-4 backdrop-blur-md"
          onClick={() => setIsMapOpen(false)}
          role="presentation"
        >
          <div
            className="mx-auto flex h-full max-w-5xl flex-col overflow-hidden rounded-[28px] border border-white/70 bg-white/95 shadow-[0_30px_90px_rgba(15,23,42,0.18)]"
            onClick={(event) => event.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <div className="flex items-center justify-between gap-3 border-b border-slate-200 px-6 py-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">Live Map</p>
                <h3 className="mt-1 text-xl font-semibold text-slate-950">{shipment?.id || "Shipment"}</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsMapOpen(false)}
                className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-500 transition hover:bg-slate-50 hover:text-slate-900"
                aria-label="Close map"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="flex-1 p-6">
              <ShipmentMap center={center} path={movementPath} height="100%" />
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
