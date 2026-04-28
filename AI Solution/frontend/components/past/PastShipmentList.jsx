"use client";

import PastShipmentCard from "./PastShipmentCard.jsx";

function LoadingCard() {
  return (
    <div className="rounded-xl border border-slate-200/80 bg-white/90 p-4 shadow-sm">
      <div className="h-5 w-44 animate-pulse rounded-full bg-slate-200" />
      <div className="mt-3 h-4 w-28 animate-pulse rounded-full bg-slate-100" />
      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <div className="h-12 animate-pulse rounded-xl bg-slate-100" />
        <div className="h-12 animate-pulse rounded-xl bg-slate-100" />
      </div>
    </div>
  );
}

export default function PastShipmentList({ shipments, loading, companyName }) {
  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <LoadingCard key={index} />
        ))}
      </div>
    );
  }

  if (!shipments.length) {
    return (
      <div className="rounded-3xl border border-dashed border-slate-300 bg-white/75 px-6 py-16 text-center shadow-sm">
        <p className="text-lg font-semibold text-slate-900">No completed shipments yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {shipments.map((shipment) => (
        <PastShipmentCard
          key={shipment.id}
          shipment={shipment}
          companyName={companyName}
        />
      ))}
    </div>
  );
}
