"use client";

import DashboardShell from "../../components/DashboardShell.jsx";
import { useShipments } from "../../context/ShipmentContext.jsx";

function statusTone(status) {
  if (status === "Delivered") return "bg-success-500/10 text-success-500";
  if (status === "Delayed") return "bg-warning-500/10 text-warning-500";
  return "bg-brand-500/10 text-brand-600";
}

export default function PastShipmentsPage() {
  const { shipments } = useShipments();
  const deliveredShipments = shipments.filter((shipment) => shipment.status === "Delivered");

  return (
    <DashboardShell>
      <div className="space-y-6">
        <section className="rounded-[32px] border border-white/10 bg-surface p-6 shadow-xl shadow-slate-950/5 backdrop-blur-xl">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-brand-600">History</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight">Past shipments</h1>
          <p className="mt-2 text-sm text-muted">Review completed shipment records in a clean table layout.</p>
        </section>

        <section className="overflow-hidden rounded-[32px] border border-white/10 bg-surface shadow-xl shadow-slate-950/5 backdrop-blur-xl">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-white/10 text-left text-xs uppercase tracking-[0.18em] text-muted">
                  <th className="px-6 py-4">Shipment</th>
                  <th className="px-6 py-4">Route</th>
                  <th className="px-6 py-4">Delivered Date</th>
                  <th className="px-6 py-4">Status</th>
                </tr>
              </thead>
              <tbody>
                {deliveredShipments.length > 0 ? (
                  deliveredShipments.map((shipment) => (
                    <tr key={shipment.id} className="border-b border-white/10 last:border-b-0">
                      <td className="px-6 py-4 font-semibold">{shipment.shipmentNumber}</td>
                      <td className="px-6 py-4 text-sm text-muted">{shipment.fromLocation} → {shipment.toLocation}</td>
                      <td className="px-6 py-4 text-sm text-muted">{shipment.deliveredDate ?? "-"}</td>
                      <td className="px-6 py-4">
                        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusTone(shipment.status)}`}>
                          {shipment.status}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="px-6 py-8 text-sm text-muted">
                      No past shipments available yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </DashboardShell>
  );
}
