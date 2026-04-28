"use client";

function inferExpectedTemperatureRange(shipment) {
  const category = String(
    shipment?.backendData?.cargo_type ||
      shipment?.logisticsType ||
      shipment?.fragility ||
      ""
  ).toLowerCase();

  if (category.includes("vaccine") || category.includes("medicine") || category.includes("pharma")) {
    return { min: 2, max: 8 };
  }

  if (category.includes("fresh") || category.includes("produce")) {
    return { min: 4, max: 12 };
  }

  if (category.includes("electronics")) {
    return { min: 10, max: 30 };
  }

  if (category.includes("high")) {
    return { min: 5, max: 10 };
  }

  return { min: 5, max: 15 };
}

function inferExpectedHumidityRange(shipment) {
  const humidityValue = shipment?.backendData?.humidity_pct;
  if (humidityValue == null) return null;

  const category = String(
    shipment?.backendData?.cargo_type ||
      shipment?.logisticsType ||
      shipment?.fragility ||
      ""
  ).toLowerCase();

  if (category.includes("vaccine") || category.includes("medicine")) {
    return { min: 35, max: 55 };
  }

  if (category.includes("fresh") || category.includes("produce")) {
    return { min: 55, max: 75 };
  }

  return { min: 40, max: 65 };
}

function formatDeviation(currentValue, expectedRange) {
  if (currentValue == null || !expectedRange) return "Within expected range";

  if (currentValue < expectedRange.min) {
    return `${(expectedRange.min - currentValue).toFixed(1)} C below target`;
  }

  if (currentValue > expectedRange.max) {
    return `${(currentValue - expectedRange.max).toFixed(1)} C above target`;
  }

  return "Within expected range";
}

export default function ConditionsCard({ shipment }) {
  const expectedTemperatureRange = inferExpectedTemperatureRange(shipment);
  const expectedHumidityRange = inferExpectedHumidityRange(shipment);
  const currentTemperature =
    shipment?.temperatureC != null ? Number(shipment.temperatureC) : shipment?.backendData?.temperature_c != null ? Number(shipment.backendData.temperature_c) : null;
  const currentHumidity =
    shipment?.backendData?.humidity_pct != null ? Number(shipment.backendData.humidity_pct) : null;

  const isTemperatureOutOfRange =
    currentTemperature != null &&
    (currentTemperature < expectedTemperatureRange.min || currentTemperature > expectedTemperatureRange.max);

  return (
    <section className="rounded-xl border border-slate-200/80 bg-white/90 p-4 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">Conditions Comparison</p>
          <h2 className="mt-2 text-lg font-semibold text-slate-950">Expected vs current conditions</h2>
        </div>
        {isTemperatureOutOfRange ? (
          <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700">
            Out of range
          </span>
        ) : (
          <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
            Stable
          </span>
        )}
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-slate-200/80 bg-slate-50/80 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Expected Conditions</p>
          <div className="mt-3 space-y-3 text-sm text-slate-600">
            <div className="flex items-center justify-between gap-3">
              <span>Temperature range</span>
              <span className="font-semibold text-slate-900">
                {expectedTemperatureRange.min} C to {expectedTemperatureRange.max} C
              </span>
            </div>
            {expectedHumidityRange ? (
              <div className="flex items-center justify-between gap-3">
                <span>Humidity range</span>
                <span className="font-semibold text-slate-900">
                  {expectedHumidityRange.min}% to {expectedHumidityRange.max}%
                </span>
              </div>
            ) : (
              <div className="flex items-center justify-between gap-3">
                <span>Humidity</span>
                <span className="font-semibold text-slate-900">Available when telemetry reports it</span>
              </div>
            )}
          </div>
        </div>

        <div className={`rounded-xl border p-4 ${isTemperatureOutOfRange ? "border-red-200 bg-red-50/70" : "border-slate-200/80 bg-slate-50/80"}`}>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Current Conditions</p>
          <div className="mt-3 space-y-3 text-sm text-slate-600">
            <div className="flex items-center justify-between gap-3">
              <span>Live temperature</span>
              <span className={`font-semibold ${isTemperatureOutOfRange ? "text-red-700" : "text-slate-900"}`}>
                {currentTemperature != null ? `${currentTemperature.toFixed(1)} C` : "Not available"}
              </span>
            </div>
            <div className="flex items-center justify-between gap-3">
              <span>Deviation</span>
              <span className={`font-semibold ${isTemperatureOutOfRange ? "text-red-700" : "text-emerald-700"}`}>
                {currentTemperature != null ? formatDeviation(currentTemperature, expectedTemperatureRange) : "Not available"}
              </span>
            </div>
            <div className="flex items-center justify-between gap-3">
              <span>Humidity</span>
              <span className="font-semibold text-slate-900">
                {currentHumidity != null ? `${currentHumidity.toFixed(0)}%` : "Not available"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
