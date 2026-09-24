/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: { bodySizeLimit: '8mb' },
    serverComponentsExternalPackages: ['tesseract.js', 'tesseract.js-core'],
    // Vercel n'embarque que ce qu'il détecte statiquement : le worker et le moteur wasm de Tesseract sont chargés dynamiquement
    outputFileTracingIncludes: {
      '/api/verify/card': ['./node_modules/tesseract.js/**', './node_modules/tesseract.js-core/**'],
    },
  },
};
export default nextConfig;
