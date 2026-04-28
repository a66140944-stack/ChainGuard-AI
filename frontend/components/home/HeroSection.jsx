import Link from "next/link";
import FadeIn from "./FadeIn.jsx";
import { ArrowRight, Radar, ShieldAlert } from "lucide-react";

const heroImage =
  "https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&w=1400&q=80";

export default function HeroSection() {
  return (
    <section className="relative">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-28 left-1/2 h-[520px] w-[920px] -translate-x-1/2 rounded-full bg-gradient-to-r from-brand-500/18 via-cyan-400/14 to-transparent blur-3xl" />
      </div>

      <div className="mx-auto max-w-7xl px-4 py-16 sm:py-20">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div>
            <FadeIn>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-surface px-3 py-1.5 text-xs font-semibold text-foreground shadow-sm backdrop-blur-xl">
                <Radar className="h-4 w-4 text-brand-600" />
                AI-powered supply chain monitoring
              </div>
            </FadeIn>

            <FadeIn delayMs={80}>
              <h1 className="mt-6 text-4xl font-semibold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
                Real-Time Intelligence for Modern Supply Chains
              </h1>
            </FadeIn>

            <FadeIn delayMs={140}>
              <p className="mt-5 max-w-xl text-base leading-7 text-muted sm:text-lg">
                Monitor shipments end-to-end, predict operational risk before it escalates, and optimize logistics with
                decision-ready insights.
              </p>
            </FadeIn>

            <FadeIn delayMs={200}>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/login"
                  className="cg-shine inline-flex h-12 items-center justify-center rounded-xl bg-brand-600 px-6 text-sm font-semibold text-white shadow-lg shadow-brand-600/25 transition duration-300 hover:bg-brand-700 hover:shadow-xl hover:shadow-brand-600/25"
                >
                  View Dashboard
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
                <Link
                  href="/track"
                  className="cg-glass cg-shine inline-flex h-12 items-center justify-center rounded-xl border border-white/10 bg-surface px-6 text-sm font-semibold text-foreground shadow-lg transition duration-300 hover:shadow-xl"
                >
                  See Live Tracking
                </Link>
              </div>
            </FadeIn>

            <FadeIn delayMs={260}>
              <div className="mt-10 grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl border border-white/10 bg-surface p-4 shadow-sm backdrop-blur-xl">
                  <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                    <ShieldAlert className="h-4 w-4 text-brand-600" />
                    Risk-aware operations
                  </div>
                  <p className="mt-1 text-sm text-muted">
                    Surface exceptions early with alerting that matches real-world thresholds.
                  </p>
                </div>
                <div className="rounded-xl border border-white/10 bg-surface p-4 shadow-sm backdrop-blur-xl">
                  <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                    <Radar className="h-4 w-4 text-brand-600" />
                    Live visibility
                  </div>
                  <p className="mt-1 text-sm text-muted">
                    Consolidate telemetry, ETAs, and route context into a single control view.
                  </p>
                </div>
              </div>
            </FadeIn>
          </div>

          <FadeIn delayMs={120} className="lg:justify-self-end">
            <div className="group relative">
              <div className="pointer-events-none absolute -inset-6 -z-10 rounded-[28px] bg-gradient-to-br from-brand-500/22 via-cyan-400/14 to-transparent blur-2xl" />
              <div className="overflow-hidden rounded-xl border border-white/10 bg-surface shadow-xl backdrop-blur-xl transition duration-300 group-hover:scale-[1.015]">
                <img
                  src={heroImage}
                  alt="Control tower logistics dashboard"
                  className="aspect-[4/3] w-full object-cover"
                  loading="eager"
                />
              </div>
            </div>
          </FadeIn>
        </div>
      </div>
    </section>
  );
}

