/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com'
      }
    ]
  },
  async headers() {
    return [
      {
        source: '/api/deploy-contract',
        headers: req => {
          const allowedOrigins = [
            'http://localhost:3000',
            'https://agentswithbenefits.xyz'
          ]
          const origin = req.headers.origin
          if (allowedOrigins.includes(origin)) {
            return [
              { key: 'Access-Control-Allow-Origin', value: origin },
              {
                key: 'Access-Control-Allow-Methods',
                value: 'POST, PUT, OPTIONS'
              },
              {
                key: 'Access-Control-Allow-Headers',
                value: 'Content-Type, Authorization'
              }
            ]
          }
        }
      }
    ]
  }
}

module.exports = nextConfig
