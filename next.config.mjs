/** @type {import('next').NextConfig} */
const nextConfig = {
  // Environment configuration for local development
  env: {
    PORT: process.env.PORT || '3000',
  },
  // Enable experimental features if needed
  experimental: {
    // Add any experimental features here
  },
};

export default nextConfig; 