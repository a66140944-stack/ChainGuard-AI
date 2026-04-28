"use client";

import ShipmentCard from "./ShipmentCard.jsx";

function LoadingRow() {
  return (
    <div className="animate-pulse rounded-3xl border border-slate-200/70 bg-white/80 p-5 shadow-[0_10px_30px_rgba(15,23,42,0.04)]">
      <div className="h-5 w-48 rounded-full bg-slate-200" />
      <div className="mt-3 h-4 w-32 rounded-full bg-slate-100" />
      <div className="mt-5 h-3 w-full rounded-full bg-slate-100" />
    </div>
  );
}

export default function ShipmentList({ shipments, loading, companyName, onShipmentClick }) {
  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, index) => (
          <LoadingRow key={index} />
        ))}
      </div>
    );
  }

  if (!shipments.length) {
    return (
      <div className="rounded-3xl border border-dashed border-slate-300 bg-white/75 px-6 py-16 text-center shadow-[0_10px_30px_rgba(15,23,42,0.04)]">
        <p className="text-lg font-semibold text-slate-900">No shipments available</p>
        <p className="mt-2 text-sm text-slate-500">Create a shipment to start tracking activity across your network.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {shipments.map((shipment) => (
        <ShipmentCard
          key={shipment.id}
          shipment={shipment}
          companyName={companyName}
          onClick={() => onShipmentClick?.(shipment)}
        />
      ))}
    </div>
  );
}
