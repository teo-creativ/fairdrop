/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      "@coinbase/cdp-sdk": false,
      "@base-org/account": false,
    };
    return config;
  },
};

module.exports = nextConfig;