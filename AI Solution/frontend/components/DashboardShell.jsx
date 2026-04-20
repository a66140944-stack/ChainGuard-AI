"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Sidebar from "./Sidebar.jsx";
import { clearStoredUser, getStoredUser } from "../lib/session.js";

function MenuIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export default function DashboardShell({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [mobileNavigationOpen, setMobileNavigationOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [authReady, setAuthReady] = useState(false);

  useEffect(() => {
    const storedUser = getStoredUser();
    setUser(storedUser);
    setAuthReady(true);
  }, [pathname]);

  useEffect(() => {
    if (authReady && !user) {
      router.push("/login");
    }
  }, [authReady, router, user]);

  const companyRegistrationNumber = useMemo(() => user?.registrationNumber ?? "Demo Workspace", [user]);

  function handleLogout() {
    clearStoredUser();
    router.push("/login");
  }

  if (!authReady) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-10">
        <div className="h-12 w-64 animate-pulse rounded-2xl bg-black/5 dark:bg-white/10" />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="mx-auto flex max-w-7xl gap-6 px-4 py-6">
        <div className="hidden lg:block">
          <Sidebar />
        </div>

        <div className="min-w-0 flex-1">
          <header className="sticky top-4 z-40 flex items-center justify-between gap-4 rounded-3xl border border-white/10 bg-surface px-4 py-4 shadow-xl shadow-slate-950/5 backdrop-blur-xl">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setMobileNavigationOpen(true)}
                className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/60 shadow-sm transition hover:bg-white lg:hidden dark:bg-white/5 dark:hover:bg-white/10"
              >
                <MenuIcon />
              </button>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">Company Registration</p>
                <p className="text-sm font-semibold">{companyRegistrationNumber}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="hidden text-right sm:block">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">Profile</p>
                <p className="text-sm font-semibold">{user?.companyName ?? "ChainGuard User"}</p>
              </div>
              <button
                type="button"
                onClick={handleLogout}
                className="inline-flex h-11 items-center justify-center rounded-2xl border border-white/10 bg-white/70 px-4 text-sm font-semibold shadow-sm transition hover:bg-white dark:bg-white/5 dark:hover:bg-white/10"
              >
                Logout
              </button>
            </div>
          </header>

          <main className="pt-6">{children}</main>
        </div>
      </div>

      {mobileNavigationOpen ? (
        <div className="fixed inset-0 z-50 bg-slate-950/45 p-4 backdrop-blur-sm lg:hidden">
          <div className="mx-auto max-w-7xl">
            <div className="mb-3 flex justify-end">
              <button
                type="button"
                onClick={() => setMobileNavigationOpen(false)}
                className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/15 bg-slate-950/70 text-white"
              >
                ×
              </button>
            </div>
            <Sidebar onNavigate={() => setMobileNavigationOpen(false)} />
          </div>
        </div>
      ) : null}
    </div>
  );
}
