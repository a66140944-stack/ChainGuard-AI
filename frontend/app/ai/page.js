"use client";

import DashboardShell from "../../components/DashboardShell.jsx";
import { useShipments } from "../../context/ShipmentContext.jsx";

export default function AiPage() {
  const { selectedShipment } = useShipments();

  return (
    <DashboardShell>
      <div className="space-y-6">
        <section className="rounded-[32px] border border-white/10 bg-surface p-6 shadow-xl shadow-slate-950/5 backdrop-blur-xl">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-brand-600">AI Analysis</p>
              <h1 className="mt-3 text-3xl font-semibold tracking-tight">Decision support insights</h1>
            </div>
            <div className="rounded-full border border-success-500/25 bg-success-500/10 px-4 py-2 text-sm font-medium text-success-500">
              Model active | Mock inference mode
            </div>
          </div>
        </section>

        <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
          <div className="rounded-[32px] border border-white/10 bg-surface p-6 shadow-xl shadow-slate-950/5 backdrop-blur-xl">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted">Highlighted Risk</p>
            <div className="mt-4 rounded-[28px] border border-white/10 bg-surface-strong/50 p-6">
              <p className="text-5xl font-semibold">
                {selectedShipment?.riskLevel === "High" ? "87" : selectedShipment?.riskLevel === "Medium" ? "58" : "22"}
              </p>
              <p className="mt-3 text-sm text-muted">
                {selectedShipment
                  ? `Shipment ${selectedShipment.shipmentNumber} is currently assessed as ${selectedShipment.riskLevel.toLowerCase()} risk.`
                  : "Select a shipment to view more specific analysis."}
              </p>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {[
              {
                title: "Delay prediction",
                description: "Potential delay driven by tolerance threshold and route progression."
              },
              {
                title: "Risk alerts",
                description: "Environmental and fragility conditions are monitored for intervention."
              },
              {
                title: "Optimization suggestions",
                description: "Re-route, alert dispatch, or preemptively notify downstream teams."
              },
              {
                title: "AI monitoring",
                description: "Temperature anomalies, route drift, and ETA confidence are ready for integration."
              }
            ].map((item) => (
              <article key={item.title} className="rounded-[28px] border border-white/10 bg-surface p-6 shadow-xl shadow-slate-950/5 backdrop-blur-xl">
                <h2 className="text-lg font-semibold">{item.title}</h2>
                <p className="mt-3 text-sm leading-6 text-muted">{item.description}</p>
                <button
                  type="button"
                  className="mt-5 inline-flex h-10 items-center justify-center rounded-2xl border border-white/10 bg-white/70 px-4 text-sm font-semibold shadow-sm transition hover:bg-white dark:bg-white/5 dark:hover:bg-white/10"
                >
                  Review
                </button>
              </article>
            ))}
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
