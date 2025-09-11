/** @type {import('next').NextConfig} */
const { createContentlayerPlugin } = require('next-contentlayer2')

const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  experimental: {
    appDir: true,
  },
  images: {
    domains: ['cdn.builder.io'],
  },
  env: {
    // Make environment variables available to the application
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
  },
  // Ensure environment variables are available in server components
  serverRuntimeConfig: {
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
  },
}

const withContentlayer = createContentlayerPlugin({
  // Additional Contentlayer config options
})

const withNextIntl = require('next-intl/plugin')('./src/i18n')

module.exports = withNextIntl(withContentlayer(nextConfig))
