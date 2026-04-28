import FadeIn from "./FadeIn.jsx";

const stats = [
  { value: "99.9%", label: "Uptime" },
  { value: "30%", label: "Faster deliveries" },
  { value: "Real-time", label: "Visibility" },
  { value: "24/7", label: "Monitoring" }
];

export default function StatsSection() {
  return (
    <section className="mx-auto max-w-7xl px-4 pb-16 sm:pb-20">
      <FadeIn>
        <div className="cg-glass rounded-xl border border-white/10 bg-surface px-6 py-10 shadow-lg backdrop-blur-xl">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat, index) => (
              <div
                key={stat.label}
                className={[
                  "text-center",
                  index !== 0 ? "sm:border-l sm:border-white/10 sm:pl-6" : ""
                ].join(" ")}
              >
                <p className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                  {stat.value}
                </p>
                <p className="mt-1 text-sm font-medium text-muted">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </FadeIn>
    </section>
  );
}

