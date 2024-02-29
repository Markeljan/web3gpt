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
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: 'http://localhost:3000, https://agentswithbenefits.xyz'
          },
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
    ]
  }
}

module.exports = nextConfig
