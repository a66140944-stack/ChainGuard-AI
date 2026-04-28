"use client";

import { Sparkles } from "lucide-react";

export default function AIFloatingButton({ onClick }) {
  return (
    <div className="group fixed bottom-6 right-6 z-40">
      <div className="pointer-events-none absolute bottom-full right-0 mb-3 whitespace-nowrap rounded-lg bg-slate-950 px-3 py-2 text-xs font-medium text-white opacity-0 shadow-lg transition duration-200 group-hover:opacity-100">
        Click here for AI Summary
      </div>
      <button
        type="button"
        onClick={onClick}
        className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-slate-950 text-white shadow-[0_18px_50px_rgba(15,23,42,0.24)] transition hover:-translate-y-0.5 hover:bg-slate-800"
        aria-label="Open AI summary"
      >
        <Sparkles className="h-5 w-5" />
      </button>
    </div>
  );
}
