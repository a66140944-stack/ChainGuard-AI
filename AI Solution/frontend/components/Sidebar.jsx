"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

function SidebarIcon({ type }) {
  const className = "h-4 w-4";

  if (type === "dashboard") {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M4 4h6v7H4V4Zm10 0h6v16h-6V4ZM4 13h6v7H4v-7Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      </svg>
    );
  }

  if (type === "track") {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M12 21s6-5.4 6-11a6 6 0 1 0-12 0c0 5.6 6 11 6 11Z" stroke="currentColor" strokeWidth="2" />
        <circle cx="12" cy="10" r="2.5" stroke="currentColor" strokeWidth="2" />
      </svg>
    );
  }

  if (type === "graph") {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M4 19V5M4 19h16M8 15l3-3 3 2 5-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }

  if (type === "ai") {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M12 3 3 8l9 5 9-5-9-5Zm-6 8v5l6 3 6-3v-5" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      </svg>
    );
  }

  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M5 5h14v14H5zM9 9h6M9 13h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export default function Sidebar({ onNavigate }) {
  const pathname = usePathname();
  const navigationItems = [
    { href: "/dashboard", label: "Dashboard", icon: "dashboard" },
    { href: "/track", label: "Track Shipment", icon: "track" },
    { href: "/graph", label: "Graph", icon: "graph" },
    { href: "/ai", label: "AI Analysis", icon: "ai" },
    { href: "/past", label: "Past Shipments", icon: "past" }
  ];

  return (
    <aside className="w-full lg:w-72 lg:flex-shrink-0">
      <div className="rounded-3xl border border-white/10 bg-surface p-3 shadow-xl shadow-slate-950/5 backdrop-blur-xl">
        <p className="px-3 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-muted">Workspace</p>
        <nav className="mt-2 flex flex-col gap-1">
          {navigationItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/dashboard" && pathname.startsWith(item.href + "/"));

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onNavigate}
                className={`flex items-center gap-3 rounded-2xl border px-3 py-3 text-sm font-medium transition ${
                  isActive
                    ? "border-brand-500/30 bg-brand-500/10 text-foreground shadow-sm"
                    : "border-transparent text-muted hover:border-white/10 hover:bg-white/50 hover:text-foreground dark:hover:bg-white/5"
                }`}
              >
                <span className={isActive ? "text-brand-600" : "text-muted"}><SidebarIcon type={item.icon} /></span>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
