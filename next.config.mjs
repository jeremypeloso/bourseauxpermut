/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: { serverActions: { bodySizeLimit: '8mb' } },
  serverExternalPackages: ['tesseract.js'],
};
export default nextConfig;
