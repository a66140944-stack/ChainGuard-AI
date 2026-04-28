import Link from "next/link";
import FadeIn from "./FadeIn.jsx";

export default function FinalCTA() {
  return (
    <section className="mx-auto max-w-7xl px-4 pb-20">
      <FadeIn>
        <div className="relative overflow-hidden rounded-xl border border-white/10 bg-surface px-6 py-14 shadow-xl backdrop-blur-xl sm:px-10">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute -top-24 left-1/2 h-[380px] w-[700px] -translate-x-1/2 rounded-full bg-gradient-to-r from-brand-500/22 via-cyan-400/12 to-transparent blur-3xl" />
          </div>

          <div className="relative mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              Start monitoring your supply chain with confidence
            </h2>
            <p className="mt-3 text-base leading-7 text-muted">
              Move from reactive updates to proactive operations with real-time visibility and AI-driven risk insight.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Link
                href="/login"
                className="cg-shine inline-flex h-12 items-center justify-center rounded-xl bg-brand-600 px-6 text-sm font-semibold text-white shadow-lg shadow-brand-600/25 transition duration-300 hover:bg-brand-700 hover:shadow-xl hover:shadow-brand-600/25"
              >
                Go to Dashboard
              </Link>
              <Link
                href="/signup"
                className="cg-glass cg-shine inline-flex h-12 items-center justify-center rounded-xl border border-white/10 bg-surface px-6 text-sm font-semibold text-foreground shadow-lg transition duration-300 hover:shadow-xl"
              >
                Create an account
              </Link>
            </div>
          </div>
        </div>
      </FadeIn>
    </section>
  );
}

