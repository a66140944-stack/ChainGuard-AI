"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useShipments } from "../../context/ShipmentContext.jsx";
import { getStoredUser } from "../../lib/session.js";

function encode(value) {
  return encodeURIComponent(String(value ?? ""));
}

export default function SimulatorPage() {
  const router = useRouter();
  const { selectedShipment, shipments } = useShipments();
  const [authReady, setAuthReady] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = getStoredUser();
    if (!storedUser) {
      router.replace("/login");
      setAuthReady(true);
      return;
    }
    setUser(storedUser);
    setAuthReady(true);
  }, [router]);

  const defaultShipment = useMemo(() => shipments?.[0] || null, [shipments]);
  const activeShipment = selectedShipment || defaultShipment;

  const iframeSrc = useMemo(() => {
    const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:5000";
    const shipmentId = activeShipment?.id || `SHP-SIM-${Date.now()}`;
    const origin = activeShipment?.fromLocation || activeShipment?.backendData?.origin || "Mumbai";
    const destination = activeShipment?.toLocation || activeShipment?.backendData?.destination || "Delhi";
    const carrier = activeShipment?.backendData?.carrier || activeShipment?.vehicleNumber || "ChainGuard Fleet";
    const cargoType = activeShipment?.backendData?.cargo_type || activeShipment?.logisticsType || "Road";

    return (
      `/simulatorpage.html?api_base=${encode(apiBase)}` +
      `&shipment_id=${encode(shipmentId)}` +
      `&origin=${encode(origin)}` +
      `&destination=${encode(destination)}` +
      `&carrier=${encode(carrier)}` +
      `&cargo_type=${encode(cargoType)}`
    );
  }, [activeShipment]);

  if (!authReady) {
    return <div className="min-h-screen px-6 py-10">Loading simulator...</div>;
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 py-6">
        <div className="rounded-[28px] border border-white/10 bg-surface p-5 shadow-2xl shadow-slate-950/10 backdrop-blur-xl">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-brand-600">
                Virtual ESP Telemetry
              </p>
              <h1 className="mt-2 text-2xl font-semibold">IoT Simulator</h1>
              <p className="mt-2 text-sm text-muted">
                Start the simulator to push telemetry into the backend. The dashboard and tracking pages will update
                automatically via WebSocket.
              </p>
            </div>
            <div className="text-sm text-muted">
              Active shipment:{" "}
              <span className="font-semibold text-foreground">{activeShipment?.id || "Not selected"}</span>
            </div>
          </div>
        </div>

        <div className="mt-6 overflow-hidden rounded-[28px] border border-white/10 bg-black shadow-2xl shadow-slate-950/10">
          <iframe
            title="ChainGuard IoT Simulator"
            src={iframeSrc}
            style={{ width: "100%", height: "calc(100vh - 220px)", border: "0" }}
          />
        </div>
      </div>
    </div>
  );
}

