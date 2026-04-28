"use client";

import { AlertTriangle, MapPin, Package2, Thermometer } from "lucide-react";
import { getShipmentRiskScore } from "../dashboard/ShipmentCard.jsx";

function getStatusAppearance(shipment) {
  const riskScore = getShipmentRiskScore(shipment);
  const status = String(shipment?.status || shipment?.backendData?.action || "In Transit");
  const normalizedStatus = status.trim().toLowerCase();

  if (riskScore >= 71 || normalizedStatus.includes("risk")) {
    return {
      label: "Risky",
      className: "border-red-200 bg-red-50 text-red-700"
    };
  }

  if (normalizedStatus.includes("delay")) {
    return {
      label: "Delayed",
      className: "border-amber-200 bg-amber-50 text-amber-700"
    };
  }

  return {
    label: "In Transit",
    className: "border-emerald-200 bg-emerald-50 text-emerald-700"
  };
}

function SummaryItem({ icon: Icon, label, value }) {
  return (
    <div className="rounded-xl border border-slate-200/80 bg-slate-50/80 p-4">
      <div className="flex items-center gap-2 text-slate-400">
        <Icon className="h-4 w-4" />
        <p className="text-xs font-semibold uppercase tracking-[0.2em]">{label}</p>
      </div>
      <p className="mt-3 text-sm font-semibold text-slate-900">{value || "Not available"}</p>
    </div>
  );
}

export default function SummaryBar({ shipment }) {
  const statusAppearance = getStatusAppearance(shipment);
  const temperatureValue =
    shipment?.temperatureC != null
      ? `${shipment.temperatureC} C`
      : shipment?.backendData?.temperature_c != null
        ? `${shipment.backendData.temperature_c} C`
        : "Not available";

  return (
    <section className="rounded-xl border border-slate-200/80 bg-white/90 p-4 shadow-sm">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">Track Shipment</p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
            {shipment?.shipmentNumber || shipment?.id || "Shipment"}
          </h1>
        </div>
        <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-sm font-semibold ${statusAppearance.className}`}>
          <AlertTriangle className="h-4 w-4" />
          {statusAppearance.label}
        </span>
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <SummaryItem icon={Package2} label="Shipment" value={shipment?.shipmentNumber || shipment?.id} />
        <SummaryItem icon={AlertTriangle} label="Status" value={statusAppearance.label} />
        <SummaryItem icon={MapPin} label="Current Location" value={shipment?.currentLocation?.label || shipment?.fromLocation} />
        <SummaryItem icon={Thermometer} label="Current Temperature" value={temperatureValue} />
      </div>
    </section>
  );
}
