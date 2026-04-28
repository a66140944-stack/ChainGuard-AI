"use client";

import { ExternalLink, Route } from "lucide-react";

function getRerouting(shipment) {
  return shipment?.backendData?.rerouting || shipment?.backendData?.reroute || null;
}

function formatMinutes(value) {
  if (value == null) return null;
  const num = Number(value);
  if (!Number.isFinite(num)) return null;
  return `${Math.max(0, Math.round(num))} min`;
}

function buildGoogleMapsUrl(shipment) {
  const lat = shipment?.backendData?.lat ?? shipment?.currentLocation?.lat;
  const lng = shipment?.backendData?.lng ?? shipment?.currentLocation?.lng;
  const destination = shipment?.backendData?.destination || shipment?.toLocation;
  if (lat == null || lng == null || !destination) return null;

  const origin = `${lat},${lng}`;
  return `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(
    origin
  )}&destination=${encodeURIComponent(destination)}&travelmode=driving`;
}

export default function ReroutingCard({ shipment }) {
  const rerouting = getRerouting(shipment);
  const primary = rerouting?.primary || rerouting?.primary_route || null;
  const alternate = rerouting?.alternate || rerouting?.alternate_route || null;

  const primaryDuration = formatMinutes(primary?.duration_min);
  const alternateDuration = formatMinutes(alternate?.duration_min);

  const shouldReroute =
    Boolean(alternate) &&
    primary?.duration_min != null &&
    alternate?.duration_min != null &&
    Number(alternate.duration_min) < Number(primary.duration_min);

  const mapsUrl = buildGoogleMapsUrl(shipment);

  return (
    <section className="rounded-xl border border-slate-200/80 bg-white/90 p-4 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">Rerouting</p>
          <h2 className="mt-2 text-lg font-semibold text-slate-950">Route decision</h2>
          <p className="mt-1 text-sm text-slate-500">
            Uses OpenRouteService (or fallback) to compare primary vs alternate routes.
          </p>
        </div>
        {mapsUrl ? (
          <a
            href={mapsUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
          >
            <ExternalLink className="h-4 w-4" />
            Open in Google Maps
          </a>
        ) : null}
      </div>

      {!rerouting ? (
        <div className="mt-5 rounded-xl border border-dashed border-slate-200 bg-slate-50/80 px-4 py-6 text-sm text-slate-500">
          No rerouting data yet. Increase risk (speed drop, temperature spike, external event) to trigger route
          evaluation.
        </div>
      ) : (
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <div className="rounded-xl border border-slate-200/80 bg-slate-50/80 p-4">
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Primary</p>
              <Route className="h-4 w-4 text-slate-400" />
            </div>
            <div className="mt-3 space-y-2 text-sm text-slate-600">
              <div className="flex items-center justify-between gap-3">
                <span>Distance</span>
                <span className="font-semibold text-slate-900">
                  {primary?.distance_km != null ? `${primary.distance_km} km` : "Not available"}
                </span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span>Duration</span>
                <span className="font-semibold text-slate-900">{primaryDuration || "Not available"}</span>
              </div>
              <div className="text-xs text-slate-400">Source: {rerouting?.source || primary?.source || "unknown"}</div>
            </div>
          </div>

          <div
            className={`rounded-xl border p-4 ${
              shouldReroute ? "border-amber-200 bg-amber-50/70" : "border-slate-200/80 bg-slate-50/80"
            }`}
          >
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Alternate</p>
              <Route className={`h-4 w-4 ${shouldReroute ? "text-amber-600" : "text-slate-400"}`} />
            </div>
            <div className="mt-3 space-y-2 text-sm text-slate-600">
              <div className="flex items-center justify-between gap-3">
                <span>Distance</span>
                <span className={`font-semibold ${shouldReroute ? "text-amber-700" : "text-slate-900"}`}>
                  {alternate?.distance_km != null ? `${alternate.distance_km} km` : "Not available"}
                </span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span>Duration</span>
                <span className={`font-semibold ${shouldReroute ? "text-amber-700" : "text-slate-900"}`}>
                  {alternateDuration || "Not available"}
                </span>
              </div>
              <div className={`text-xs ${shouldReroute ? "text-amber-700" : "text-slate-400"}`}>
                {shouldReroute ? "Recommendation: Reroute now (faster alternate found)." : "Recommendation: Monitor."}
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

