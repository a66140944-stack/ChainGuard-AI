"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import Navbar from "../../components/Navbar.jsx";
import { getStoredUser, setStoredUser } from "../../lib/session.js";

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export default function SignupPage() {
  const router = useRouter();
  const [companyName, setCompanyName] = useState("");
  const [registrationNumber, setRegistrationNumber] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (getStoredUser()) {
      router.push("/dashboard");
    }
  }, [router]);

  const passwordStrength = useMemo(() => {
    if (password.length < 6) return "Weak";
    if (password.length < 10) return "Medium";
    return "Strong";
  }, [password]);

  function validateForm() {
    if (!companyName.trim()) return "Company name is required.";
    if (!registrationNumber.trim()) return "Registration number is required.";
    if (!isValidEmail(email)) return "Enter a valid email address.";
    if (password.length < 8) return "Password must be at least 8 characters.";
    if (password !== confirmPassword) return "Passwords do not match.";
    return "";
  }

  function handleSubmit(event) {
    event.preventDefault();
    const validationError = validateForm();
    if (validationError) {
      setErrorMessage(validationError);
      return;
    }
    setIsSubmitting(true);
    try {
      const rawUsers = window.localStorage.getItem("chainguard_users");
      const users = rawUsers ? JSON.parse(rawUsers) : [];
      if (users.some((user) => user.email === email)) {
        setErrorMessage("An account with this email already exists.");
        setIsSubmitting(false);
        return;
      }
      const newUser = { companyName, registrationNumber, email, password };
      window.localStorage.setItem("chainguard_users", JSON.stringify([newUser, ...users]));
      setStoredUser({ companyName, registrationNumber, email });
      router.push("/dashboard");
    } catch {
      setErrorMessage("Signup failed. Please try again.");
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="mx-auto flex max-w-7xl items-center px-4 py-10">
        <div className="grid w-full items-center gap-8 lg:grid-cols-[1.05fr_0.95fr]">
          <section className="w-full rounded-[32px] border border-white/10 bg-surface p-6 shadow-2xl shadow-slate-950/10 backdrop-blur-xl sm:p-8">
            <h1 className="text-2xl font-semibold">Create your account</h1>
            <p className="mt-2 text-sm text-muted">Set up your ChainGuard workspace for shipment monitoring and AI visibility.</p>
            {errorMessage ? <div className="mt-5 rounded-2xl border border-danger-500/30 bg-danger-500/10 px-4 py-3 text-sm text-danger-500">{errorMessage}</div> : null}
            <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
              <label className="flex flex-col gap-2">
                <span className="text-sm font-medium">Company Name</span>
                <input className="w-full rounded-2xl border border-white/10 bg-white/70 px-4 py-3 text-sm shadow-sm outline-none transition dark:bg-white/5" value={companyName} onChange={(event) => setCompanyName(event.target.value)} />
              </label>
              <label className="flex flex-col gap-2">
                <span className="text-sm font-medium">Registration Number</span>
                <input className="w-full rounded-2xl border border-white/10 bg-white/70 px-4 py-3 text-sm shadow-sm outline-none transition dark:bg-white/5" value={registrationNumber} onChange={(event) => setRegistrationNumber(event.target.value)} />
              </label>
              <label className="flex flex-col gap-2">
                <span className="text-sm font-medium">Email</span>
                <input className="w-full rounded-2xl border border-white/10 bg-white/70 px-4 py-3 text-sm shadow-sm outline-none transition dark:bg-white/5" value={email} onChange={(event) => setEmail(event.target.value)} />
              </label>
              <label className="flex flex-col gap-2">
                <span className="text-sm font-medium">Password</span>
                <input type="password" className="w-full rounded-2xl border border-white/10 bg-white/70 px-4 py-3 text-sm shadow-sm outline-none transition dark:bg-white/5" value={password} onChange={(event) => setPassword(event.target.value)} />
                <span className="text-xs text-muted">Strength: {passwordStrength}</span>
              </label>
              <label className="flex flex-col gap-2">
                <span className="text-sm font-medium">Confirm Password</span>
                <input type="password" className="w-full rounded-2xl border border-white/10 bg-white/70 px-4 py-3 text-sm shadow-sm outline-none transition dark:bg-white/5" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} />
              </label>
              <button type="submit" disabled={isSubmitting} className="mt-2 inline-flex h-12 items-center justify-center rounded-2xl bg-brand-600 px-5 text-sm font-semibold text-white shadow-lg shadow-brand-600/20 transition hover:bg-brand-700 disabled:opacity-60">
                {isSubmitting ? "Creating..." : "Sign Up"}
              </button>
            </form>
            <p className="mt-5 text-sm text-muted">
              Already registered?{" "}
              <Link href="/login" className="font-semibold text-brand-600 hover:text-brand-700">
                Login
              </Link>
            </p>
          </section>
          <section className="hidden rounded-[32px] border border-white/10 bg-surface p-8 shadow-2xl shadow-slate-950/10 backdrop-blur-xl lg:block">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-brand-600">Fast Setup</p>
            <h2 className="mt-4 text-4xl font-semibold tracking-tight">Launch a modern supply chain control center in minutes</h2>
            <ul className="mt-6 space-y-4 text-sm leading-7 text-muted">
              <li>Track shipments across routes and statuses</li>
              <li>Review AI-driven delay and risk indicators</li>
              <li>Prepare for backend integration with a clean scalable frontend</li>
            </ul>
          </section>
        </div>
      </main>
    </div>
  );
}
