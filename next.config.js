/** @type {import('next').NextConfig} */
const nextConfig = {
  // 生产环境启用 sourcemap 支持
  productionBrowserSourceMaps: true,
  
  // 开发环境的experimental配置
  experimental: {
    // 启用更好的调试支持
    forceSwcTransforms: false,
  },
  
  serverExternalPackages: ['better-sqlite3'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'avatars.akamai.steamstatic.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'avatars.steamstatic.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'steamcommunity-a.akamaihd.net',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'steamcdn-a.akamaihd.net',
        port: '',
        pathname: '/**',
      }
    ]
  }
}

module.exports = nextConfig