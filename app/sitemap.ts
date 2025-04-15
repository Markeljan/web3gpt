import type { MetadataRoute } from "next"

import { DEPLOYMENT_URL } from "@/lib/config"

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: DEPLOYMENT_URL,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 1,
    },
  ]
}
