import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The home directory also has a package-lock.json; pin file tracing here so
  // Next.js resolves this project as the workspace root.
  outputFileTracingRoot: __dirname,
};

export default nextConfig;
