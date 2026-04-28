"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";
import AddShipmentModal from "../../components/AddShipmentModal.jsx";
import Sidebar from "../../components/dashboard/Sidebar.jsx";
import Topbar from "../../components/dashboard/Topbar.jsx";
import AIAnalysisCard from "../../components/tracking/AIAnalysisCard.jsx";
import AIFloatingButton from "../../components/tracking/AIFloatingButton.jsx";
import AIModal from "../../components/tracking/AIModal.jsx";
import ConditionsCard from "../../components/tracking/ConditionsCard.jsx";
import GraphSection from "../../components/tracking/GraphSection.jsx";
import ShipmentSelector from "../../components/tracking/ShipmentSelector.jsx";
import SummaryBar from "../../components/tracking/SummaryBar.jsx";
import { useShipments } from "../../context/ShipmentContext.jsx";
import { getStoredUser } from "../../lib/session.js";

const LiveMap = dynamic(() => import("../../components/tracking/LiveMap.jsx"), {
  ssr: false,
  loading: () => (
    <div className="h-[420px] animate-pulse rounded-xl border border-slate-200/80 bg-white/90 shadow-sm" />
  )
});

function isActiveShipment(shipment) {
  const status = String(shipment?.status || shipment?.backendData?.status || "").trim().toLowerCase();
  return status !== "delivered" && status !== "completed";
}

function LoadingPanel() {
  return (
    <div className="space-y-6">
      <div className="h-36 animate-pulse rounded-xl border border-slate-200/80 bg-white/90 shadow-sm" />
      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-6">
          <div className="h-56 animate-pulse rounded-xl border border-slate-200/80 bg-white/90 shadow-sm" />
          <div className="h-48 animate-pulse rounded-xl border border-slate-200/80 bg-white/90 shadow-sm" />
        </div>
        <div className="space-y-6">
          <div className="h-80 animate-pulse rounded-xl border border-slate-200/80 bg-white/90 shadow-sm" />
          <div className="h-80 animate-pulse rounded-xl border border-slate-200/80 bg-white/90 shadow-sm" />
        </div>
      </div>
    </div>
  );
}

export default function TrackingPage() {
  const router = useRouter();
  const {
    shipments,
    loading,
    selectedShipmentId,
    setSelectedShipmentId,
    latestShipmentData,
    alerts
  } = useShipments();
  const [user, setUser] = useState(null);
  const [authReady, setAuthReady] = useState(false);
  const [isAddShipmentOpen, setIsAddShipmentOpen] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isSwitchingShipment, setIsSwitchingShipment] = useState(false);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [queryShipmentId, setQueryShipmentId] = useState("");
  const [visibleAlerts, setVisibleAlerts] = useState([]);

  const activeShipments = useMemo(() => shipments.filter(isActiveShipment), [shipments]);
  const selectedShipment = useMemo(() => {
    if (!activeShipments.length) return null;

    return (
      activeShipments.find((shipment) => shipment.id === selectedShipmentId) ||
      activeShipments.find((shipment) => shipment.id === queryShipmentId) ||
      activeShipments[0]
    );
  }, [activeShipments, queryShipmentId, selectedShipmentId]);

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

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    setQueryShipmentId(params.get("shipmentId") || "");
  }, []);

  useEffect(() => {
    if (!activeShipments.length) return;

    const preferredShipmentId =
      (queryShipmentId && activeShipments.some((shipment) => shipment.id === queryShipmentId) && queryShipmentId) ||
      (selectedShipmentId && activeShipments.some((shipment) => shipment.id === selectedShipmentId) && selectedShipmentId) ||
      activeShipments[0].id;

    if (preferredShipmentId !== selectedShipmentId) {
      setSelectedShipmentId(preferredShipmentId);
    }

    if (queryShipmentId !== preferredShipmentId) {
      router.replace(`/tracking?shipmentId=${encodeURIComponent(preferredShipmentId)}`, { scroll: false });
    }
  }, [activeShipments, queryShipmentId, router, selectedShipmentId, setSelectedShipmentId]);

  useEffect(() => {
    if (!isSwitchingShipment) return undefined;

    const timeoutId = window.setTimeout(() => setIsSwitchingShipment(false), 250);
    return () => window.clearTimeout(timeoutId);
  }, [isSwitchingShipment, selectedShipmentId]);

  useEffect(() => {
    if (!selectedShipment || alerts.length === 0) {
      return undefined;
    }

    const latestAlert = alerts[alerts.length - 1];
    if (!latestAlert || latestAlert.id !== selectedShipment.id) {
      return undefined;
    }

    const toastId = `${latestAlert.id}-${latestAlert.timestamp || Date.now()}`;
    const nextToast = {
      ...latestAlert,
      toastId
    };

    setVisibleAlerts((previousAlerts) => [...previousAlerts.slice(-2), nextToast]);

    const timeoutId = window.setTimeout(() => {
      setVisibleAlerts((previousAlerts) =>
        previousAlerts.filter((alertItem) => alertItem.toastId !== toastId)
      );
    }, 5000);

    return () => window.clearTimeout(timeoutId);
  }, [alerts, selectedShipment]);

  function handleShipmentChange(nextShipmentId) {
    if (!nextShipmentId || nextShipmentId === selectedShipmentId) return;

    setIsSwitchingShipment(true);
    setSelectedShipmentId(nextShipmentId);
    setQueryShipmentId(nextShipmentId);
    router.replace(`/tracking?shipmentId=${encodeURIComponent(nextShipmentId)}`, { scroll: false });
  }

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
            <ShipmentSelector
              shipments={activeShipments}
              selectedShipmentId={selectedShipment?.id || ""}
              onChange={handleShipmentChange}
              disabled={loading}
            />

            {!loading && !selectedShipment ? (
              <section className="rounded-xl border border-dashed border-slate-300 bg-white/75 px-6 py-16 text-center shadow-sm">
                <h1 className="text-2xl font-semibold text-slate-950">No active shipments</h1>
                <p className="mt-3 text-sm text-slate-500">
                  Add or ingest a shipment to begin live tracking.
                </p>
              </section>
            ) : null}

            {loading || isSwitchingShipment ? (
              <LoadingPanel />
            ) : selectedShipment ? (
              <>
                <SummaryBar shipment={selectedShipment} />

                <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
                  <div className="space-y-6">
                    <ConditionsCard shipment={selectedShipment} />
                    <AIAnalysisCard shipment={selectedShipment} />
                  </div>

                  <div className="space-y-6">
                    <LiveMap shipment={selectedShipment} latestShipmentData={latestShipmentData} />
                    <GraphSection shipment={selectedShipment} latestShipmentData={latestShipmentData} />
                  </div>
                </section>
              </>
            ) : null}
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

      {selectedShipment ? (
        <>
          <AIFloatingButton onClick={() => setIsAiModalOpen(true)} />
          <AIModal
            isOpen={isAiModalOpen}
            onClose={() => setIsAiModalOpen(false)}
            shipment={selectedShipment}
          />
        </>
      ) : null}

      <AddShipmentModal isOpen={isAddShipmentOpen} onClose={() => setIsAddShipmentOpen(false)} />

      {visibleAlerts.length > 0 ? (
        <div className="fixed right-4 top-20 z-50 flex w-full max-w-sm flex-col gap-3">
          {visibleAlerts.map((alertItem) => (
            <div
              key={alertItem.toastId}
              className="rounded-xl border border-red-200 bg-white/95 p-4 shadow-[0_18px_50px_rgba(239,68,68,0.16)] backdrop-blur-xl"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-red-500">
                {alertItem.severity || "Alert"}
              </p>
              <p className="mt-2 text-sm font-semibold text-slate-900">
                Shipment {alertItem.id}
              </p>
              <p className="mt-1 text-sm text-slate-600">{alertItem.message}</p>
            </div>
          ))}
        </div>
      ) : null}
    </>
  );
}
