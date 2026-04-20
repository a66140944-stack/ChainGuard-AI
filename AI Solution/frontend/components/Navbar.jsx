"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

function LogoMark() {
  return (
    <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-brand-600 text-white shadow-lg shadow-brand-600/20">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M12 2 2 7l10 5 10-5-10-5Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
        <path d="M2 17l10 5 10-5" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
        <path d="M2 12l10 5 10-5" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      </svg>
    </span>
  );
}

export default function Navbar() {
  const [darkModeEnabled, setDarkModeEnabled] = useState(false);

  useEffect(() => {
    const storedTheme = window.localStorage.getItem("chainguard_theme");
    const prefersDark = window.matchMedia?.("(prefers-color-scheme: dark)")?.matches;
    const nextDarkMode = storedTheme ? storedTheme === "dark" : Boolean(prefersDark);
    setDarkModeEnabled(nextDarkMode);
    document.documentElement.classList.toggle("dark", nextDarkMode);
  }, []);

  function toggleTheme() {
    setDarkModeEnabled((currentValue) => {
      const nextValue = !currentValue;
      document.documentElement.classList.toggle("dark", nextValue);
      window.localStorage.setItem("chainguard_theme", nextValue ? "dark" : "light");
      return nextValue;
    });
  }

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-background/70 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4">
        <Link href="/" className="flex items-center gap-3">
          <LogoMark />
          <div className="flex flex-col">
            <span className="text-base font-semibold tracking-tight">ChainGuard</span>
            <span className="text-xs text-muted">Supply chain visibility platform</span>
          </div>
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          <a href="#features" className="text-sm text-muted transition hover:text-foreground">
            Features
          </a>
          <a href="#analytics" className="text-sm text-muted transition hover:text-foreground">
            Analytics
          </a>
          <a href="#footer" className="text-sm text-muted transition hover:text-foreground">
            Contact
          </a>
        </nav>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={toggleTheme}
            className="cg-glass cg-shine inline-flex h-10 items-center justify-center rounded-xl border border-white/10 px-3 text-sm font-medium shadow-sm backdrop-blur-xl transition hover:bg-white/80 dark:hover:bg-white/10"
          >
            {darkModeEnabled ? "Light" : "Dark"}
          </button>
          <Link
            href="/login"
            className="cg-glass cg-shine hidden h-10 items-center justify-center rounded-xl border border-white/10 px-4 text-sm font-semibold shadow-sm backdrop-blur-xl transition hover:bg-white/80 dark:hover:bg-white/10 sm:inline-flex"
          >
            Login
          </Link>
          <Link
            href="/signup"
            className="cg-shine inline-flex h-10 items-center justify-center rounded-xl bg-brand-600 px-4 text-sm font-semibold text-white shadow-lg shadow-brand-600/25 transition hover:bg-brand-700"
          >
            Get Started
          </Link>
        </div>
      </div>
    </header>
  );
}
