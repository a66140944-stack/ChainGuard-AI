"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";
import AddShipmentModal from "../../components/AddShipmentModal.jsx";
import Sidebar from "../../components/dashboard/Sidebar.jsx";
import Topbar from "../../components/dashboard/Topbar.jsx";
import PastShipmentList from "../../components/past/PastShipmentList.jsx";
import { useShipments } from "../../context/ShipmentContext.jsx";
import { getStoredUser } from "../../lib/session.js";

export default function PastShipmentsPage() {
  const router = useRouter();
  const { shipments, loading } = useShipments();
  const [user, setUser] = useState(null);
  const [authReady, setAuthReady] = useState(false);
  const [isAddShipmentOpen, setIsAddShipmentOpen] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

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

  const completedShipments = useMemo(
    () =>
      shipments.filter((shipment) => {
        const status = String(shipment?.status || shipment?.backendData?.status || "").trim().toLowerCase();
        return status === "delivered" || status === "completed";
      }),
    [shipments]
  );

  if (!authReady) {
    return (
      <div className="min-h-screen px-6 py-8 lg:px-8">
        <div className="h-14 w-72 animate-pulse rounded-3xl bg-slate-200/70" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <>
      <div className="min-h-screen pb-8">
        <div className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-30 lg:block lg:w-[304px] lg:p-6">
          <Sidebar
            isAddShipmentActive={isAddShipmentOpen}
            onAddShipment={() => setIsAddShipmentOpen(true)}
          />
        </div>

        <div className="px-4 py-4 sm:px-6 lg:pl-[328px] lg:pr-8 lg:pt-6">
          <Topbar
            companyName={user.companyName}
            onOpenSidebar={() => setIsMobileSidebarOpen(true)}
          />

          <main className="mt-6 space-y-6">
            <section className="rounded-[32px] border border-white/60 bg-white/85 px-6 py-6 shadow-[0_18px_50px_rgba(15,23,42,0.05)] backdrop-blur-xl sm:px-7">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Delivery History</p>
              <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">Past Shipments</h1>
              <p className="mt-3 text-sm leading-7 text-slate-500">Review completed deliveries</p>
            </section>

            <section className="rounded-[32px] border border-white/60 bg-white/80 p-4 shadow-[0_18px_50px_rgba(15,23,42,0.05)] backdrop-blur-xl sm:p-5">
              <PastShipmentList
                shipments={completedShipments}
                loading={loading}
                companyName={user.companyName}
              />
            </section>
          </main>
        </div>
      </div>

      {isMobileSidebarOpen ? (
        <div className="fixed inset-0 z-50 bg-slate-950/30 p-4 backdrop-blur-sm lg:hidden">
          <div className="mb-3 flex justify-end">
            <button
              type="button"
              onClick={() => setIsMobileSidebarOpen(false)}
              className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/30 bg-white text-slate-700"
              aria-label="Close navigation"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <Sidebar
            isAddShipmentActive={isAddShipmentOpen}
            onAddShipment={() => setIsAddShipmentOpen(true)}
            onNavigate={() => setIsMobileSidebarOpen(false)}
          />
        </div>
      ) : null}

      <AddShipmentModal isOpen={isAddShipmentOpen} onClose={() => setIsAddShipmentOpen(false)} />
    </>
  );
}
