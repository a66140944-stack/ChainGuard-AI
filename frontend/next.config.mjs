import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Prevent Next from trying to trace files from an inferred workspace root that
  // is outside this repo folder (which can trigger EPERM on Windows/sandboxes).
  outputFileTracingRoot: __dirname,
};

export default nextConfig;
