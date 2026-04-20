import Link from "next/link";
import Footer from "../components/Footer.jsx";
import Navbar from "../components/Navbar.jsx";

function FeatureCard({ title, description, icon }) {
  return (
    <article className="rounded-[28px] border border-white/10 bg-surface p-6 shadow-xl shadow-slate-950/5 backdrop-blur-xl transition duration-300 hover:-translate-y-1">
      <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-500/15 text-brand-600">
        {icon}
      </div>
      <h3 className="mt-5 text-lg font-semibold">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-muted">{description}</p>
    </article>
  );
}

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main>
        <section className="mx-auto max-w-7xl px-4 py-16 sm:py-20">
          <div className="grid items-center gap-10 lg:grid-cols-[1.05fr_0.95fr]">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-surface px-4 py-2 text-sm text-muted shadow-sm backdrop-blur-xl">
                <span className="h-2 w-2 rounded-full bg-success-500" />
                Operational intelligence for logistics teams
              </div>
              <h1 className="mt-6 max-w-3xl text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl">
                Smart Supply Chain Management
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-7 text-muted sm:text-lg">
                ChainGuard gives your operations team one clean control center for shipment visibility,
                risk forecasting, telemetry monitoring, and decision-ready analytics.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link href="/signup" className="inline-flex h-12 items-center justify-center rounded-2xl bg-brand-600 px-6 text-sm font-semibold text-white shadow-lg shadow-brand-600/20 transition hover:bg-brand-700">
                  Start Free
                </Link>
                <Link href="/login" className="inline-flex h-12 items-center justify-center rounded-2xl border border-white/10 bg-surface px-6 text-sm font-semibold shadow-sm transition hover:bg-white/80 dark:hover:bg-white/10">
                  View Dashboard
                </Link>
              </div>
            </div>
            <div className="relative">
              <div className="absolute inset-0 -z-10 rounded-[32px] bg-gradient-to-br from-brand-500/20 via-cyan-400/10 to-transparent blur-3xl" />
              <div className="rounded-[32px] border border-white/10 bg-surface p-6 shadow-2xl shadow-slate-950/10 backdrop-blur-xl">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-3xl border border-white/10 bg-surface-strong/60 p-5">
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted">Network Health</p>
                    <p className="mt-3 text-3xl font-semibold">99.2%</p>
                    <p className="mt-1 text-sm text-muted">On-schedule performance this week</p>
                  </div>
                  <div className="rounded-3xl border border-white/10 bg-surface-strong/60 p-5">
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted">AI Predictions</p>
                    <p className="mt-3 text-3xl font-semibold">842</p>
                    <p className="mt-1 text-sm text-muted">Forecast decisions generated</p>
                  </div>
                  <div className="rounded-3xl border border-white/10 bg-surface-strong/60 p-5 sm:col-span-2">
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted">Live Corridor</p>
                    <div className="mt-4 flex items-center justify-between gap-4 text-sm">
                      <span className="font-semibold">Chennai</span>
                      <div className="h-1 flex-1 rounded-full bg-brand-500/20">
                        <div className="h-1 w-2/3 rounded-full bg-brand-600" />
                      </div>
                      <span className="font-semibold">Delhi</span>
                    </div>
                    <div className="mt-3 flex items-center justify-between text-xs text-muted">
                      <span>IoT telemetry active</span>
                      <span>ETA confidence 92%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        <section id="features" className="mx-auto max-w-7xl px-4 py-10 sm:py-16">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-brand-600">Core Platform</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight">Everything your operations team needs in one workspace</h2>
            <p className="mt-3 text-base leading-7 text-muted">
              Built for shipment monitoring, exception handling, decision support, and historical trend analysis.
            </p>
          </div>
          <div className="mt-8 grid gap-5 md:grid-cols-3">
            <FeatureCard title="Live Tracking" description="Track shipments across routes, temperatures, and delivery milestones from a single dashboard." icon={<span className="text-xl">◎</span>} />
            <FeatureCard title="AI Risk Analysis" description="Surface delays, route risks, and optimization suggestions before they become operational issues." icon={<span className="text-xl">✦</span>} />
            <FeatureCard title="IoT Visibility" description="Monitor connected devices, environmental telemetry, and shipment health in real time." icon={<span className="text-xl">⌁</span>} />
          </div>
        </section>
        <section id="analytics" className="mx-auto max-w-7xl px-4 py-10 pb-20 sm:py-16">
          <div className="grid gap-5 lg:grid-cols-3">
            {[
              { label: "Predictions accuracy", value: "94%", meta: "Model benchmark confidence" },
              { label: "Active shipments", value: "128", meta: "Across road, rail, air, and container" },
              { label: "Telemetry uptime", value: "99.7%", meta: "Reliable stream continuity" }
            ].map((stat) => (
              <div key={stat.label} className="rounded-[28px] border border-white/10 bg-surface p-6 shadow-xl shadow-slate-950/5 backdrop-blur-xl">
                <p className="text-sm text-muted">{stat.label}</p>
                <p className="mt-3 text-4xl font-semibold tracking-tight">{stat.value}</p>
                <p className="mt-2 text-sm text-muted">{stat.meta}</p>
              </div>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
