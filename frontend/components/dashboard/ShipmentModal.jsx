"use client";

import { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, MapPinned, X } from "lucide-react";
import {
  formatShipmentDate,
  getShipmentArrivalDate,
  getShipmentCompanyName,
  getShipmentName,
  getShipmentRiskScore
} from "./ShipmentCard.jsx";

function DetailItem({ label, value }) {
  return (
    <div className="rounded-2xl border border-slate-200/70 bg-slate-50/80 p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">{label}</p>
      <p className="mt-2 text-sm font-medium text-slate-800">{value || "Not available"}</p>
    </div>
  );
}

export default function ShipmentModal({ shipment, companyName, isOpen, onClose, onTrackShipment }) {
  const router = useRouter();

  useEffect(() => {
    if (!isOpen) return undefined;

    function handleEscape(event) {
      if (event.key === "Escape") onClose?.();
    }

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  const detailItems = useMemo(() => {
    if (!shipment) return [];

    return [
      { label: "Shipment Name", value: getShipmentName(shipment) },
      { label: "Company Name", value: getShipmentCompanyName(shipment, companyName) },
      { label: "Origin", value: shipment.fromLocation || shipment.origin || shipment.backendData?.origin },
      { label: "Destination", value: shipment.toLocation || shipment.destination || shipment.backendData?.destination },
      { label: "Departure Date", value: formatShipmentDate(shipment.startDate || shipment.backendData?.timestamp) },
      { label: "Arrival Date", value: formatShipmentDate(getShipmentArrivalDate(shipment)) },
      { label: "Status", value: shipment.status || shipment.backendData?.action || "In Transit" },
      { label: "Risk Score", value: `${getShipmentRiskScore(shipment)}%` },
      { label: "Cargo Type", value: shipment.logisticsType || shipment.backendData?.cargo_type },
      { label: "IoT Device", value: shipment.deviceId || shipment.backendData?.device_id },
      { label: "Vehicle Number", value: shipment.vehicleNumber || shipment.backendData?.vehicle_number },
      {
        label: "Temperature",
        value:
          shipment.temperatureC != null
            ? `${shipment.temperatureC} C`
            : shipment.backendData?.temperature_c != null
              ? `${shipment.backendData.temperature_c} C`
              : null
      },
      { label: "Fragility", value: shipment.fragility },
      { label: "Current Location", value: shipment.currentLocation?.label },
      {
        label: "Delay",
        value:
          shipment.delayDays != null
            ? `${shipment.delayDays} day(s)`
            : shipment.backendData?.delay_minutes != null
              ? `${shipment.backendData.delay_minutes} minute(s)`
              : null
      }
    ];
  }, [companyName, shipment]);

  if (!isOpen || !shipment) return null;

  function handleTrackShipment() {
    onTrackShipment?.(shipment);
    router.push(`/tracking?shipmentId=${encodeURIComponent(shipment.id)}`);
    onClose?.();
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/35 p-4 backdrop-blur-md"
      onClick={onClose}
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="shipment-modal-title"
        className="flex max-h-[80vh] w-full max-w-4xl flex-col overflow-hidden rounded-[28px] border border-white/70 bg-white/95 shadow-[0_30px_90px_rgba(15,23,42,0.18)]"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="shrink-0 border-b border-slate-200 px-6 py-5 sm:px-8">
          <div className="flex items-start justify-between gap-6">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">Shipment Details</p>
              <h2 id="shipment-modal-title" className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
                {getShipmentName(shipment)}
              </h2>
              <p className="mt-2 text-sm text-slate-500">
                {shipment.fromLocation || shipment.backendData?.origin || "Origin"} to{" "}
                {shipment.toLocation || shipment.backendData?.destination || "Destination"}
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-500 transition hover:bg-slate-50 hover:text-slate-900"
              aria-label="Close shipment details"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-6 sm:px-8">
          <div className="space-y-6">
            <div className="rounded-3xl border border-slate-200/80 bg-slate-50/80 p-5">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-900">{getShipmentCompanyName(shipment, companyName)}</p>
                  <p className="mt-1 text-sm text-slate-500">
                    Expected arrival {formatShipmentDate(getShipmentArrivalDate(shipment))}
                  </p>
                </div>
                <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700">
                  <MapPinned className="h-4 w-4" />
                  Track this shipment live
                </div>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {detailItems.map((item) => (
                <DetailItem key={item.label} label={item.label} value={item.value} />
              ))}
            </div>

            {shipment.backendData?.gemini_explanation ? (
              <div className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-[0_10px_30px_rgba(15,23,42,0.05)]">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">AI Summary</p>
                <p className="mt-3 text-sm leading-7 text-slate-600">{shipment.backendData.gemini_explanation}</p>
              </div>
            ) : null}
          </div>
        </div>

        <div className="shrink-0 border-t border-slate-200 px-6 py-5 sm:px-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-11 items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Close
            </button>
            <button
              type="button"
              onClick={handleTrackShipment}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-slate-950 px-5 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              Track Shipment
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
