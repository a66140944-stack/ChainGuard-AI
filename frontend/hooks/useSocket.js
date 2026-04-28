"use client";

import { useEffect, useState } from "react";
import { socket } from "../lib/socket.js";

let activeConsumers = 0;

function connectSharedSocket() {
  activeConsumers += 1;

  if (!socket.connected) {
    socket.connect();
  }
}

function disconnectSharedSocket() {
  activeConsumers = Math.max(0, activeConsumers - 1);

  if (activeConsumers === 0 && socket.connected) {
    socket.disconnect();
  }
}

export default function useSocket({ onShipmentUpdate, onShipmentAlert } = {}) {
  const [latestShipmentData, setLatestShipmentData] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);

  useEffect(() => {
    // Best-effort: if the user already granted permission, enable browser notifications.
    if (typeof window !== "undefined" && "Notification" in window) {
      setNotificationsEnabled(Notification.permission === "granted");
    }

    function handleShipmentUpdate(payload) {
      // Backend emits:
      // - "shipment_update": full snapshot array on connect + after ingest
      // - "shipment_ingested": single shipment object
      if (Array.isArray(payload)) {
        setLatestShipmentData(null);
      } else {
        setLatestShipmentData(payload);
      }
      onShipmentUpdate?.(payload);
    }

    function handleShipmentAlert(payload) {
      setAlerts((previousAlerts) => [...previousAlerts.slice(-19), payload]);
      onShipmentAlert?.(payload);
    }

    function maybeNotifyFromShipment(payload) {
      if (!payload || typeof payload !== "object" || Array.isArray(payload)) return;

      const riskCategory = String(payload.risk_category || payload.riskCategory || "").toUpperCase();
      if (riskCategory !== "WARNING" && riskCategory !== "CRITICAL") return;

      const shipmentId = payload.shipment_id || payload.id || "Unknown";
      const riskScoreRaw = payload.risk_score ?? payload.riskScore;
      const riskPct =
        typeof riskScoreRaw === "number" && Number.isFinite(riskScoreRaw)
          ? Math.round((riskScoreRaw <= 1 ? riskScoreRaw * 100 : riskScoreRaw))
          : null;

      const message =
        riskCategory === "CRITICAL"
          ? `Critical risk detected${riskPct != null ? ` (${riskPct}%)` : ""}. Immediate action recommended.`
          : `Warning risk detected${riskPct != null ? ` (${riskPct}%)` : ""}. Monitor and consider rerouting.`;

      const alertPayload = {
        id: shipmentId,
        severity: riskCategory,
        message,
        timestamp: payload.timestamp || new Date().toISOString()
      };

      handleShipmentAlert(alertPayload);

      if (typeof window !== "undefined" && "Notification" in window) {
        if (Notification.permission === "default") {
          Notification.requestPermission().then((permission) => {
            setNotificationsEnabled(permission === "granted");
            if (permission === "granted") {
              new Notification(`ChainGuard ${riskCategory}`, {
                body: `Shipment ${shipmentId}: ${message}`
              });
            }
          });
        } else if (Notification.permission === "granted" && notificationsEnabled) {
          new Notification(`ChainGuard ${riskCategory}`, {
            body: `Shipment ${shipmentId}: ${message}`
          });
        }
      }
    }

    connectSharedSocket();
    socket.on("shipment_update", handleShipmentUpdate);
    socket.on("shipment_ingested", handleShipmentUpdate);
    socket.on("shipment_alert", handleShipmentAlert);

    // Generate client-side alerts for warning/critical ingest events (judge-friendly demo).
    socket.on("shipment_ingested", maybeNotifyFromShipment);

    return () => {
      socket.off("shipment_update", handleShipmentUpdate);
      socket.off("shipment_ingested", handleShipmentUpdate);
      socket.off("shipment_alert", handleShipmentAlert);
      socket.off("shipment_ingested", maybeNotifyFromShipment);
      disconnectSharedSocket();
    };
  }, [notificationsEnabled, onShipmentAlert, onShipmentUpdate]);

  return {
    connectSocket: connectSharedSocket,
    disconnectSocket: disconnectSharedSocket,
    latestShipmentData,
    alerts
  };
}
