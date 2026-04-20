"use client";

function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString(undefined, {
    day: "2-digit",
    month: "short",
    year: "numeric"
  });
}

export default function ShipmentCard({ shipment, isActive, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-[320px] shrink-0 rounded-3xl border p-5 text-left shadow-lg shadow-slate-950/5 transition hover:-translate-y-1 hover:shadow-xl ${
        isActive
          ? "border-brand-500/40 bg-brand-500/10 ring-2 ring-brand-500/20"
          : "border-white/10 bg-surface"
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">Shipment</p>
          <h3 className="mt-2 text-lg font-semibold">{shipment.shipmentNumber}</h3>
        </div>
        <span className="rounded-full border border-white/10 bg-white/60 px-3 py-1 text-xs font-semibold dark:bg-white/5">
          {shipment.status}
        </span>
      </div>

      <div className="mt-5">
        <p className="text-sm font-medium">
          {shipment.fromLocation} <span className="text-muted">→</span> {shipment.toLocation}
        </p>
        <p className="mt-2 text-sm text-muted">
          {formatDate(shipment.startDate)} <span className="px-1">→</span> {formatDate(shipment.endDate)}
        </p>
      </div>
    </button>
  );
}
