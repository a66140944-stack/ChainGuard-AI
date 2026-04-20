"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import ChartCard from "../../components/ChartCard.jsx";
import DashboardShell from "../../components/DashboardShell.jsx";
import { useShipments } from "../../context/ShipmentContext.jsx";

export default function GraphPage() {
  const { selectedShipment, shipments } = useShipments();

  const lineData = selectedShipment?.temperatureSeries ?? [];
  const barData = shipments.map((shipment) => ({
    name: shipment.shipmentNumber,
    delayDays: shipment.delayDays
  }));

  return (
    <DashboardShell>
      <div className="space-y-6">
        <section className="rounded-[32px] border border-white/10 bg-surface p-6 shadow-xl shadow-slate-950/5 backdrop-blur-xl">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-brand-600">Analytics</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight">Shipment performance graphs</h1>
          <p className="mt-2 text-sm text-muted">Temperature and delay trends rendered from shared state and ready for future backend metrics expansion.</p>
        </section>

        <div className="grid gap-6 xl:grid-cols-2">
          <ChartCard title="Temperature trend" subtitle={selectedShipment ? `${selectedShipment.shipmentNumber} temperature history` : "Select a shipment from the dashboard"}>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={lineData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.18)" />
                  <XAxis dataKey="timestamp" stroke="#94a3b8" tickLine={false} axisLine={false} />
                  <YAxis stroke="#94a3b8" tickLine={false} axisLine={false} />
                  <Tooltip />
                  <Line type="monotone" dataKey="temperatureC" stroke="#2563eb" strokeWidth={3} dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>

          <ChartCard title="Delays by shipment" subtitle="Mock analytics from current shipment collection">
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.18)" />
                  <XAxis dataKey="name" stroke="#94a3b8" tickLine={false} axisLine={false} />
                  <YAxis stroke="#94a3b8" tickLine={false} axisLine={false} />
                  <Tooltip />
                  <Bar dataKey="delayDays" fill="#0ea5e9" radius={[12, 12, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>
        </div>
      </div>
    </DashboardShell>
  );
}
