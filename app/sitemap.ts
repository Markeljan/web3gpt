import type { MetadataRoute } from "next"
import { APP_URL } from "@/lib/config"

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      changeFrequency: "monthly",
      lastModified: new Date(),
      priority: 1,
      url: APP_URL,
    },
  ]
}
