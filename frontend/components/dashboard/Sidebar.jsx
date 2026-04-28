"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Cpu, History, PackagePlus, Truck } from "lucide-react";

const navigationItems = [
  {
    key: "add",
    label: "Add Shipment",
    icon: PackagePlus
  },
  {
    key: "simulator",
    href: "/simulator",
    label: "IoT Simulator",
    icon: Cpu
  },
  {
    key: "track",
    href: "/tracking",
    label: "Track Shipment",
    icon: Truck
  },
  {
    key: "past",
    href: "/past",
    label: "Past Shipments",
    icon: History
  }
];

function itemClassName(isActive) {
  return `flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition ${
    isActive
      ? "bg-slate-950 text-white shadow-[0_14px_40px_rgba(15,23,42,0.18)]"
      : "text-slate-600 hover:bg-slate-100 hover:text-slate-950"
  }`;
}

export default function Sidebar({ isAddShipmentActive, onAddShipment, onNavigate }) {
  const pathname = usePathname();

  return (
    <aside className="flex h-full w-full max-w-[280px] flex-col rounded-[32px] border border-white/60 bg-white/90 p-5 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur-xl">
      <div className="border-b border-slate-200/80 px-2 pb-5">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-400">Supply Chain AI</p>
        <Link
          href="/dashboard"
          onClick={onNavigate}
          className="mt-3 inline-flex overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:scale-[1.01]"
          aria-label="Go to dashboard"
        >
          <Image
            src="/chainguard-logo.jpeg"
            alt="ChainGuard logo"
            width={180}
            height={72}
            className="h-auto w-[150px] object-cover"
            priority
          />
        </Link>
      </div>

      <nav className="mt-6 space-y-2">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            item.key === "add"
              ? pathname === "/dashboard" || isAddShipmentActive
              : pathname === item.href || pathname.startsWith(`${item.href}/`);

          if (item.key === "add") {
            return (
              <button
                key={item.key}
                type="button"
                onClick={() => {
                  onAddShipment?.();
                  onNavigate?.();
                }}
                className={itemClassName(isActive)}
              >
                <Icon className="h-4 w-4" />
                <span>{item.label}</span>
              </button>
            );
          }

          return (
            <Link
              key={item.key}
              href={item.href}
              onClick={onNavigate}
              className={itemClassName(isActive)}
            >
              <Icon className="h-4 w-4" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto rounded-3xl border border-slate-200/80 bg-slate-50/90 p-4">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">Live Queue</p>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          Dashboard rows are ready for future real-time shipment updates.
        </p>
      </div>
    </aside>
  );
}
