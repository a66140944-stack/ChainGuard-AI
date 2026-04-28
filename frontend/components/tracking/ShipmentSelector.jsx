"use client";

function getShipmentLabel(shipment) {
  return shipment?.shipmentNumber || shipment?.id || "Unknown Shipment";
}

export default function ShipmentSelector({
  shipments,
  selectedShipmentId,
  onChange,
  disabled = false
}) {
  return (
    <section className="rounded-xl border border-slate-200/80 bg-white/90 p-4 shadow-sm">
      <label htmlFor="tracking-shipment-selector" className="block text-sm font-semibold text-slate-900">
        Select Shipment
      </label>
      <p className="mt-1 text-sm text-slate-500">Switch between active shipments to review live telemetry and AI insights.</p>
      <select
        id="tracking-shipment-selector"
        value={selectedShipmentId || ""}
        onChange={(event) => onChange?.(event.target.value)}
        disabled={disabled || shipments.length === 0}
        className="mt-4 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 shadow-sm outline-none transition focus:border-slate-400 focus:ring-4 focus:ring-slate-200/60 disabled:cursor-not-allowed disabled:bg-slate-50"
      >
        {shipments.length === 0 ? (
          <option value="">No active shipments</option>
        ) : null}
        {shipments.map((shipment) => (
          <option key={shipment.id} value={shipment.id}>
            {getShipmentLabel(shipment)}
          </option>
        ))}
      </select>
    </section>
  );
}
