import FadeIn from "./FadeIn.jsx";
import {
  Activity,
  BellRing,
  Brain,
  LayoutDashboard,
  Route,
  ThermometerSnowflake
} from "lucide-react";

const features = [
  {
    title: "Real-time tracking",
    description: "Follow shipments across routes, milestones, and live location context in one place.",
    icon: Activity
  },
  {
    title: "AI risk prediction",
    description: "Detect delay and disruption patterns early with explainable risk signals.",
    icon: Brain
  },
  {
    title: "Smart alerts",
    description: "Notify teams when thresholds are breached—temperature, ETA drift, or route anomalies.",
    icon: BellRing
  },
  {
    title: "Route optimization",
    description: "Compare alternate paths and impact so operations can choose the best outcome quickly.",
    icon: Route
  },
  {
    title: "Sensor monitoring",
    description: "Track IoT telemetry like temperature and battery health to protect sensitive cargo.",
    icon: ThermometerSnowflake
  },
  {
    title: "Analytics dashboard",
    description: "Turn operational data into clear KPIs, trends, and decision-ready summaries.",
    icon: LayoutDashboard
  }
];

function FeatureCard({ feature, index }) {
  const Icon = feature.icon;

  return (
    <FadeIn delayMs={index * 60}>
      <div className="cg-glass cg-shine h-full rounded-xl border border-white/10 bg-surface p-6 shadow-lg backdrop-blur-xl transition duration-300 hover:-translate-y-0.5 hover:shadow-xl">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-500/10 text-brand-600">
          <Icon className="h-5 w-5" />
        </div>
        <h3 className="mt-4 text-base font-semibold text-foreground">{feature.title}</h3>
        <p className="mt-2 text-sm leading-6 text-muted">{feature.description}</p>
      </div>
    </FadeIn>
  );
}

export default function FeaturesGrid() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:py-20">
      <div className="grid gap-10 lg:grid-cols-[1fr_1.1fr] lg:items-end">
        <FadeIn>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-brand-600">Capabilities</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-foreground">
              Built for enterprise logistics teams
            </h2>
            <p className="mt-3 max-w-xl text-base leading-7 text-muted">
              ChainGuard combines live telemetry and AI signals to give operators clarity, speed, and confidence across
              every lane.
            </p>
          </div>
        </FadeIn>

        <FadeIn delayMs={120}>
          <div className="rounded-xl border border-white/10 bg-surface p-5 shadow-sm backdrop-blur-xl">
            <div className="grid gap-4 sm:grid-cols-3">
              {[
                { label: "Telemetry", value: "Live" },
                { label: "Risk signals", value: "AI" },
                { label: "Alerts", value: "Smart" }
              ].map((pill) => (
                <div key={pill.label} className="rounded-xl border border-white/10 bg-surface-strong/50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted">
                    {pill.label}
                  </p>
                  <p className="mt-2 text-xl font-semibold text-foreground">{pill.value}</p>
                </div>
              ))}
            </div>
          </div>
        </FadeIn>
      </div>

      <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {features.map((feature, index) => (
          <FeatureCard key={feature.title} feature={feature} index={index} />
        ))}
      </div>
    </section>
  );
}

