import type { MetadataRoute } from "next";
import { site } from "@/lib/config";

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: `${site.name} – ${site.tagline}`,
    short_name: site.name,
    description: site.description,
    lang: "en-IN",
    start_url: "/",
    scope: "/",
    display: "standalone",
    display_override: ["standalone", "minimal-ui"],
    background_color: "#ffffff",
    theme_color: "#167208",
    categories: ["business", "lifestyle"],
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/maskable-192.png", sizes: "192x192", type: "image/png", purpose: "maskable" },
      { src: "/icons/maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml" },
    ],
    shortcuts: [
      { name: "Buy Land", url: "/buy-land", icons: [{ src: "/icons/icon-192.png", sizes: "192x192" }] },
      { name: "Sell Land", url: "/sell-land", icons: [{ src: "/icons/icon-192.png", sizes: "192x192" }] },
      { name: "Find Services", url: "/find-services", icons: [{ src: "/icons/icon-192.png", sizes: "192x192" }] },
    ],
  };
}
