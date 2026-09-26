import type { NextConfig } from 'next';

/** GitHub Pages（https://kuronekotaiwan-matsuri.github.io/y2027/）向けの静的エクスポート設定 */
const nextConfig: NextConfig = {
  output: 'export',
  basePath: '/y2027',
  assetPrefix: '/y2027',
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
