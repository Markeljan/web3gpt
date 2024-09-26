/** @type {import('next').NextConfig} */

module.exports = {
  webpack: (config) => {
    config.externals.push("pino-pretty", "lokijs", "encoding")
    return config
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**"
      }
    ]
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "Content-Security-Policy",
            value: "frame-ancestors 'self' https://app.safe.global https://*.blockscout.com;"
          },
          {
            key: "Access-Control-Allow-Origin",
            value: "*"
          },
          {
            key: "Access-Control-Allow-Methods",
            value: "GET, OPTIONS"
          },
          {
            key: "Access-Control-Allow-Headers",
            value: "X-Requested-With, content-type, Authorization"
          }
        ]
      }
    ]
  },
}


