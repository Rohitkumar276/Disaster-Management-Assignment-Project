/** @type {import('next').NextConfig} */
const nextConfig = {
  // Ensure proper port binding for Railway
  env: {
    PORT: process.env.PORT || '3000',
  },
};

export default nextConfig; 