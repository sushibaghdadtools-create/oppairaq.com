import type { MetadataRoute } from "next";
import { SERVICES } from "@/content/services";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://oppa.example";
  return [
    { url: base, priority: 1 },
    { url: `${base}/services`, priority: 0.8 },
    { url: `${base}/contact`, priority: 0.8 },
    ...SERVICES.map((s) => ({ url: `${base}/services/${s.slug}`, priority: 0.7 })),
  ];
}
