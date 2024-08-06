/** @type {import('next').NextConfig} */
module.exports = {
  webpack: (config, context) => {
    if (config.plugins) {
      config.plugins.push(
        new context.webpack.IgnorePlugin({
          resourceRegExp: /^(lokijs|pino-pretty|encoding)$/
        })
      )
    }
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
      },
      {
        source: "/api/external-deploy",
        headers: [
          {
            key: "Access-Control-Allow-Origin",
            value: "*"
          },
          {
            key: "Access-Control-Allow-Methods",
            value: "POST, PUT, OPTIONS"
          },
          {
            key: "Access-Control-Allow-Headers",
            value: "Content-Type, Authorization, web3gpt-api-key"
          }
        ]
      }
    ]
  }
}
