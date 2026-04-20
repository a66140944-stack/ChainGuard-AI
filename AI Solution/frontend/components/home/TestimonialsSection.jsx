import FadeIn from "./FadeIn.jsx";

const testimonials = [
  {
    quote:
      "ChainGuard gives us a calm, reliable view of what’s happening across lanes. We can spot exceptions early and act before the ETA slips.",
    name: "Aarav Mehta",
    role: "Operations Manager"
  },
  {
    quote:
      "The risk signals are easy to interpret. It feels like we finally have a shared language between dispatch, warehouse, and customer teams.",
    name: "Sana Iqbal",
    role: "Logistics Lead"
  },
  {
    quote:
      "Telemetry + alerts in one interface means fewer surprises. The dashboard helps us prioritize what matters without noise.",
    name: "Rohit Kapoor",
    role: "Supply Chain Analyst"
  }
];

function TestimonialCard({ item, index }) {
  return (
    <FadeIn delayMs={index * 80}>
      <div className="cg-glass cg-shine h-full rounded-xl border border-white/10 bg-surface p-6 shadow-lg backdrop-blur-xl transition duration-300 hover:shadow-xl">
        <p className="text-sm italic leading-7 text-foreground">“{item.quote}”</p>
        <div className="mt-5">
          <p className="text-sm font-semibold text-foreground">{item.name}</p>
          <p className="text-sm text-muted">{item.role}</p>
        </div>
      </div>
    </FadeIn>
  );
}

export default function TestimonialsSection() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:py-20">
      <FadeIn>
        <div className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-brand-600">Trusted by operators</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-foreground">
            Built for high-stakes logistics decisions
          </h2>
          <p className="mt-3 text-base leading-7 text-muted">
            Premium, minimal UI that helps teams act faster—without clutter.
          </p>
        </div>
      </FadeIn>

      <div className="mt-10 grid gap-5 lg:grid-cols-3">
        {testimonials.map((item, index) => (
          <TestimonialCard key={item.name} item={item} index={index} />
        ))}
      </div>
    </section>
  );
}

