/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  experimental: {
    serverActions: true,
    serverActionsBodySizeLimit: "100mb"
  }
}

module.exports = nextConfig