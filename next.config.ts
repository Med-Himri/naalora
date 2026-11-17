import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  images: {
    // Cloudinary does the resizing (f_auto,q_auto) — see src/lib/image-loader.ts
    loader: "custom",
    loaderFile: "./src/lib/image-loader.ts",
    remotePatterns: [{ protocol: "https", hostname: "res.cloudinary.com" }],
  },
  turbopack: {
    rules: {
      "*.css": { loaders: ["@tailwindcss/turbopack"], as: "*.css" },
    },
  },
  serverExternalPackages: ["mongoose", "cloudinary"],
  experimental: {
    globalNotFound: true,
  },
};

export default nextConfig;
