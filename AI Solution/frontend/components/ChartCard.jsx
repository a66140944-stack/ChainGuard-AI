export default function ChartCard({ title, subtitle, children }) {
  return (
    <section className="rounded-[28px] border border-white/10 bg-surface p-5 shadow-xl shadow-slate-950/5 backdrop-blur-xl">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-base font-semibold">{title}</h2>
          {subtitle ? <p className="mt-1 text-sm text-muted">{subtitle}</p> : null}
        </div>
        <button
          type="button"
          className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/50 text-sm text-muted transition hover:text-foreground dark:bg-white/5"
        >
          ...
        </button>
      </div>
      {children}
    </section>
  );
}
