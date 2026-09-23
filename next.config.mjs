/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: { bodySizeLimit: '8mb' },
    serverComponentsExternalPackages: ['tesseract.js'],
  },
};
export default nextConfig;
