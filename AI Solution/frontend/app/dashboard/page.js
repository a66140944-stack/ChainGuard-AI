"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import AddShipmentModal from "../../components/AddShipmentModal.jsx";
import DashboardShell from "../../components/DashboardShell.jsx";
import ShipmentCard from "../../components/ShipmentCard.jsx";
import { useShipments } from "../../context/ShipmentContext.jsx";

export default function DashboardPage() {
  const { shipments, loading, selectedShipmentId, setSelectedShipmentId } = useShipments();
  const [query, setQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const filteredShipments = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return shipments;

    return shipments.filter((shipment) =>
      [shipment.shipmentNumber, shipment.fromLocation, shipment.toLocation, shipment.deviceId, shipment.vehicleNumber]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(normalizedQuery)
    );
  }, [query, shipments]);

  const isEmpty = !loading && shipments.length === 0;

  return (
    <DashboardShell>
      <div className="space-y-6">
        <section className="rounded-[32px] border border-white/10 bg-surface p-6 shadow-xl shadow-slate-950/5 backdrop-blur-xl">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-brand-600">Overview</p>
              <h1 className="mt-3 text-3xl font-semibold tracking-tight">Shipment operations dashboard</h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
                Review active lanes, select a shipment for deeper analysis, and create new records with a clean reusable flow.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search by shipment, route, or device..."
                className="h-12 w-full rounded-2xl border border-white/10 bg-white/70 px-4 text-sm shadow-sm outline-none transition dark:bg-white/5 sm:w-80"
              />
              <button
                type="button"
                onClick={() => setIsModalOpen(true)}
                className="inline-flex h-12 items-center justify-center rounded-2xl bg-brand-600 px-5 text-sm font-semibold text-white shadow-lg shadow-brand-600/20 transition hover:bg-brand-700"
              >
                Add Shipment
              </button>
            </div>
          </div>
        </section>

        {loading ? (
          <section className="grid gap-4 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="h-44 animate-pulse rounded-[28px] bg-black/5 dark:bg-white/10" />
            ))}
          </section>
        ) : null}

        {isEmpty ? (
          <section className="rounded-[32px] border border-white/10 bg-surface p-8 shadow-xl shadow-slate-950/5 backdrop-blur-xl">
            <h2 className="text-xl font-semibold">No shipments yet</h2>
            <p className="mt-2 text-sm text-muted">Create your first shipment to unlock tracking, analytics, and AI analysis views.</p>
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="mt-5 inline-flex h-11 items-center justify-center rounded-2xl bg-brand-600 px-5 text-sm font-semibold text-white shadow-lg shadow-brand-600/20 transition hover:bg-brand-700"
            >
              Add Shipment
            </button>
          </section>
        ) : null}

        {!loading && !isEmpty ? (
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold">Active shipments</h2>
                <p className="text-sm text-muted">{filteredShipments.length} shipment records available</p>
              </div>
              {selectedShipmentId ? (
                <Link href="/track" className="text-sm font-semibold text-brand-600 hover:text-brand-700">
                  Track selected shipment
                </Link>
              ) : null}
            </div>
            {filteredShipments.length > 0 ? (
              <div className="flex gap-4 overflow-x-auto pb-3">
                {filteredShipments.map((shipment) => (
                  <ShipmentCard
                    key={shipment.id}
                    shipment={shipment}
                    isActive={shipment.id === selectedShipmentId}
                    onClick={() => setSelectedShipmentId(shipment.id)}
                  />
                ))}
              </div>
            ) : (
              <div className="rounded-[28px] border border-white/10 bg-surface p-6 shadow-xl shadow-slate-950/5 backdrop-blur-xl">
                <p className="text-sm text-muted">No shipments matched your current search.</p>
              </div>
            )}
          </section>
        ) : null}
      </div>

      <AddShipmentModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </DashboardShell>
  );
}
