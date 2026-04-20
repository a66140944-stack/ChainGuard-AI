import FadeIn from "./FadeIn.jsx";
import { CheckCircle2 } from "lucide-react";

const sections = [
  {
    eyebrow: "Control tower view",
    heading: "One workspace for exceptions, ETAs, and telemetry",
    description:
      "Align operations teams with a single source of truth across lanes—what changed, why it matters, and what to do next.",
    bullets: ["Live shipment status and milestones", "Risk signals with contextual factors", "Actionable alerts and audit trails"],
    image:
      "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1400&q=80"
  },
  {
    eyebrow: "Warehouse + network health",
    heading: "Prevent small issues from becoming expensive disruptions",
    description:
      "Detect temperature excursions, low battery devices, and slow-moving legs early—then route work to the right team immediately.",
    bullets: ["Sensor monitoring and SLA thresholds", "Team-ready alerting and escalation", "Reliability reporting across lanes"],
    image:
      "https://images.unsplash.com/photo-1587293852726-70cdb56c2866?auto=format&fit=crop&w=1400&q=80",
    reversed: true
  },
  {
    eyebrow: "Decision support",
    heading: "Optimize routes with clarity, not guesswork",
    description:
      "Compare options with estimated impact on delivery and risk so operators can choose the right response in minutes.",
    bullets: ["Route alternatives and impact checks", "Delay forecasting with confidence signals", "Historical trends to improve playbooks"],
    image:
      "https://images.unsplash.com/photo-1529070538774-1843cb3265df?auto=format&fit=crop&w=1400&q=80"
  }
];

function ProductSection({ section, index }) {
  const gridClass = section.reversed ? "lg:grid-cols-[1.1fr_0.9fr]" : "lg:grid-cols-[0.9fr_1.1fr]";
  const orderText = section.reversed ? "lg:order-2" : "";
  const orderImage = section.reversed ? "lg:order-1" : "";

  return (
    <div className="py-10 sm:py-12">
      <div className={`grid items-center gap-10 ${gridClass} lg:gap-14`}>
        <FadeIn delayMs={index * 80} className={orderText}>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-brand-600">{section.eyebrow}</p>
            <h3 className="mt-3 text-3xl font-semibold tracking-tight text-foreground">
              {section.heading}
            </h3>
            <p className="mt-3 text-base leading-7 text-muted">{section.description}</p>

            <ul className="mt-6 space-y-3">
              {section.bullets.map((bullet) => (
                <li key={bullet} className="flex items-start gap-3 text-sm text-foreground">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 text-brand-600" />
                  <span className="leading-6 text-muted">{bullet}</span>
                </li>
              ))}
            </ul>
          </div>
        </FadeIn>

        <FadeIn delayMs={index * 80 + 120} className={orderImage}>
          <div className="group relative">
            <div className="pointer-events-none absolute -inset-6 -z-10 rounded-[28px] bg-gradient-to-br from-brand-500/16 via-cyan-400/12 to-transparent blur-2xl" />
            <div className="overflow-hidden rounded-xl border border-white/10 bg-surface shadow-xl backdrop-blur-xl transition duration-300 group-hover:scale-[1.012]">
              <img
                src={section.image}
                alt={section.heading}
                className="aspect-[4/3] w-full object-cover"
                loading="lazy"
              />
            </div>
          </div>
        </FadeIn>
      </div>
    </div>
  );
}

export default function ProductSections() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:py-20">
      <FadeIn>
        <div className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-brand-600">Solutions</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-foreground">
            Designed for the way logistics teams work
          </h2>
          <p className="mt-3 text-base leading-7 text-muted">
            Clean UX, strong hierarchy, and calm visuals—so operators can spot risk quickly and act with confidence.
          </p>
        </div>
      </FadeIn>

      <div className="mt-6">
        {sections.map((section, index) => (
          <ProductSection key={section.heading} section={section} index={index} />
        ))}
      </div>
    </section>
  );
}

