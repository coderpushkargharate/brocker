import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // lets a production build be made/tested next to a running `next dev` (which owns .next)
  distDir: process.env.NEXT_DIST_DIR || ".next",
  // always put <title>/<meta> in <head> (Next 15 otherwise streams them into <body> for most user agents,
  // which some crawlers and link-preview bots don't read)
  htmlLimitedBots: /.*/,
  experimental: {
    // land photos, video and documents are uploaded through server actions
    serverActions: { bodySizeLimit: "80mb" },
  },
  images: {
    formats: ["image/avif", "image/webp"],
  },
  poweredByHeader: false,
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), payment=(), usb=(), geolocation=(self)" },
          // no script-src yet (Next.js inline scripts would need nonces); these directives still block clickjacking,
          // plugin content and <base>/form hijacking
          { key: "Content-Security-Policy", value: "frame-ancestors 'self'; base-uri 'self'; object-src 'none'; form-action 'self'" },
        ],
      },
      {
        // the service worker must always be re-checked so updates reach installed apps
        source: "/sw.js",
        headers: [
          { key: "Cache-Control", value: "no-cache, no-store, must-revalidate" },
          { key: "Service-Worker-Allowed", value: "/" },
        ],
      },
    ];
  },
};

export default nextConfig;
