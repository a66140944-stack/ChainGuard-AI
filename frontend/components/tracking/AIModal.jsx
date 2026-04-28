"use client";

import { useEffect, useMemo } from "react";
import { Sparkles, X } from "lucide-react";

function buildSummary(shipment) {
  const explanation = shipment?.backendData?.gemini_explanation;
  if (explanation) {
    return explanation
      .split(".")
      .map((part) => part.trim())
      .filter(Boolean)
      .slice(0, 3)
      .join(". ")
      .concat(".");
  }

  const status = String(shipment?.status || shipment?.backendData?.action || "In Transit").toLowerCase();
  const temperature =
    shipment?.temperatureC != null ? `${shipment.temperatureC} C` : shipment?.backendData?.temperature_c != null ? `${shipment.backendData.temperature_c} C` : "current telemetry";

  if (status.includes("delay")) {
    return `Shipment progress shows a delay signal. Current conditions remain under review, with temperature at ${temperature}. Operations should watch the next telemetry update closely.`;
  }

  return `Shipment is currently stable with ${temperature}. AI monitoring remains active and will flag any route or condition changes that raise delivery risk.`;
}

export default function AIModal({ isOpen, onClose, shipment }) {
  const summary = useMemo(() => buildSummary(shipment), [shipment]);

  useEffect(() => {
    if (!isOpen) return undefined;

    function handleEscape(event) {
      if (event.key === "Escape") onClose?.();
    }

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen || !shipment) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/35 p-4 backdrop-blur-md"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="w-full max-w-xl rounded-[28px] border border-white/70 bg-white/95 shadow-[0_30px_90px_rgba(15,23,42,0.18)]"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="tracking-ai-modal-title"
      >
        <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-6 py-5">
          <div className="flex items-center gap-3">
            <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-blue-700">
              <Sparkles className="h-5 w-5" />
            </span>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">AI Summary</p>
              <h3 id="tracking-ai-modal-title" className="mt-1 text-xl font-semibold text-slate-950">
                {shipment?.shipmentNumber || shipment?.id}
              </h3>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-500 transition hover:bg-slate-50 hover:text-slate-900"
            aria-label="Close AI summary"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="px-6 py-6">
          <p className="text-sm leading-7 text-slate-600">{summary}</p>
        </div>
      </div>
    </div>
  );
}
