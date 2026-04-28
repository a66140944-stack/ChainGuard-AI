"use client";

import { useEffect, useMemo } from "react";
import { Cpu, X } from "lucide-react";

function encode(value) {
  return encodeURIComponent(String(value ?? ""));
}

function buildIframeSrc(shipment) {
  const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:5000";
  const shipmentId = shipment?.id || `SHP-SIM-${Date.now()}`;
  const origin = shipment?.fromLocation || shipment?.backendData?.origin || "Mumbai";
  const destination = shipment?.toLocation || shipment?.backendData?.destination || "Delhi";
  const carrier = shipment?.backendData?.carrier || shipment?.vehicleNumber || "ChainGuard Fleet";
  const cargoType = shipment?.backendData?.cargo_type || shipment?.logisticsType || "Road";

  return (
    `/simulatorpage.html?api_base=${encode(apiBase)}` +
    `&shipment_id=${encode(shipmentId)}` +
    `&origin=${encode(origin)}` +
    `&destination=${encode(destination)}` +
    `&carrier=${encode(carrier)}` +
    `&cargo_type=${encode(cargoType)}`
  );
}

export default function TelemetrySimulatorModal({ isOpen, onClose, shipment }) {
  const iframeSrc = useMemo(() => buildIframeSrc(shipment), [shipment]);

  useEffect(() => {
    if (!isOpen) return undefined;

    function handleEscape(event) {
      if (event.key === "Escape") onClose?.();
    }

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/35 p-4 backdrop-blur-md"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="flex h-[88vh] w-full max-w-6xl flex-col overflow-hidden rounded-[28px] border border-white/70 bg-white/95 shadow-[0_30px_90px_rgba(15,23,42,0.18)]"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="telemetry-simulator-title"
      >
        <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-6 py-5">
          <div className="flex items-center gap-3">
            <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-900 text-white">
              <Cpu className="h-5 w-5" />
            </span>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
                Virtual ESP Telemetry
              </p>
              <h3 id="telemetry-simulator-title" className="mt-1 text-xl font-semibold text-slate-950">
                Simulator for {shipment?.id || "Selected Shipment"}
              </h3>
              <p className="mt-1 text-sm text-slate-500">
                Change temperature, battery, speed, and location. The backend ingests the reading and pushes AI
                predictions back to this tracking page in real time.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-500 transition hover:bg-slate-50 hover:text-slate-900"
            aria-label="Close simulator"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 bg-black">
          <iframe title="ChainGuard IoT Simulator" src={iframeSrc} className="h-full w-full border-0" />
        </div>
      </div>
    </div>
  );
}

