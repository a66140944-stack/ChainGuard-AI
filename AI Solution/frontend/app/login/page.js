"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Navbar from "../../components/Navbar.jsx";
import { setStoredUser, getStoredUser } from "../../lib/session.js";

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (getStoredUser()) {
      router.push("/dashboard");
    }
  }, [router]);

  function handleSubmit(event) {
    event.preventDefault();
    setErrorMessage("");

    if (!isValidEmail(email)) {
      setErrorMessage("Enter a valid email address.");
      return;
    }

    if (!password.trim()) {
      setErrorMessage("Password is required.");
      return;
    }

    setIsSubmitting(true);

    try {
      const rawUsers = window.localStorage.getItem("chainguard_users");
      const users = rawUsers ? JSON.parse(rawUsers) : [];
      const matchedUser = users.find((user) => user.email === email && user.password === password);

      if (!matchedUser) {
        setErrorMessage("Invalid email or password. Sign up first if this is your first visit.");
        setIsSubmitting(false);
        return;
      }

      setStoredUser({
        companyName: matchedUser.companyName,
        registrationNumber: matchedUser.registrationNumber,
        email: matchedUser.email
      });

      router.push("/dashboard");
    } catch {
      setErrorMessage("Login failed. Please try again.");
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="mx-auto flex max-w-7xl items-center px-4 py-10">
        <div className="grid w-full items-center gap-8 lg:grid-cols-[0.95fr_1.05fr]">
          <section className="hidden rounded-[32px] border border-white/10 bg-surface p-8 shadow-2xl shadow-slate-950/10 backdrop-blur-xl lg:block">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-brand-600">Operations Access</p>
            <h1 className="mt-4 text-4xl font-semibold tracking-tight">Sign in to your ChainGuard workspace</h1>
            <p className="mt-4 max-w-lg text-base leading-7 text-muted">
              Access live shipment monitoring, AI-based risk analysis, and IoT-powered telemetry from one professional control center.
            </p>
          </section>
          <section className="w-full rounded-[32px] border border-white/10 bg-surface p-6 shadow-2xl shadow-slate-950/10 backdrop-blur-xl sm:p-8">
            <h2 className="text-2xl font-semibold">Welcome back</h2>
            <p className="mt-2 text-sm text-muted">Login to continue to your supply chain dashboard.</p>
            {errorMessage ? <div className="mt-5 rounded-2xl border border-danger-500/30 bg-danger-500/10 px-4 py-3 text-sm text-danger-500">{errorMessage}</div> : null}
            <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
              <label className="flex flex-col gap-2">
                <span className="text-sm font-medium">Email</span>
                <input className="w-full rounded-2xl border border-white/10 bg-white/70 px-4 py-3 text-sm shadow-sm outline-none transition dark:bg-white/5" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@company.com" />
              </label>
              <label className="flex flex-col gap-2">
                <span className="text-sm font-medium">Password</span>
                <input type="password" className="w-full rounded-2xl border border-white/10 bg-white/70 px-4 py-3 text-sm shadow-sm outline-none transition dark:bg-white/5" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Your password" />
              </label>
              <button type="submit" disabled={isSubmitting} className="mt-2 inline-flex h-12 items-center justify-center rounded-2xl bg-brand-600 px-5 text-sm font-semibold text-white shadow-lg shadow-brand-600/20 transition hover:bg-brand-700 disabled:opacity-60">
                {isSubmitting ? "Signing in..." : "Login"}
              </button>
            </form>
            <p className="mt-5 text-sm text-muted">
              Don&apos;t have an account?{" "}
              <Link href="/signup" className="font-semibold text-brand-600 hover:text-brand-700">
                Create one
              </Link>
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
