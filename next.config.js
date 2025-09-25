/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
  typescript: {
    // During development, we'll handle TypeScript errors manually
    ignoreBuildErrors: false,
  },
  eslint: {
    // During development, we'll handle ESLint errors manually
    ignoreDuringBuilds: false,
  },
}

module.exports = nextConfig