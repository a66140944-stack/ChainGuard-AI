"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Expand, MapPin, Route, X } from "lucide-react";
import {
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  useMap
} from "react-leaflet";
import L from "leaflet";

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

      if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
        return null;
      }

      return {
        lat,
        lng,
        name: point?.name || "Waypoint"
      };
    })
    .filter(Boolean);
}

function FixLeafletMarkerIcons() {
  useEffect(() => {
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
      iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
      shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png"
    });
  }, []);

  return null;
}

function RecenterMap({ center }) {
  const map = useMap();

  useEffect(() => {
    if (!center) return;
    map.setView([center.lat, center.lng], Math.max(map.getZoom(), 7), {
      animate: true
    });
  }, [center, map]);

  return null;
}

function OsrmRouteLayer({ path }) {
  const map = useMap();
  const routeLayerRef = useRef(null);

  useEffect(() => {
    let isCancelled = false;

    async function drawRoute() {
      if (routeLayerRef.current) {
        map.removeLayer(routeLayerRef.current);
        routeLayerRef.current = null;
      }

      if (!Array.isArray(path) || path.length < 2) {
        return;
      }

      const coordinates = path.map(({ lat, lng }) => `${lng},${lat}`).join(";");
      const routeUrl =
        `https://router.project-osrm.org/route/v1/driving/${coordinates}` +
        "?overview=full&geometries=geojson";

      try {
        const response = await fetch(routeUrl);

        if (!response.ok) {
          throw new Error(`OSRM request failed with status ${response.status}`);
        }

        const data = await response.json();
        const geometry = data?.routes?.[0]?.geometry;

        if (!geometry) {
          throw new Error("OSRM route geometry is missing");
        }

        if (isCancelled) {
          return;
        }

        routeLayerRef.current = L.geoJSON(geometry, {
          style: {
            color: "#2563eb",
            weight: 4,
            opacity: 0.8
          }
        }).addTo(map);

        const routeBounds = routeLayerRef.current.getBounds();
        if (routeBounds.isValid()) {
          map.fitBounds(routeBounds, { padding: [24, 24] });
        }
      } catch (error) {
        if (isCancelled) {
          return;
        }

        console.error("Failed to load OSRM route, using fallback polyline.", error);

        routeLayerRef.current = L.polyline(
          path.map(({ lat, lng }) => [lat, lng]),
          {
            color: "#2563eb",
            weight: 4,
            opacity: 0.8,
            dashArray: "8 10"
          }
        ).addTo(map);

        const fallbackBounds = routeLayerRef.current.getBounds();
        if (fallbackBounds.isValid()) {
          map.fitBounds(fallbackBounds, { padding: [24, 24] });
        }
      }
    }

    drawRoute();

    return () => {
      isCancelled = true;

      if (routeLayerRef.current) {
        map.removeLayer(routeLayerRef.current);
        routeLayerRef.current = null;
      }
    };
  }, [map, path]);

  return null;
}

function ShipmentMap({ center, path, height }) {
  return (
    <div className="relative z-0 h-full w-full overflow-hidden rounded-xl" style={{ height }}>
      <MapContainer
        center={[center.lat, center.lng]}
        zoom={7}
        className="z-0 h-full w-full"
        style={{ height: "100%", width: "100%" }}
      >
        <FixLeafletMarkerIcons />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <RecenterMap center={center} />
        <OsrmRouteLayer path={path} />
        <Marker position={[center.lat, center.lng]}>
          <Popup>Current shipment position</Popup>
        </Marker>
      </MapContainer>
    </div>
  );
}

export default function LiveMap({ shipment, latestShipmentData }) {
  const [isMapOpen, setIsMapOpen] = useState(false);
  const [movementPath, setMovementPath] = useState(() => buildRoutePoints(shipment));

  useEffect(() => {
    setMovementPath(buildRoutePoints(shipment));
  }, [shipment?.id]);

  useEffect(() => {
    if (!latestShipmentData || latestShipmentData.id !== shipment?.id) {
      return;
    }

    const nextCoordinates = resolveLocationCoordinates(latestShipmentData.location, shipment?.currentLocation);

    if (!Number.isFinite(nextCoordinates.lat) || !Number.isFinite(nextCoordinates.lng)) {
      return;
    }

    setMovementPath((previousPath) => {
      const lastPoint = previousPath[previousPath.length - 1];
      if (lastPoint && lastPoint.lat === nextCoordinates.lat && lastPoint.lng === nextCoordinates.lng) {
        return previousPath;
      }

      return [
        ...previousPath,
        {
          lat: nextCoordinates.lat,
          lng: nextCoordinates.lng,
          name: shipment?.currentLocation?.label || "Live position"
        }
      ];
    });
  }, [latestShipmentData, shipment]);

  useEffect(() => {
    if (!isMapOpen) return undefined;

    function handleEscape(event) {
      if (event.key === "Escape") setIsMapOpen(false);
    }

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [isMapOpen]);

  const currentPosition = useMemo(
    () => resolveLocationCoordinates(shipment?.currentLocation, movementPath[movementPath.length - 1]),
    [movementPath, shipment?.currentLocation]
  );

  return (
    <>
      <section className="rounded-xl border border-slate-200/80 bg-white/90 p-4 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">Live Map</p>
            <h2 className="mt-2 text-lg font-semibold text-slate-950">Current shipment position</h2>
          </div>
          <button
            type="button"
            onClick={() => setIsMapOpen(true)}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            <Expand className="h-4 w-4" />
            Open Map
          </button>
        </div>

        <div className="mt-5">
          <div className="h-[300px] w-full overflow-hidden rounded-xl border border-slate-200/80">
            <ShipmentMap center={currentPosition} path={movementPath} height={300} />
          </div>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl border border-slate-200/80 bg-slate-50/80 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Current location</p>
            <p className="mt-2 flex items-center gap-2 text-sm font-semibold text-slate-900">
              <MapPin className="h-4 w-4 text-slate-400" />
              {shipment?.currentLocation?.label || "Live position"}
            </p>
          </div>
          <div className="rounded-xl border border-slate-200/80 bg-slate-50/80 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Tracked path</p>
            <p className="mt-2 flex items-center gap-2 text-sm font-semibold text-slate-900">
              <Route className="h-4 w-4 text-slate-400" />
              {movementPath.length} point{movementPath.length === 1 ? "" : "s"} recorded
            </p>
          </div>
        </div>
      </section>

      {isMapOpen ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/35 p-4 backdrop-blur-md"
          onClick={() => setIsMapOpen(false)}
          role="presentation"
        >
          <div
            className="w-full max-w-6xl rounded-[28px] border border-white/70 bg-white/95 shadow-[0_30px_90px_rgba(15,23,42,0.18)]"
            onClick={(event) => event.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="live-map-modal-title"
          >
            <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-6 py-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">Live Map</p>
                <h3 id="live-map-modal-title" className="mt-2 text-xl font-semibold text-slate-950">
                  {shipment?.shipmentNumber || shipment?.id}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsMapOpen(false)}
                className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-500 transition hover:bg-slate-50 hover:text-slate-900"
                aria-label="Close live map"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-5 px-6 py-6">
              <ShipmentMap center={currentPosition} path={movementPath} height={520} />
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-xl border border-slate-200/80 bg-slate-50/80 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Coordinates</p>
                  <p className="mt-2 text-sm font-semibold text-slate-900">
                    {currentPosition.lat.toFixed(4)}, {currentPosition.lng.toFixed(4)}
                  </p>
                </div>
                <div className="rounded-xl border border-slate-200/80 bg-slate-50/80 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Path points</p>
                  <p className="mt-2 text-sm font-semibold text-slate-900">{movementPath.length}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
