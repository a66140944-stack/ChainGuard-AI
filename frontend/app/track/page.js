"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function LegacyTrackPage() {
  const router = useRouter();

  useEffect(() => {
    const shipmentId =
      typeof window !== "undefined"
        ? new URLSearchParams(window.location.search).get("shipmentId")
        : null;
    const destination = shipmentId
      ? `/tracking?shipmentId=${encodeURIComponent(shipmentId)}`
      : "/tracking";

    router.replace(destination);
  }, [router]);

  return null;
}
