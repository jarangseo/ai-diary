import type { NextConfig } from "next";

// Ensure origin has protocol
const getOrigin = () => {
  const url = process.env.FRONTEND_URL || 'http://localhost:5173'
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url
  }
  return `https://${url}`
}

const nextConfig: NextConfig = {
  async headers() {
    const origin = getOrigin()
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: origin },
          { key: 'Access-Control-Allow-Methods', value: 'GET, POST, PUT, DELETE, OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type, Authorization, Cookie' },
          { key: 'Access-Control-Allow-Credentials', value: 'true' },
        ],
      },
    ]
  },
};

export default nextConfig;
