export default function Footer() {
  return (
    <footer id="footer" className="border-t border-white/10 bg-background/35 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-10 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold">ChainGuard</p>
          <p className="mt-1 text-sm text-muted">Real-time intelligence for modern supply chains.</p>
        </div>
        <div className="flex items-center gap-4 text-sm text-muted">
          <span>Tracking</span>
          <span>AI Analysis</span>
          <span>IoT Telemetry</span>
        </div>
      </div>
    </footer>
  );
}
