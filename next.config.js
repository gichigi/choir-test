/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ["placeholder.com", "via.placeholder.com"],
  },
  // Ensure environment variables are properly exposed
  env: {
    // Add any public environment variables here
  },
}

module.exports = nextConfig
