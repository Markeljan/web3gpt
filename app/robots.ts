import type { MetadataRoute } from "next"

import { APP_URL } from "@/lib/config"

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      disallow: ["/api/", "/_next/", "/private/"],
      userAgent: "*",
      allow: "/",
    },
    sitemap: `${APP_URL}/sitemap.xml`,
    host: APP_URL,
  }
}
