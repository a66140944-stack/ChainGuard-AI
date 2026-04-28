"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Expand, MapPin, Route, X } from "lucide-react";

const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "AIzaSyDCNUNZ05VjUSil1kCpnPO9sUH3goiWhP4";

let googleMapsScriptPromise;

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

function loadGoogleMaps() {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("Google Maps can only load in the browser."));
  }

  if (window.google?.maps) {
    return Promise.resolve(window.google.maps);
  }

  if (!googleMapsScriptPromise) {
    googleMapsScriptPromise = new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=routes`;
      script.async = true;
      script.defer = true;
      script.onload = () => resolve(window.google.maps);
      script.onerror = () => reject(new Error("Failed to load Google Maps JavaScript API."));
      document.head.appendChild(script);
    });
  }

  return googleMapsScriptPromise;
}

function normalizeMapPoint(point) {
  if (Array.isArray(point) && point.length >= 2) {
    const lat = Number(point[0]);
    const lng = Number(point[1]);

    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
      return null;
    }

    return { lat, lng };
  }

  if (point && typeof point === "object") {
    const lat = Number(point.lat ?? point.latitude);
    const lng = Number(point.lng ?? point.longitude);

    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
      return null;
    }

    return { lat, lng };
  }

  return null;
}

function ShipmentMap({ center, path, height }) {
  const mapElementRef = useRef(null);
  const mapRef = useRef(null);
  const markersRef = useRef([]);
  const directionsRendererRef = useRef(null);
  const fallbackPolylineRef = useRef(null);

  useEffect(() => {
    let isCancelled = false;

    async function renderRoute() {
      const routePoints = path.map(normalizeMapPoint).filter(Boolean);

      try {
        const maps = await loadGoogleMaps();

        if (isCancelled || !mapElementRef.current) {
          return;
        }

        if (!mapRef.current) {
          mapRef.current = new maps.Map(mapElementRef.current, {
            center: { lat: 28.756563, lng: 77.495548 },
            zoom: 13
          });
        }

        if (!directionsRendererRef.current) {
          directionsRendererRef.current = new maps.DirectionsRenderer({
            suppressMarkers: true
          });
          directionsRendererRef.current.setMap(mapRef.current);
        } else {
          directionsRendererRef.current.setDirections({ routes: [] });
        }

        markersRef.current.forEach((marker) => marker.setMap(null));
        markersRef.current = [];

        if (fallbackPolylineRef.current) {
          fallbackPolylineRef.current.setMap(null);
          fallbackPolylineRef.current = null;
        }

        if (!routePoints.length) {
          mapRef.current.setCenter(center);
          mapRef.current.setZoom(13);
          return;
        }

        markersRef.current = routePoints.map(
          (point, index) =>
            new maps.Marker({
              map: mapRef.current,
              position: point,
              title:
                index === 0
                  ? "Origin"
                  : index === routePoints.length - 1
                    ? "Destination"
                    : `Waypoint ${index}`
            })
        );

        if (routePoints.length === 1) {
          mapRef.current.setCenter(routePoints[0]);
          mapRef.current.setZoom(13);
          return;
        }

        const directionsService = new maps.DirectionsService();
        const directionsResult = await directionsService.route({
          origin: routePoints[0],
          destination: routePoints[routePoints.length - 1],
          waypoints: routePoints.slice(1, -1).map((point) => ({
            location: point,
            stopover: true
          })),
          travelMode: maps.TravelMode.DRIVING
        });

        if (isCancelled) {
          return;
        }

        directionsRendererRef.current.setDirections(directionsResult);

        const routeBounds = new maps.LatLngBounds();
        directionsResult.routes[0]?.overview_path?.forEach((latLng) => {
          routeBounds.extend(latLng);
        });

        if (!routeBounds.isEmpty()) {
          mapRef.current.fitBounds(routeBounds);
        }
      } catch (error) {
        if (isCancelled) {
          return;
        }

        console.error("Failed to render Google Maps directions.", error);

        if (window.google?.maps && routePoints.length > 1) {
          fallbackPolylineRef.current = new window.google.maps.Polyline({
            path: routePoints,
            strokeColor: "#2563eb",
            strokeOpacity: 0.8,
            strokeWeight: 4
          });
          fallbackPolylineRef.current.setMap(mapRef.current);

          const fallbackBounds = new window.google.maps.LatLngBounds();
          routePoints.forEach((point) => fallbackBounds.extend(point));
          if (!fallbackBounds.isEmpty()) {
            mapRef.current.fitBounds(fallbackBounds);
          }
        }
      }
    }

    renderRoute();

    return () => {
      isCancelled = true;
    };
  }, [center, path]);

  useEffect(() => {
    return () => {
      markersRef.current.forEach((marker) => marker.setMap(null));
      markersRef.current = [];

      if (fallbackPolylineRef.current) {
        fallbackPolylineRef.current.setMap(null);
        fallbackPolylineRef.current = null;
      }

      if (directionsRendererRef.current) {
        directionsRendererRef.current.setMap(null);
        directionsRendererRef.current = null;
      }
    };
  }, []);

  return (
    <div className="relative z-0 h-full w-full overflow-hidden rounded-xl" style={{ height }}>
      <div ref={mapElementRef} className="z-0 h-full w-full" />
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
