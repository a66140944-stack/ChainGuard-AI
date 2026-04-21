"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Circle, MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import L from "leaflet";

function FixLeafletMarkerIcons() {
  useEffect(() => {
    // Next.js bundling often breaks Leaflet's default icon URL resolution.
    // Use CDN-hosted assets to keep markers working without extra config.
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
      iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
      shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png"
    });
  }, []);

  return null;
}

function RecenterOnPosition({ position }) {
  const map = useMap();

  useEffect(() => {
    if (!position) return;
    map.setView([position.lat, position.lng], Math.max(map.getZoom(), 16), { animate: true });
  }, [map, position]);

  return null;
}

export default function LiveGpsLeafletMap({
  className,
  height = 420,
  initialCenter = { lat: 20.5937, lng: 78.9629 }, // India
  initialZoom = 5
}) {
  const [position, setPosition] = useState(null);
  const [geoError, setGeoError] = useState("");
  const [isWatching, setIsWatching] = useState(false);
  const watchIdRef = useRef(null);

  const canUseGeolocation = typeof window !== "undefined" && "geolocation" in navigator;

  const startWatching = () => {
    setGeoError("");
    if (!canUseGeolocation) {
      setGeoError("Geolocation is not available in this browser.");
      return;
    }

    if (watchIdRef.current != null) return;

    setIsWatching(true);
    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        setPosition({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracyM: pos.coords.accuracy ?? null,
          speedMps: pos.coords.speed ?? null,
          headingDeg: pos.coords.heading ?? null,
          timestamp: pos.timestamp
        });
      },
      (err) => {
        setGeoError(err?.message || "Unable to read GPS position.");
        setIsWatching(false);
        if (watchIdRef.current != null) {
          navigator.geolocation.clearWatch(watchIdRef.current);
          watchIdRef.current = null;
        }
      },
      {
        enableHighAccuracy: true,
        maximumAge: 1000,
        timeout: 15000
      }
    );
  };

  const stopWatching = () => {
    if (!canUseGeolocation) return;
    if (watchIdRef.current != null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    setIsWatching(false);
  };

  useEffect(() => {
    startWatching();
    return () => stopWatching();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const center = useMemo(() => {
    if (position) return [position.lat, position.lng];
    return [initialCenter.lat, initialCenter.lng];
  }, [position, initialCenter.lat, initialCenter.lng]);

  return (
    <div className={className}>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold">Real-time GPS</p>
          <p className="mt-1 text-xs text-muted">
            {position
              ? `Lat ${position.lat.toFixed(6)}, Lng ${position.lng.toFixed(6)}`
              : "Waiting for location permission / first GPS fix..."}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={startWatching}
            className="rounded-full border border-white/10 bg-surface-strong/60 px-4 py-2 text-xs font-semibold hover:bg-surface-strong"
          >
            Start
          </button>
          <button
            type="button"
            onClick={stopWatching}
            className="rounded-full border border-white/10 bg-surface-strong/30 px-4 py-2 text-xs font-semibold hover:bg-surface-strong/60"
          >
            Stop
          </button>
          <span className="rounded-full border border-white/10 bg-surface-strong/20 px-3 py-1 text-[11px] font-semibold text-muted">
            {isWatching ? "Watching" : "Paused"}
          </span>
        </div>
      </div>

      {geoError ? (
        <div className="rounded-[24px] border border-danger-500/30 bg-danger-500/10 p-4 text-sm text-foreground">
          <p className="font-semibold">Location error</p>
          <p className="mt-1 text-sm text-muted">{geoError}</p>
          <p className="mt-3 text-xs text-muted">
            Tip: Use HTTPS or `localhost`, and allow location permission in the browser.
          </p>
        </div>
      ) : null}

      <div className="overflow-hidden rounded-[28px] border border-white/10" style={{ height }}>
        <MapContainer center={center} zoom={position ? 17 : initialZoom} style={{ height: "100%", width: "100%" }}>
          <FixLeafletMarkerIcons />
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <RecenterOnPosition position={position} />
          {position ? (
            <>
              <Marker position={[position.lat, position.lng]}>
                <Popup>
                  <div style={{ minWidth: 220 }}>
                    <div style={{ fontWeight: 700 }}>Current position</div>
                    <div>Lat: {position.lat.toFixed(6)}</div>
                    <div>Lng: {position.lng.toFixed(6)}</div>
                    {position.accuracyM != null ? <div>Accuracy: {Math.round(position.accuracyM)} m</div> : null}
                    {position.speedMps != null ? <div>Speed: {position.speedMps.toFixed(1)} m/s</div> : null}
                    {position.headingDeg != null ? <div>Heading: {Math.round(position.headingDeg)}°</div> : null}
                  </div>
                </Popup>
              </Marker>
              {position.accuracyM != null ? (
                <Circle
                  center={[position.lat, position.lng]}
                  radius={position.accuracyM}
                  pathOptions={{ color: "#22d3ee", fillColor: "#22d3ee", fillOpacity: 0.12 }}
                />
              ) : null}
            </>
          ) : null}
        </MapContainer>
      </div>
    </div>
  );
}

