"use client";

import { useEffect } from "react";

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

export default function HyperBackdrop() {
  useEffect(() => {
    const root = document.documentElement;
    let raf = 0;

    function updateFromEvent(event) {
      const x = clamp(event.clientX / window.innerWidth, 0, 1);
      const y = clamp(event.clientY / window.innerHeight, 0, 1);
      root.style.setProperty("--cg-x", `${Math.round(x * 100)}%`);
      root.style.setProperty("--cg-y", `${Math.round(y * 100)}%`);
    }

    function onMove(event) {
      if (raf) return;
      raf = window.requestAnimationFrame(() => {
        raf = 0;
        updateFromEvent(event);
      });
    }

    root.style.setProperty("--cg-x", "18%");
    root.style.setProperty("--cg-y", "12%");

    window.addEventListener("mousemove", onMove, { passive: true });
    return () => {
      if (raf) window.cancelAnimationFrame(raf);
      window.removeEventListener("mousemove", onMove);
    };
  }, []);

  return (
    <div className="cg-backdrop" aria-hidden="true">
      <div className="cg-noise" />
    </div>
  );
}

