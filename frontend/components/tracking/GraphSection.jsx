"use client";

import { useEffect, useState } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";

function formatChartLabel(timestamp) {
  if (!timestamp) return "Now";

  const parsedDate = new Date(timestamp);
  if (Number.isNaN(parsedDate.getTime())) {
    return String(timestamp);
  }

  return parsedDate.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit"
  });
}

function buildInitialHistory(shipment) {
  const temperatureSeries = Array.isArray(shipment?.temperatureSeries)
    ? shipment.temperatureSeries
    : [];
  const riskHistory = Array.isArray(shipment?.riskHistory) ? shipment.riskHistory : [];

  const longestLength = Math.max(temperatureSeries.length, riskHistory.length);
  const fallbackTimestamp = shipment?.backendData?.timestamp || shipment?.startDate || new Date().toISOString();

  if (longestLength === 0) {
    return shipment?.temperatureC != null || shipment?.riskScore != null
      ? [
          {
            label: formatChartLabel(fallbackTimestamp),
            temperature: shipment?.temperatureC != null ? Number(shipment.temperatureC) : null,
            riskScore:
              shipment?.riskScore != null
                ? Number(shipment.riskScore)
                : shipment?.backendData?.risk_score != null
                  ? Number(
                      shipment.backendData.risk_score <= 1
                        ? shipment.backendData.risk_score * 100
                        : shipment.backendData.risk_score
                    )
                  : null
          }
        ]
      : [];
  }

  const pointMap = new Map();

  temperatureSeries.forEach((point, index) => {
    const key = String(point.timestamp || index);
    pointMap.set(key, {
      ...(pointMap.get(key) || {}),
      label: formatChartLabel(point.timestamp || fallbackTimestamp),
      temperature: Number(point.temperatureC ?? 0)
    });
  });

  riskHistory.forEach((point, index) => {
    const key = String(point.timestamp || index);
    pointMap.set(key, {
      ...(pointMap.get(key) || {}),
      label: formatChartLabel(point.timestamp || fallbackTimestamp),
      riskScore: Number(point.riskScore ?? 0)
    });
  });

  return [...pointMap.values()].slice(-20);
}

export default function GraphSection({ shipment, latestShipmentData }) {
  const [chartData, setChartData] = useState(() => buildInitialHistory(shipment));

  useEffect(() => {
    setChartData(buildInitialHistory(shipment));
  }, [shipment?.id]);

  useEffect(() => {
    if (!latestShipmentData || !shipment) {
      return;
    }

    const shipmentId = latestShipmentData.shipment_id || latestShipmentData.id;
    if (shipmentId !== shipment.id) {
      return;
    }

    const nextTemperature =
      latestShipmentData.temperature_c != null
        ? Number(latestShipmentData.temperature_c)
        : latestShipmentData.temperature != null
          ? Number(latestShipmentData.temperature)
          : null;
    const nextRiskScore =
      latestShipmentData.risk_score != null
        ? Number(latestShipmentData.risk_score <= 1 ? latestShipmentData.risk_score * 100 : latestShipmentData.risk_score)
        : latestShipmentData.riskScore != null
          ? Number(
              latestShipmentData.riskScore <= 1
                ? latestShipmentData.riskScore * 100
                : latestShipmentData.riskScore
            )
        : null;
    const nextLabel = formatChartLabel(latestShipmentData.timestamp || new Date().toISOString());

    setChartData((previousData) => {
      const nextPoint = {
        label: nextLabel,
        temperature: nextTemperature,
        riskScore: nextRiskScore
      };

      return [...previousData.slice(-19), nextPoint];
    });
  }, [latestShipmentData, shipment?.id]);

  return (
    <section className="rounded-xl border border-slate-200/80 bg-white/90 p-4 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">Graph</p>
      <div className="mt-2">
        <h2 className="text-lg font-semibold text-slate-950">Temperature trend</h2>
        <p className="mt-1 text-sm text-slate-500">Temperature and risk update live as telemetry arrives.</p>
      </div>

      <div className="mt-5 h-72">
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.18)" />
              <XAxis dataKey="label" stroke="#94a3b8" tickLine={false} axisLine={false} />
              <YAxis stroke="#94a3b8" tickLine={false} axisLine={false} />
              <Tooltip />
              <Line type="monotone" dataKey="temperature" stroke="#2563eb" strokeWidth={3} dot={{ r: 3 }} />
              <Line type="monotone" dataKey="riskScore" stroke="#ef4444" strokeWidth={2.5} dot={{ r: 2 }} />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex h-full items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50/80 text-sm text-slate-500">
            No telemetry history available yet.
          </div>
        )}
      </div>
    </section>
  );
}
