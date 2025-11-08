import path from "path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Explicitly set turbopack.root to the project directory so Next.js
  // doesn't infer an incorrect workspace root when multiple lockfiles
  // are present on the machine.
  // Cast to any because the exported NextConfig type may not include the
  // turbopack experimental option in this environment's type definitions.
  experimental: ( {
    turbopack: {
      // Use the directory containing this config (project root)
      root: path.resolve(__dirname),
    },
  } as any ),
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "picsum.photos",
        port: "",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
