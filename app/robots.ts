import type { MetadataRoute } from "next"
import { APP_URL } from "@/lib/config"

export default function robots(): MetadataRoute.Robots {
  return {
    host: APP_URL,
    rules: {
      allow: "/",
      disallow: ["/api/", "/_next/", "/private/"],
      userAgent: "*",
    },
    sitemap: `${APP_URL}/sitemap.xml`,
  }
}
