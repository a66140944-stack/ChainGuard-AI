"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Bell, BellOff, LogOut, PanelLeft } from "lucide-react";
import usePushNotifications from "../../hooks/usePushNotifications.js";
import { useShipments } from "../../context/ShipmentContext.jsx";

export default function Topbar({ companyName, onOpenSidebar }) {
  const router = useRouter();
  const { isSubscribed, enableNotifications } = usePushNotifications();
  const { alerts } = useShipments();
  const [notificationPermission, setNotificationPermission] = useState("default");
  const [isEnablingNotifications, setIsEnablingNotifications] = useState(false);
  const [hasUnreadAlert, setHasUnreadAlert] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined" || !("Notification" in window)) {
      return;
    }

    setNotificationPermission(Notification.permission);
  }, [isSubscribed]);

  useEffect(() => {
    if (alerts.length > 0) {
      setHasUnreadAlert(true);
    }
  }, [alerts]);

  function handleLogout() {
    if (typeof window !== "undefined") {
      window.localStorage.clear();
    }
    router.push("/login");
  }

  async function handleEnableNotifications() {
    setHasUnreadAlert(false);
    setIsEnablingNotifications(true);
    try {
      await enableNotifications();
    } finally {
      if (typeof window !== "undefined" && "Notification" in window) {
        setNotificationPermission(Notification.permission);
      }
      setIsEnablingNotifications(false);
    }
  }

  const notificationState = useMemo(() => {
    if (notificationPermission === "denied") {
      return {
        disabled: true,
        className: "border-red-200 bg-red-50 text-red-700 hover:bg-red-50",
        icon: BellOff,
        iconClassName: "text-red-700"
      };
    }

    if (isSubscribed) {
      return {
        disabled: false,
        className: "border-slate-200 bg-slate-950 text-white hover:bg-slate-800",
        icon: Bell,
        iconClassName: "fill-current text-white"
      };
    }

    if (isEnablingNotifications) {
      return {
        disabled: true,
        className: "border-slate-200 bg-slate-100 text-slate-500 hover:bg-slate-100",
        icon: Bell,
        iconClassName: "text-slate-500"
      };
    }

    return {
      disabled: false,
      className: "border-slate-200 bg-white text-slate-700 hover:bg-slate-50",
      icon: Bell,
      iconClassName: "text-slate-700"
    };
  }, [isEnablingNotifications, isSubscribed, notificationPermission]);

  const NotificationIcon = notificationState.icon;

  return (
    <header className="sticky top-0 z-20 flex items-center justify-between gap-4 rounded-[28px] border border-white/60 bg-white/85 px-4 py-4 shadow-[0_18px_50px_rgba(15,23,42,0.06)] backdrop-blur-xl sm:px-5">
      <div className="flex min-w-0 items-center gap-3">
        <button
          type="button"
          onClick={onOpenSidebar}
          className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 lg:hidden"
          aria-label="Open navigation"
        >
          <PanelLeft className="h-5 w-5" />
        </button>

        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">Company</p>
          <p className="truncate text-lg font-semibold tracking-tight text-slate-950">
            {companyName || "ChainGuard Workspace"}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        <button
          type="button"
          onClick={handleEnableNotifications}
          disabled={notificationState.disabled}
          className={`relative inline-flex h-11 w-11 items-center justify-center rounded-2xl border transition disabled:cursor-not-allowed ${notificationState.className}`}
          aria-label={
            notificationPermission === "denied"
              ? "Notifications blocked"
              : isSubscribed
                ? "Notifications enabled"
                : "Enable notifications"
          }
          title={
            notificationPermission === "denied"
              ? "Notifications blocked"
              : isSubscribed
                ? "Notifications enabled"
                : "Enable notifications"
          }
        >
          <NotificationIcon className={`h-5 w-5 ${notificationState.iconClassName}`} />
          {hasUnreadAlert ? (
            <span className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white" />
          ) : null}
        </button>

        <button
          type="button"
          onClick={handleLogout}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
        >
          <LogOut className="h-4 w-4" />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>
    </header>
  );
}
