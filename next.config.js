/** @type {import('next').NextConfig} */
// Retired 17 October 2026. The quiz now lives on theenergeticedge.com; this app only forwards old links.
const nextConfig = {
  reactStrictMode: true,
  async redirects() {
    return [
      { source: '/guide', destination: 'https://guide.theenergeticedge.com/', permanent: true },
      { source: '/guide/:path*', destination: 'https://guide.theenergeticedge.com/', permanent: true },
      { source: '/call', destination: 'https://call.theenergeticedge.com/', permanent: true },
      { source: '/call/:path*', destination: 'https://call.theenergeticedge.com/', permanent: true },
      { source: '/', destination: 'https://quiz.theenergeticedge.com/', permanent: true },
      { source: '/:path*', destination: 'https://quiz.theenergeticedge.com/', permanent: true },
      ];
  },
};

module.exports = nextConfig;
