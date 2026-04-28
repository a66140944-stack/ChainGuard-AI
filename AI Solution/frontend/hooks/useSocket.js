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

  useEffect(() => {
    function handleShipmentUpdate(payload) {
      setLatestShipmentData(payload);
      onShipmentUpdate?.(payload);
    }

    function handleShipmentAlert(payload) {
      setAlerts((previousAlerts) => [...previousAlerts.slice(-19), payload]);
      onShipmentAlert?.(payload);
    }

    connectSharedSocket();
    socket.on("shipment_update", handleShipmentUpdate);
    socket.on("shipment_alert", handleShipmentAlert);

    return () => {
      socket.off("shipment_update", handleShipmentUpdate);
      socket.off("shipment_alert", handleShipmentAlert);
      disconnectSharedSocket();
    };
  }, [onShipmentAlert, onShipmentUpdate]);

  return {
    connectSocket: connectSharedSocket,
    disconnectSocket: disconnectSharedSocket,
    latestShipmentData,
    alerts
  };
}
