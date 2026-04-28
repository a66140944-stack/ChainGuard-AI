"use client";

export const DELAY_THRESHOLD_DAYS = 2;

function getShipmentName(shipment) {
  return shipment?.shipmentNumber || shipment?.name || shipment?.id || "Unknown Shipment";
}

function getCompanyName(shipment, fallbackCompanyName = "ChainGuard Logistics") {
  return (
    shipment?.companyName ||
    shipment?.carrier ||
    shipment?.backendData?.carrier ||
    shipment?.backendData?.company_name ||
    fallbackCompanyName
  );
}

function getExpectedDeliveryDate(shipment) {
  return (
    shipment?.predictedDeliveryDate ||
    shipment?.endDate ||
    shipment?.expectedDate ||
    shipment?.backendData?.expected_delivery_date ||
    shipment?.backendData?.designated_date ||
    null
  );
}

function getActualArrivalDate(shipment) {
  return (
    shipment?.actualArrivalDate ||
    shipment?.arrivalDate ||
    shipment?.deliveredDate ||
    shipment?.backendData?.actual_arrival_date ||
    shipment?.backendData?.arrival_date ||
    shipment?.backendData?.delivered_at ||
    null
  );
}

function parseDateValue(value) {
  if (!value) return null;
  const parsedDate = new Date(value);
  return Number.isNaN(parsedDate.getTime()) ? null : parsedDate;
}

function startOfDay(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function differenceInDays(laterDate, earlierDate) {
  const millisecondsPerDay = 1000 * 60 * 60 * 24;
  return Math.round((startOfDay(laterDate) - startOfDay(earlierDate)) / millisecondsPerDay);
}

function formatDate(value) {
  const parsedDate = parseDateValue(value);
  if (!parsedDate) return "Not available";

  return parsedDate.toLocaleDateString(undefined, {
    day: "2-digit",
    month: "short",
    year: "numeric"
  });
}

function getPerformanceState(expectedDateValue, actualDateValue) {
  const expectedDate = parseDateValue(expectedDateValue);
  const actualDate = parseDateValue(actualDateValue);

  if (!expectedDate || !actualDate) {
    return {
      badgeLabel: "Pending Date",
      helperText: "Delivery dates not available",
      badgeClassName: "bg-slate-100 text-slate-700",
      cardClassName: "border-slate-200/80"
    };
  }

  const delayDays = differenceInDays(actualDate, expectedDate);

  if (delayDays <= 0) {
    return {
      badgeLabel: "On Time",
      helperText: "Arrived on or before the designated date",
      badgeClassName: "bg-green-100 text-green-700",
      cardClassName: "border-slate-200/80"
    };
  }

  if (delayDays > DELAY_THRESHOLD_DAYS) {
    return {
      badgeLabel: "High Delay",
      helperText: `Delayed by ${delayDays} day${delayDays === 1 ? "" : "s"}`,
      badgeClassName: "bg-red-100 text-red-700",
      cardClassName: "border-red-500"
    };
  }

  return {
    badgeLabel: "Delayed",
    helperText: `Delayed by ${delayDays} day${delayDays === 1 ? "" : "s"}`,
    badgeClassName: "bg-yellow-100 text-yellow-700",
    cardClassName: "border-slate-200/80"
  };
}

export default function PastShipmentCard({ shipment, companyName }) {
  const expectedDate = getExpectedDeliveryDate(shipment);
  const actualArrivalDate = getActualArrivalDate(shipment);
  const performanceState = getPerformanceState(expectedDate, actualArrivalDate);

  return (
    <article
      className={`rounded-xl border bg-white/90 p-4 shadow-sm transition hover:shadow-md ${performanceState.cardClassName}`}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-lg font-semibold tracking-tight text-slate-950">
            {getShipmentName(shipment)}
          </h3>
          <p className="mt-1 text-sm text-slate-500">{getCompanyName(shipment, companyName)}</p>

          <div className="mt-4 grid gap-3 text-sm text-slate-600 sm:grid-cols-2">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                Expected Delivery Date
              </p>
              <p className="mt-1 font-medium text-slate-800">{formatDate(expectedDate)}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                Actual Arrival Date
              </p>
              <p className="mt-1 font-medium text-slate-800">{formatDate(actualArrivalDate)}</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-start gap-2 sm:items-end">
          <span
            className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${performanceState.badgeClassName}`}
          >
            {performanceState.badgeLabel}
          </span>
          <p className="text-sm text-slate-500">{performanceState.helperText}</p>
        </div>
      </div>
    </article>
  );
}
