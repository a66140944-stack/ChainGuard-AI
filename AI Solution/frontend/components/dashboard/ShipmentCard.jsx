"use client";

function toTitleCase(value) {
  return String(value || "")
    .trim()
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

export function getShipmentName(shipment) {
  return shipment?.shipmentNumber || shipment?.name || shipment?.id || "Unknown Shipment";
}

export function getShipmentCompanyName(shipment, fallbackCompanyName = "ChainGuard Logistics") {
  return (
    shipment?.companyName ||
    shipment?.carrier ||
    shipment?.backendData?.carrier ||
    shipment?.backendData?.company_name ||
    fallbackCompanyName
  );
}

export function getShipmentArrivalDate(shipment) {
  return shipment?.predictedDeliveryDate || shipment?.endDate || shipment?.backendData?.eta_text || shipment?.backendData?.timestamp || "";
}

export function formatShipmentDate(value) {
  if (!value) return "Not available";

  const parsedDate = new Date(value);
  if (!Number.isNaN(parsedDate.getTime())) {
    return parsedDate.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric"
    });
  }

  return String(value);
}

export function getShipmentRiskScore(shipment) {
  const rawRiskScore =
    shipment?.riskScore ??
    shipment?.risk_score ??
    shipment?.backendData?.risk_score ??
    shipment?.backendData?.riskScore;

  if (typeof rawRiskScore === "number" && Number.isFinite(rawRiskScore)) {
    const normalizedScore = rawRiskScore <= 1 ? rawRiskScore * 100 : rawRiskScore;
    return Math.max(0, Math.min(100, Math.round(normalizedScore)));
  }

  if (shipment?.riskLevel === "High") return 86;
  if (shipment?.riskLevel === "Medium") return 58;
  if (shipment?.riskLevel === "Low") return 24;
  return 18;
}

function getRiskAppearance(riskScore) {
  if (riskScore <= 40) {
    return {
      label: "Safe",
      borderClassName: "border-l-4 border-green-500",
      barClassName: "from-emerald-400 via-emerald-500 to-emerald-600",
      badgeClassName: "border-emerald-200 bg-emerald-50 text-emerald-700"
    };
  }

  if (riskScore <= 70) {
    return {
      label: "Monitoring",
      borderClassName: "border-l-4 border-yellow-500",
      barClassName: "from-amber-300 via-amber-400 to-amber-500",
      badgeClassName: "border-amber-200 bg-amber-50 text-amber-700"
    };
  }

  return {
    label: "Risky",
    borderClassName: "border-l-4 border-red-500",
    barClassName: "from-rose-400 via-rose-500 to-rose-600",
    badgeClassName: "border-rose-200 bg-rose-50 text-rose-700"
  };
}

export default function ShipmentCard({ shipment, companyName, onClick }) {
  const shipmentName = getShipmentName(shipment);
  const shipmentCompanyName = getShipmentCompanyName(shipment, companyName);
  const arrivalDate = getShipmentArrivalDate(shipment);
  const riskScore = getShipmentRiskScore(shipment);
  const { label, borderClassName, barClassName, badgeClassName } = getRiskAppearance(riskScore);
  const statusLabel = toTitleCase(shipment?.status || shipment?.backendData?.action || "In Transit");

  return (
    <button
      type="button"
      onClick={onClick}
      className={`group w-full rounded-3xl border border-slate-200/70 bg-white/90 p-5 text-left shadow-[0_10px_30px_rgba(15,23,42,0.06)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_18px_50px_rgba(15,23,42,0.10)] focus-visible:outline-none ${borderClassName}`}
    >
      <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-3">
            <h3 className="truncate text-lg font-semibold tracking-tight text-slate-950">{shipmentName}</h3>
            <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${badgeClassName}`}>
              {label}
            </span>
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-500">
            <span>{shipmentCompanyName}</span>
            <span className="hidden h-1 w-1 rounded-full bg-slate-300 sm:inline-block" />
            <span>{statusLabel}</span>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-[minmax(0,180px)_minmax(0,260px)] xl:min-w-[500px] xl:items-center">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">Expected Arrival</p>
            <p className="mt-2 text-sm font-semibold text-slate-800">{formatShipmentDate(arrivalDate)}</p>
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between gap-3">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">Risk Score</p>
              <span className="text-sm font-semibold text-slate-700">{riskScore}%</span>
            </div>
            <div className="h-3 overflow-hidden rounded-full bg-slate-100">
              <div
                className={`h-full rounded-full bg-gradient-to-r ${barClassName} transition-[width] duration-500 ease-out`}
                style={{ width: `${riskScore}%` }}
                aria-hidden="true"
              />
            </div>
          </div>
        </div>
      </div>
    </button>
  );
}
