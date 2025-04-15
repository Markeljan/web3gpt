import type { MetadataRoute } from "next"

import { DEPLOYMENT_URL } from "@/lib/config"

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      disallow: ["/api/", "/_next/", "/private/"],
      userAgent: "*",
      allow: "/",
    },
    sitemap: `${DEPLOYMENT_URL}/sitemap.xml`,
    host: DEPLOYMENT_URL,
  }
}
