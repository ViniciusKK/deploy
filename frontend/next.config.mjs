/** @type {import('next').NextConfig} */
const apiBase = process.env.API_BASE ?? 'http://localhost:3000';

const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${apiBase}/:path*`,
      },
    ];
  },
};

export default nextConfig;
