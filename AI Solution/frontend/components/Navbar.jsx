"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import BrandWordmark from "./BrandWordmark.jsx";

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
          <BrandWordmark className="h-11 w-auto rounded-xl" priority sizes="(max-width: 768px) 180px, 220px" />
          <div className="flex flex-col">
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
