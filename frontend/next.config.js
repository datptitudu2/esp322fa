/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Không cần env object nữa, Next.js tự động load từ .env.local
  // env: {
  //   NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
  //   NEXT_PUBLIC_WOKWI_URL: process.env.NEXT_PUBLIC_WOKWI_URL || '',
  // },
}

module.exports = nextConfig

