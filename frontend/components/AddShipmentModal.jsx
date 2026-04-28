"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { useShipments } from "../context/ShipmentContext.jsx";

function inputClassName() {
  return "w-full rounded-2xl border border-white/10 bg-white/70 px-4 py-3 text-sm shadow-sm outline-none transition placeholder:text-muted focus:ring-4 focus:ring-[var(--ring)]/30 dark:bg-white/5";
}

const initialFormValues = {
  shipmentNumber: "",
  fromLocation: "",
  toLocation: "",
  startDate: "",
  endDate: "",
  delayToleranceDays: 2,
  cargoType: "General",
  deviceId: "",
  temperatureC: 4.5,
  fragility: "Low",
  vehicleNumber: "",
  miscInfo: ""
};

export default function AddShipmentModal({ isOpen, onClose }) {
  const { addShipment } = useShipments();
  const [formValues, setFormValues] = useState(initialFormValues);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (!isOpen) return undefined;

    function handleEscape(event) {
      if (event.key === "Escape") onClose?.();
    }

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  function setFieldValue(fieldName, fieldValue) {
    setFormValues((currentValues) => ({
      ...currentValues,
      [fieldName]: fieldValue
    }));
  }

  function validateForm() {
    if (!formValues.shipmentNumber.trim()) return "Shipment number is required.";
    if (!formValues.fromLocation.trim()) return "Origin is required.";
    if (!formValues.toLocation.trim()) return "Destination is required.";
    if (!formValues.startDate || !formValues.endDate) return "Both dates are required.";
    if (!formValues.deviceId.trim()) return "IoT device ID is required.";
    if (!formValues.vehicleNumber.trim()) return "Vehicle number is required.";
    return "";
  }

  function handleSubmit(event) {
    event.preventDefault();
    const validationError = validateForm();

    if (validationError) {
      setErrorMessage(validationError);
      return;
    }

    addShipment({
      ...formValues,
      logisticsType: formValues.cargoType,
      delayToleranceDays: Number(formValues.delayToleranceDays),
      temperatureC: Number(formValues.temperatureC)
    });

    setErrorMessage("");
    setFormValues(initialFormValues);
    onClose?.();
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-md"
      onClick={onClose}
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-shipment-modal-title"
        className="cg-glass cg-shine flex max-h-[80vh] w-full max-w-3xl flex-col overflow-hidden rounded-[28px] border border-white/10 bg-surface-strong shadow-2xl shadow-slate-950/20"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="shrink-0 border-b border-white/10 px-6 py-5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted">Create Shipment</p>
              <h2 id="add-shipment-modal-title" className="mt-2 text-xl font-semibold">
                Add a new shipment record
              </h2>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="cg-shine inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/60 shadow-sm transition hover:bg-white dark:bg-white/5 dark:hover:bg-white/10"
              aria-label="Close add shipment modal"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
          <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">
            {errorMessage ? (
              <div className="mb-5 rounded-2xl border border-danger-500/30 bg-danger-500/10 px-4 py-3 text-sm text-danger-500">
                {errorMessage}
              </div>
            ) : null}

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <label className="flex flex-col gap-2">
                <span className="text-sm font-medium">Shipment Number</span>
                <input
                  className={inputClassName()}
                  value={formValues.shipmentNumber}
                  onChange={(event) => setFieldValue("shipmentNumber", event.target.value)}
                />
              </label>
              <label className="flex flex-col gap-2">
                <span className="text-sm font-medium">Cargo Type</span>
                <input
                  className={inputClassName()}
                  value={formValues.cargoType}
                  onChange={(event) => setFieldValue("cargoType", event.target.value)}
                  placeholder="Electronics, vaccines, produce..."
                />
              </label>
              <label className="flex flex-col gap-2">
                <span className="text-sm font-medium">From</span>
                <input
                  className={inputClassName()}
                  value={formValues.fromLocation}
                  onChange={(event) => setFieldValue("fromLocation", event.target.value)}
                />
              </label>
              <label className="flex flex-col gap-2">
                <span className="text-sm font-medium">To</span>
                <input
                  className={inputClassName()}
                  value={formValues.toLocation}
                  onChange={(event) => setFieldValue("toLocation", event.target.value)}
                />
              </label>
              <label className="flex flex-col gap-2">
                <span className="text-sm font-medium">Start Date</span>
                <input
                  type="date"
                  className={inputClassName()}
                  value={formValues.startDate}
                  onChange={(event) => setFieldValue("startDate", event.target.value)}
                />
              </label>
              <label className="flex flex-col gap-2">
                <span className="text-sm font-medium">End Date</span>
                <input
                  type="date"
                  className={inputClassName()}
                  value={formValues.endDate}
                  onChange={(event) => setFieldValue("endDate", event.target.value)}
                />
              </label>
              <label className="flex flex-col gap-2">
                <span className="text-sm font-medium">Delay Tolerance</span>
                <input
                  type="number"
                  className={inputClassName()}
                  value={formValues.delayToleranceDays}
                  onChange={(event) => setFieldValue("delayToleranceDays", event.target.value)}
                />
              </label>
              <label className="flex flex-col gap-2">
                <span className="text-sm font-medium">Fragility</span>
                <select
                  className={inputClassName()}
                  value={formValues.fragility}
                  onChange={(event) => setFieldValue("fragility", event.target.value)}
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
              </label>
              <label className="flex flex-col gap-2">
                <span className="text-sm font-medium">IoT Device ID</span>
                <input
                  className={inputClassName()}
                  value={formValues.deviceId}
                  onChange={(event) => setFieldValue("deviceId", event.target.value)}
                />
              </label>
              <label className="flex flex-col gap-2">
                <span className="text-sm font-medium">Temperature (C)</span>
                <input
                  type="number"
                  step="0.1"
                  className={inputClassName()}
                  value={formValues.temperatureC}
                  onChange={(event) => setFieldValue("temperatureC", event.target.value)}
                />
              </label>
              <label className="flex flex-col gap-2 sm:col-span-2">
                <span className="text-sm font-medium">Vehicle Number</span>
                <input
                  className={inputClassName()}
                  value={formValues.vehicleNumber}
                  onChange={(event) => setFieldValue("vehicleNumber", event.target.value)}
                />
              </label>
              <label className="flex flex-col gap-2 sm:col-span-2">
                <span className="text-sm font-medium">Miscellaneous Information</span>
                <textarea
                  className={`${inputClassName()} min-h-28 resize-y`}
                  value={formValues.miscInfo}
                  onChange={(event) => setFieldValue("miscInfo", event.target.value)}
                  placeholder="Additional shipment details..."
                />
              </label>
            </div>
          </div>

          <div className="shrink-0 border-t border-white/10 px-6 py-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={onClose}
                className="inline-flex h-11 items-center justify-center rounded-2xl border border-white/10 bg-white/70 px-5 text-sm font-semibold shadow-sm transition hover:bg-white dark:bg-white/5 dark:hover:bg-white/10"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="inline-flex h-11 items-center justify-center rounded-2xl bg-brand-600 px-5 text-sm font-semibold text-white shadow-lg shadow-brand-600/20 transition hover:bg-brand-700"
              >
                Add Shipment
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
