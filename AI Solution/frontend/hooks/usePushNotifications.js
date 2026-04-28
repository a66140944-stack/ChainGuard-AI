"use client";

import { useEffect, useState } from "react";

const VAPID_PUBLIC_KEY = "YOUR_PUBLIC_KEY";

function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = `${base64String}${padding}`.replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  return Uint8Array.from([...rawData].map((char) => char.charCodeAt(0)));
}

async function postSubscription(subscription) {
  const response = await fetch("/api/subscribe", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(subscription)
  });

  if (!response.ok) {
    throw new Error("Unable to save push subscription.");
  }
}

export default function usePushNotifications() {
  const [registration, setRegistration] = useState(null);
  const [isSubscribed, setIsSubscribed] = useState(false);

  useEffect(() => {
    let active = true;

    async function setupServiceWorker() {
      if (typeof window === "undefined") return;
      if (!("serviceWorker" in navigator) || !("PushManager" in window)) return;

      try {
        const nextRegistration = await navigator.serviceWorker.register("/sw.js");
        if (!active) return;

        setRegistration(nextRegistration);

        if (Notification.permission === "granted") {
          let subscription = await nextRegistration.pushManager.getSubscription();

          if (!subscription) {
            subscription = await nextRegistration.pushManager.subscribe({
              userVisibleOnly: true,
              applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
            });
            await postSubscription(subscription);
          }

          if (active) {
            setIsSubscribed(true);
          }
        }
      } catch (error) {
        console.error("Push notification setup failed:", error);
      }
    }

    setupServiceWorker();

    return () => {
      active = false;
    };
  }, []);

  async function enableNotifications() {
    if (typeof window === "undefined") return false;

    if (!("Notification" in window) || !("serviceWorker" in navigator) || !("PushManager" in window)) {
      window.alert("Push notifications are not supported in this browser.");
      return false;
    }

    try {
      const permission = await Notification.requestPermission();

      if (permission === "denied") {
        setIsSubscribed(false);
        window.alert("Notifications are blocked in this browser.");
        return false;
      }

      if (permission !== "granted") {
        setIsSubscribed(false);
        return false;
      }

      let activeRegistration = registration;
      if (!activeRegistration) {
        activeRegistration = await navigator.serviceWorker.register("/sw.js");
        setRegistration(activeRegistration);
      }

      let subscription = await activeRegistration.pushManager.getSubscription();

      if (!subscription) {
        subscription = await activeRegistration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
        });
      }

      await postSubscription(subscription);
      setIsSubscribed(true);
      window.alert("Push notifications enabled successfully.");
      return true;
    } catch (error) {
      console.error("Failed to enable notifications:", error);
      setIsSubscribed(false);
      window.alert("Unable to enable notifications right now.");
      return false;
    }
  }

  return {
    isSubscribed,
    enableNotifications
  };
}
