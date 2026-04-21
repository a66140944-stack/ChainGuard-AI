"use client";

import DashboardShell from "../../components/DashboardShell.jsx";
import LiveGpsLeafletMap from "../../components/LiveGpsLeafletMap.jsx";
import { useShipments } from "../../context/ShipmentContext.jsx";

function DetailCard({ label, value, tone = "default" }) {
  const toneClass =
    tone === "danger"
      ? "text-danger-500"
      : tone === "warning"
        ? "text-warning-500"
        : tone === "success"
          ? "text-success-500"
          : "text-foreground";

  return (
    <div className="rounded-[24px] border border-white/10 bg-surface p-5 shadow-xl shadow-slate-950/5 backdrop-blur-xl">
      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted">{label}</p>
      <p className={`mt-3 text-2xl font-semibold ${toneClass}`}>{value}</p>
    </div>
  );
}

export default function TrackPage() {
  const { selectedShipment, riskPillClass } = useShipments();

  if (!selectedShipment) {
    return (
      <DashboardShell>
        <div className="rounded-[32px] border border-white/10 bg-surface p-8 shadow-xl shadow-slate-950/5 backdrop-blur-xl">
          <h1 className="text-2xl font-semibold">No shipment selected</h1>
          <p className="mt-2 text-sm text-muted">Choose a shipment from the dashboard to open the tracking view.</p>
        </div>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell>
      <div className="space-y-6">
        <section className="rounded-[32px] border border-white/10 bg-surface p-6 shadow-xl shadow-slate-950/5 backdrop-blur-xl">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-brand-600">Live Tracking</p>
              <h1 className="mt-2 text-3xl font-semibold tracking-tight">{selectedShipment.shipmentNumber}</h1>
            </div>
            <div className="inline-flex items-center gap-2 rounded-full border border-success-500/25 bg-success-500/10 px-4 py-2 text-sm font-medium text-success-500">
              <span className="h-2 w-2 animate-pulse rounded-full bg-success-500" />
              On Route | Monitoring active
            </div>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <DetailCard label="Shipment ID" value={selectedShipment.shipmentNumber} />
            <DetailCard label="Status" value={selectedShipment.status} />
            <DetailCard label="Predicted ETA" value={selectedShipment.predictedDeliveryDate} />
            <DetailCard
              label="Temperature"
              value={`${selectedShipment.temperatureC}°C`}
              tone={selectedShipment.temperatureC > 8 ? "warning" : "success"}
            />
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-[32px] border border-white/10 bg-surface p-6 shadow-xl shadow-slate-950/5 backdrop-blur-xl">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold">Route overview</h2>
                <p className="mt-1 text-sm text-muted">
                  {selectedShipment.fromLocation} to {selectedShipment.toLocation}
                </p>
              </div>
              <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${riskPillClass(selectedShipment.riskLevel)}`}>
                Risk {selectedShipment.riskLevel}
              </span>
            </div>

            <div className="mt-6">
              <LiveGpsLeafletMap />
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-[32px] border border-white/10 bg-surface p-6 shadow-xl shadow-slate-950/5 backdrop-blur-xl">
              <h2 className="text-xl font-semibold">Shipment details</h2>
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-white/10 bg-surface-strong/50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">Current location</p>
                  <p className="mt-2 font-semibold">{selectedShipment.currentLocation.label}</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-surface-strong/50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">Vehicle</p>
                  <p className="mt-2 font-semibold">{selectedShipment.vehicleNumber}</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-surface-strong/50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">IoT device</p>
                  <p className="mt-2 font-semibold">{selectedShipment.deviceId}</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-surface-strong/50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">Logistics type</p>
                  <p className="mt-2 font-semibold">{selectedShipment.logisticsType}</p>
                </div>
              </div>
            </div>

            <div className="rounded-[32px] border border-white/10 bg-surface p-6 shadow-xl shadow-slate-950/5 backdrop-blur-xl">
              <h2 className="text-xl font-semibold">AI summary</h2>
              <div className="mt-5 space-y-4">
                <div className="rounded-2xl border border-white/10 bg-surface-strong/50 p-4">
                  <p className="text-sm font-semibold">Predicted delivery date</p>
                  <p className="mt-2 text-sm text-muted">{selectedShipment.predictedDeliveryDate}</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-surface-strong/50 p-4">
                  <p className="text-sm font-semibold">Risk level</p>
                  <p className="mt-2 text-sm text-muted">Current forecast indicates {selectedShipment.riskLevel.toLowerCase()} operational risk based on route, fragility, and telemetry.</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </DashboardShell>
  );
}
