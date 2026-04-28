"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Brain,
  ChartLine,
  Cpu,
  Eye,
  Factory,
  Globe,
  Mail,
  MapPin,
  MapPinned,
  MessageCircle,
  Route,
  Snowflake,
  Truck,
  X
} from "lucide-react";
import BrandWordmark from "../components/BrandWordmark.jsx";

const visionCards = [
  {
    title: "IoT-Powered Asset Tracking",
    image: "https://media.istockphoto.com/id/1470419797/vector/smart-logistics-with-automated-delivery-system-to-futuristic-city-shipments-distribution.webp?a=1&b=1&s=612x612&w=0&k=20&c=CK_xCAwwHEpG7X8fA-jBTUdmgi2gHLu6KgV-vRr-4h4=",
    icon: Cpu
  },
  {
    title: "AI Predictive Analytics",
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&h=400&fit=crop",
    icon: ChartLine
  },
  {
    title: "Real-Time Global Visibility",
    image: "https://images.unsplash.com/photo-1581091226033-d5c48150dbaa?w=600&h=400&fit=crop",
    icon: Globe
  }
];

const intelligenceCards = [
  {
    title: "IoT-enabled tracking",
    description: "Real-time sensor fusion and fleet telemetry",
    icon: Cpu
  },
  {
    title: "Predictive insights",
    description: "Anticipate delays and demand volatility",
    icon: ChartLine
  },
  {
    title: "Real-time visibility",
    description: "Unified control tower, live ETAs and alerts",
    icon: Eye
  }
];

const industryChips = [
  { label: "Logistics", icon: Truck },
  { label: "Cold Chain", icon: Snowflake },
  { label: "Manufacturing", icon: Factory },
  { label: "Global Trade", icon: Globe }
];

const aiFeatures = [
  { label: "Real-time tracking", icon: MapPinned },
  { label: "Predictive rerouting", icon: Route },
  { label: "Intelligent alerts", icon: Brain },
  { label: "Anomaly detection", icon: ChartLine }
];

function ParticleCanvas() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;

    const context = canvas.getContext("2d");
    if (!context) return undefined;

    let animationFrameId = 0;
    let particles = [];

    function resizeCanvas() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }

    function createParticle() {
      return {
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.35,
        vy: (Math.random() - 0.5) * 0.35,
        radius: Math.random() * 2.5 + 0.8,
        alpha: Math.random() * 0.5 + 0.15
      };
    }

    function initParticles() {
      particles = [];
      const particleCount = Math.min(
        150,
        Math.floor((window.innerWidth * window.innerHeight) / 8000)
      );

      for (let index = 0; index < particleCount; index += 1) {
        particles.push(createParticle());
      }
    }

    function animateParticles() {
      context.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach((particle) => {
        particle.x += particle.vx;
        particle.y += particle.vy;

        if (particle.x < 0) particle.x = canvas.width;
        if (particle.x > canvas.width) particle.x = 0;
        if (particle.y < 0) particle.y = canvas.height;
        if (particle.y > canvas.height) particle.y = 0;

        context.beginPath();
        context.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
        context.fillStyle = `rgba(95, 122, 242, ${particle.alpha})`;
        context.fill();
      });

      animationFrameId = window.requestAnimationFrame(animateParticles);
    }

    function handleResize() {
      resizeCanvas();
      initParticles();
    }

    resizeCanvas();
    initParticles();
    animateParticles();
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      window.cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return <canvas ref={canvasRef} className="pointer-events-none fixed inset-0 z-0 h-full w-full" />;
}

function SectionTitle({ children }) {
  return (
    <h2 className="mb-8 text-center text-[2.2rem] font-bold tracking-[-0.3px] text-transparent bg-[linear-gradient(115deg,#FFF,#ACB8FF)] bg-clip-text">
      {children}
    </h2>
  );
}

function PhoneIcon() {
  return (
    <svg className="h-4 w-4 text-[#9CACFF]" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M5 4.5h3l1.5 4-2 1.5a15 15 0 0 0 6 6L15 14l4 1.5v3a2 2 0 0 1-2.2 2A18 18 0 0 1 3.5 7.2 2 2 0 0 1 5 4.5Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function Modal({ type, onClose }) {
  if (!type) return null;

  const modalMap = {
    about: {
      title: "About ChainGuard",
      content: (
        <>
          <div className="overflow-hidden rounded-2xl bg-[#075E54]">
            <div className="flex items-center gap-2 bg-[#054740] px-4 py-3 font-bold text-white">
              <MessageCircle className="h-4 w-4" />
              ChainGuard AI - Product Discussion
            </div>
            <div className="max-h-[350px] space-y-3 overflow-y-auto bg-[#ECE5DD] p-4 text-sm leading-6 text-[#1F2A3A]">
              <div className="flex justify-end">
                <div className="max-w-[80%] rounded-[18px] rounded-br-[4px] bg-[#DCF8C6] px-3 py-2">
                  What is ChainGuard?
                </div>
              </div>
              <div className="flex justify-start">
                <div className="max-w-[80%] rounded-[18px] rounded-bl-[4px] bg-white px-3 py-2">
                  ChainGuard is an AI-powered supply chain monitoring platform built to help logistics operations teams
                  detect risk, predict delays, and recommend smarter routes in real time.
                </div>
              </div>
              <div className="flex justify-end">
                <div className="max-w-[80%] rounded-[18px] rounded-br-[4px] bg-[#DCF8C6] px-3 py-2">
                  What does it actually do?
                </div>
              </div>
              <div className="flex justify-start">
                <div className="max-w-[80%] rounded-[18px] rounded-bl-[4px] bg-white px-3 py-2">
                  Ingests shipment telemetry from REST and MQTT, computes hybrid risk scores, predicts delays and ETAs,
                  recommends alternate routes, and streams live updates to the dashboard.
                </div>
              </div>
              <div className="flex justify-end">
                <div className="max-w-[80%] rounded-[18px] rounded-br-[4px] bg-[#DCF8C6] px-3 py-2">
                  Key features?
                </div>
              </div>
              <div className="flex justify-start">
                <div className="max-w-[80%] rounded-[18px] rounded-bl-[4px] bg-white px-3 py-2">
                  Hybrid AI, smart rerouting, MQTT and REST support, fallback-safe operation, and a polished demo-ready
                  Next.js dashboard.
                </div>
              </div>
              <div className="flex justify-end">
                <div className="max-w-[80%] rounded-[18px] rounded-br-[4px] bg-[#DCF8C6] px-3 py-2">
                  Tech stack?
                </div>
              </div>
              <div className="flex justify-start">
                <div className="max-w-[80%] rounded-[18px] rounded-bl-[4px] bg-white px-3 py-2">
                  Flask backend, Socket.IO, XGBoost risk engine, Next.js frontend, and an MQTT IoT simulator.
                </div>
              </div>
            </div>
          </div>
          <p className="mt-4 text-center text-sm text-[#CFD6FF]">ChainGuard: Real-time intelligence for modern supply chains</p>
        </>
      )
    },
    contact: {
      title: "Contact Us",
      content: (
        <div className="space-y-3 text-sm leading-7 text-[#D9E0FF]">
          <p className="flex items-center gap-3">
            <Mail className="h-4 w-4 text-[#9CACFF]" />
            <span>
              <strong>Email:</strong> hello@chainguard.ai
            </span>
          </p>
          <p className="flex items-center gap-3">
            <PhoneIcon />
            <span>
              <strong>Support:</strong> +1 (800) 764-2378
            </span>
          </p>
          <p className="flex items-center gap-3">
            <MapPin className="h-4 w-4 text-[#9CACFF]" />
            <span>
              <strong>HQ:</strong> 101 Intelligence Way, San Francisco, CA
            </span>
          </p>
          <p>Our team will respond within 24 hours. For demos: sales@chainguard.ai</p>
          <p>
            <strong>GitHub:</strong> github.com/chainguard
          </p>
        </div>
      )
    },
    privacy: {
      title: "Privacy Policy",
      content: (
        <div className="space-y-3 text-sm leading-7 text-[#D9E0FF]">
          <p>ChainGuard values data security. Telemetry data is used only for operational insights.</p>
          <p>We do not share personal data with third parties.</p>
          <p>Designed with enterprise-grade privacy expectations in mind.</p>
        </div>
      )
    }
  };

  const modal = modalMap[type];

  return (
    <div
      className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/85 p-4 backdrop-blur-[12px]"
      onClick={onClose}
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="homepage-modal-title"
        className="w-[90%] max-w-[550px] rounded-[2rem] border border-[#5F7AF2] bg-[#0C0C1E] p-10 shadow-[0_25px_40px_rgba(0,0,0,0.5)]"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <h2
            id="homepage-modal-title"
            className="text-[1.8rem] font-bold text-transparent bg-[linear-gradient(135deg,#FFF,#9AABFF)] bg-clip-text"
          >
            {modal.title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#5F7AF2] text-white"
            aria-label="Close modal"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="mt-4">{modal.content}</div>
        <button
          type="button"
          onClick={onClose}
          className="mt-5 rounded-full bg-[#5F7AF2] px-6 py-2.5 text-sm font-bold text-white"
        >
          Close
        </button>
      </div>
    </div>
  );
}

export default function HomePage() {
  const router = useRouter();
  const [activeModal, setActiveModal] = useState(null);

  useEffect(() => {
    function handleEscape(event) {
      if (event.key === "Escape") {
        setActiveModal(null);
      }
    }

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, []);

  function scrollToTop() {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[#05050F] text-[#EDF2FF]">
      <ParticleCanvas />

      <header className="sticky top-0 z-[100] border-b border-[rgba(95,122,242,0.4)] bg-[rgba(5,5,15,0.85)] backdrop-blur-[16px]">
        <div className="relative z-10 mx-auto flex max-w-[1280px] flex-wrap items-center justify-between gap-4 px-8 py-4">
          <button type="button" onClick={scrollToTop} className="flex items-center gap-3">
            <BrandWordmark className="h-14 w-auto rounded-2xl" priority sizes="(max-width: 768px) 180px, 240px" />
          </button>

          <nav className="flex items-center gap-8">
            <button
              type="button"
              onClick={scrollToTop}
              className="cursor-pointer text-base font-medium text-[#E0E6FF] transition hover:text-[#B6C2FF] hover:[text-shadow:0_0_6px_rgba(95,122,242,0.5)]"
            >
              Home
            </button>
            <button
              type="button"
              onClick={() => setActiveModal("about")}
              className="cursor-pointer text-base font-medium text-[#E0E6FF] transition hover:text-[#B6C2FF] hover:[text-shadow:0_0_6px_rgba(95,122,242,0.5)]"
            >
              About Us
            </button>
            <button
              type="button"
              onClick={() => setActiveModal("contact")}
              className="cursor-pointer text-base font-medium text-[#E0E6FF] transition hover:text-[#B6C2FF] hover:[text-shadow:0_0_6px_rgba(95,122,242,0.5)]"
            >
              Contact Us
            </button>
          </nav>

          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => router.push("/login")}
              className="rounded-full border-[1.5px] border-[#5F7AF2] bg-transparent px-5 py-2 text-sm font-semibold text-[#EFF2FF] transition hover:-translate-y-0.5 hover:bg-[rgba(95,122,242,0.15)] hover:shadow-[0_0_10px_rgba(95,122,242,0.4)]"
            >
              Log in
            </button>
            <button
              type="button"
              onClick={() => router.push("/signup")}
              className="rounded-full bg-[linear-gradient(105deg,#5F7AF2,#3C4DB0)] px-6 py-[0.55rem] text-sm font-bold text-white shadow-[0_6px_14px_rgba(47,67,170,0.3)] transition hover:-translate-y-0.5 hover:bg-[linear-gradient(105deg,#7289FF,#4F62CF)] hover:shadow-[0_10px_24px_rgba(95,122,242,0.5)]"
            >
              Sign Up
            </button>
          </div>
        </div>
      </header>

      <main className="relative z-[2]">
        <section className="relative overflow-hidden px-8 py-20">
          <img
            src="https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=1600&h=600&fit=crop"
            alt="Supply chain background"
            className="absolute inset-0 z-[1] h-full w-full object-cover opacity-25 brightness-[0.7] contrast-110"
          />
          <div className="relative z-[3] mx-auto max-w-[900px] text-center">
            <h1 className="text-[3.6rem] font-extrabold leading-[1.2] tracking-[-0.02em] text-transparent bg-[linear-gradient(135deg,#FFFFFF,#BFC9FF,#8A9CFF)] bg-clip-text">
              Real-Time Intelligence <br /> for{" "}
              <span className="text-[#8FA0FF] [text-shadow:0_0_10px_rgba(143,160,255,0.4)]">
                Modern Supply Chains
              </span>
            </h1>
            <p className="mx-auto mt-6 max-w-[620px] text-[1.2rem] leading-[1.5] text-[#C7D0FF]">
              Monitor shipments end-to-end, predict operational risk before it escalates, and optimize logistics with
              decision-ready AI insights.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-5">
              <button
                type="button"
                onClick={() => router.push("/signup")}
                className="rounded-full bg-[linear-gradient(105deg,#5F7AF2,#3C4DB0)] px-9 py-4 text-base font-bold text-white shadow-[0_6px_14px_rgba(47,67,170,0.3)] transition hover:-translate-y-0.5 hover:bg-[linear-gradient(105deg,#7289FF,#4F62CF)] hover:shadow-[0_10px_24px_rgba(95,122,242,0.5)]"
              >
                Get Started
              </button>
              <button
                type="button"
                onClick={() => setActiveModal("about")}
                className="rounded-full border-[1.5px] border-[#5F7AF2] bg-transparent px-9 py-4 text-base font-semibold text-[#EFF2FF] transition hover:-translate-y-0.5 hover:bg-[rgba(95,122,242,0.15)] hover:shadow-[0_0_10px_rgba(95,122,242,0.4)]"
              >
                Learn More
              </button>
            </div>
          </div>
        </section>

        <div className="relative z-[2] mx-auto max-w-[1280px] px-8">
          <section className="py-8">
            <SectionTitle>Connected Intelligence</SectionTitle>
            <div className="flex flex-wrap justify-center gap-8">
              {visionCards.map((card) => {
                const Icon = card.icon;

                return (
                  <article
                    key={card.title}
                    className="w-[320px] overflow-hidden rounded-[1.5rem] border border-[rgba(95,122,242,0.3)] bg-[rgba(18,18,42,0.6)] transition duration-300 hover:-translate-y-2 hover:border-[#5F7AF2] hover:shadow-[0_20px_35px_rgba(0,0,0,0.5)]"
                  >
                    <img src={card.image} alt={card.title} className="h-[220px] w-full object-cover" />
                    <div className="flex items-center justify-center gap-3 px-5 py-5 text-center font-semibold text-[#D0D8FF]">
                      <Icon className="h-5 w-5 text-[#99AAFF]" />
                      <span>{card.title}</span>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>

          <section className="py-8">
            <SectionTitle>Intelligence at every mile</SectionTitle>
            <div className="flex flex-wrap justify-center gap-7">
              {intelligenceCards.map((card) => {
                const Icon = card.icon;

                return (
                  <article
                    key={card.title}
                    className="min-w-[210px] flex-1 rounded-[1.8rem] border border-[rgba(95,122,242,0.35)] bg-[rgba(18,18,42,0.7)] px-6 py-7 text-center transition hover:-translate-y-1.5 hover:border-[#5F7AF2] hover:bg-[rgba(30,30,70,0.8)] hover:shadow-[0_18px_28px_-12px_rgba(0,0,0,0.5)]"
                  >
                    <Icon className="mx-auto mb-4 h-10 w-10 text-[#9CACFF]" />
                    <h3 className="text-[1.3rem] font-semibold">{card.title}</h3>
                    <p className="mt-2 text-[0.9rem] text-[#C2CAF5]">{card.description}</p>
                  </article>
                );
              })}
            </div>
          </section>

          <section className="py-8">
            <SectionTitle>Trusted across industries</SectionTitle>
            <div className="flex flex-wrap justify-center gap-4">
              {industryChips.map((chip) => {
                const Icon = chip.icon;

                return (
                  <div
                    key={chip.label}
                    className="inline-flex cursor-default items-center gap-3 rounded-[60px] border border-[rgba(100,125,230,0.4)] bg-[rgba(22,22,52,0.7)] px-7 py-3 text-[0.95rem] font-medium transition hover:scale-[1.03] hover:border-[#8A9CFF] hover:bg-[rgba(65,75,165,0.6)]"
                  >
                    <Icon className="h-5 w-5 text-[#99AAFF]" />
                    <span>{chip.label}</span>
                  </div>
                );
              })}
            </div>
          </section>

          <section className="py-8">
            <SectionTitle>AI-powered edge</SectionTitle>
            <div className="flex flex-wrap justify-center gap-7 rounded-[2rem] border border-[rgba(95,122,242,0.25)] bg-[rgba(12,12,32,0.55)] px-6 py-7">
              {aiFeatures.map((feature) => {
                const Icon = feature.icon;

                return (
                  <div
                    key={feature.label}
                    className="flex cursor-default items-center gap-3 rounded-[50px] bg-[rgba(20,20,50,0.5)] px-5 py-3 font-medium"
                  >
                    <Icon className="h-6 w-6 text-[#8496FF]" />
                    <span>{feature.label}</span>
                  </div>
                );
              })}
            </div>
          </section>

          <section className="py-8">
            <div className="overflow-hidden rounded-[2rem] border border-[rgba(95,122,242,0.5)] bg-[linear-gradient(135deg,rgba(35,40,90,0.3),rgba(8,8,20,0.9))] p-4">
              <button
                type="button"
                onClick={() => router.push("/dashboard")}
                className="block w-full"
                aria-label="Open dashboard preview"
              >
                <img
                  src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&h=500&fit=crop"
                  alt="Dashboard preview"
                  className="w-full rounded-[1.5rem] object-cover opacity-70 blur-[4px] transition hover:opacity-85 hover:blur-[2px]"
                />
              </button>
              <div className="mt-3 text-center text-[0.8rem] text-[#A1ADF0]">
                Live Command Center - Analytics Preview
              </div>
            </div>
          </section>

          <section className="my-16 rounded-[2.5rem] border border-[#5F7AF2] bg-[linear-gradient(125deg,rgba(25,25,65,0.65),rgba(10,10,35,0.7))] px-8 py-12 text-center backdrop-blur-[8px]">
            <h2 className="text-[2rem] font-bold">Start optimizing your supply chain today</h2>
            <p className="mx-auto mt-3 max-w-[460px] text-[#CFD6FF]">
              Join global leaders using predictive intelligence to stay ahead of disruptions.
            </p>
            <button
              type="button"
              onClick={() => router.push("/signup")}
              className="mt-8 rounded-full bg-[linear-gradient(105deg,#5F7AF2,#3C4DB0)] px-9 py-4 text-base font-bold text-white shadow-[0_6px_14px_rgba(47,67,170,0.3)] transition hover:-translate-y-0.5 hover:bg-[linear-gradient(105deg,#7289FF,#4F62CF)] hover:shadow-[0_10px_24px_rgba(95,122,242,0.5)]"
            >
              Create Account {"->"}
            </button>
          </section>
        </div>
      </main>

      <footer className="relative z-[2] mt-8 border-t border-[rgba(95,122,242,0.3)] px-8 py-8">
        <div className="mx-auto flex max-w-[1280px] flex-wrap items-center justify-between gap-4">
          <div className="flex gap-8">
            <button
              type="button"
              onClick={() => setActiveModal("about")}
              className="cursor-pointer text-[0.9rem] text-[#BCC5FF]"
            >
              About
            </button>
            <button
              type="button"
              onClick={() => setActiveModal("contact")}
              className="cursor-pointer text-[0.9rem] text-[#BCC5FF]"
            >
              Contact
            </button>
            <button
              type="button"
              onClick={() => setActiveModal("privacy")}
              className="cursor-pointer text-[0.9rem] text-[#BCC5FF]"
            >
              Privacy
            </button>
          </div>
          <div className="flex items-center gap-5 text-[#B8C2FF]">
            <a href="https://www.linkedin.com" target="_blank" rel="noreferrer" aria-label="LinkedIn">
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M4.98 3.5a2.49 2.49 0 1 0 0 4.98 2.49 2.49 0 0 0 0-4.98ZM3 8.98h3.96V21H3V8.98ZM9.46 8.98h3.8v1.64h.05c.53-1 1.83-2.05 3.77-2.05 4.03 0 4.77 2.65 4.77 6.09V21h-3.96v-5.62c0-1.34-.03-3.07-1.87-3.07-1.87 0-2.16 1.46-2.16 2.97V21H9.46V8.98Z" />
              </svg>
            </a>
            <a href="https://twitter.com" target="_blank" rel="noreferrer" aria-label="Twitter">
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M18.901 1.153h3.68l-8.041 9.19L24 22.847h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932 6.064-6.932Z" />
              </svg>
            </a>
            <a href="https://github.com" target="_blank" rel="noreferrer" aria-label="GitHub">
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M12 .5a12 12 0 0 0-3.79 23.39c.6.11.82-.26.82-.58v-2.04c-3.34.73-4.04-1.41-4.04-1.41-.55-1.38-1.33-1.75-1.33-1.75-1.09-.74.08-.72.08-.72 1.2.08 1.84 1.25 1.84 1.25 1.07 1.83 2.82 1.3 3.5 1 .11-.79.42-1.31.76-1.62-2.67-.31-5.48-1.35-5.48-6a4.7 4.7 0 0 1 1.24-3.27 4.37 4.37 0 0 1 .12-3.22s1.01-.33 3.3 1.25a11.4 11.4 0 0 1 6 0c2.29-1.58 3.3-1.25 3.3-1.25.44 1.08.49 2.27.12 3.22a4.68 4.68 0 0 1 1.24 3.27c0 4.66-2.82 5.69-5.5 6 .43.37.82 1.1.82 2.22v3.29c0 .32.21.7.82.58A12 12 0 0 0 12 .5Z" />
              </svg>
            </a>
          </div>
          <div className="text-[0.75rem] text-[#9DA7E6]">&copy; 2026 ChainGuard - AI supply chain intelligence</div>
        </div>
      </footer>

      <Modal type={activeModal} onClose={() => setActiveModal(null)} />
    </div>
  );
}
