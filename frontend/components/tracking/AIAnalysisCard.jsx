"use client";

import { getShipmentRiskScore } from "../dashboard/ShipmentCard.jsx";

function getRiskTheme(riskScore) {
  if (riskScore <= 40) {
    return {
      ringClassName: "border-emerald-200 bg-emerald-50 text-emerald-700",
      textClassName: "text-emerald-700"
    };
  }

  if (riskScore <= 70) {
    return {
      ringClassName: "border-amber-200 bg-amber-50 text-amber-700",
      textClassName: "text-amber-700"
    };
  }

  return {
    ringClassName: "border-red-200 bg-red-50 text-red-700",
    textClassName: "text-red-700"
  };
}

function getExplanation(shipment) {
  const explanation = shipment?.backendData?.gemini_explanation;
  if (explanation) {
    return explanation;
  }

  return "AI explanation is not available yet for this shipment. Tracking remains active and new telemetry will enrich the next model assessment.";
}

export default function AIAnalysisCard({ shipment }) {
  const riskScore = getShipmentRiskScore(shipment);
  const riskTheme = getRiskTheme(riskScore);

  return (
    <section className="rounded-xl border border-slate-200/80 bg-white/90 p-4 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">AI Analysis</p>
      <div className="mt-4 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-950">Risk outlook</h2>
          <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-600">{getExplanation(shipment)}</p>
        </div>
        <div className={`inline-flex min-w-[120px] flex-col items-center rounded-2xl border px-4 py-3 text-center ${riskTheme.ringClassName}`}>
          <span className="text-xs font-semibold uppercase tracking-[0.2em]">Risk Score</span>
          <span className={`mt-2 text-3xl font-semibold ${riskTheme.textClassName}`}>{riskScore}%</span>
        </div>
      </div>
    </section>
  );
}
