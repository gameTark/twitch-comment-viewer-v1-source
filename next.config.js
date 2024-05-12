const path = require("node:path");
const { NextPublicTsPlugin } = require("next-public-ts");
const isProd = process.env.NODE_ENV == "production";
const SUB_DIRECTORY = "/twitch-comment-viewer-v1-frontend";
/**
 * @format
 * @type {import('next').NextConfig}
 */
const nextConfig = {
  output: "export",
  basePath: isProd ? SUB_DIRECTORY : "",
  assetPrefix: isProd ? SUB_DIRECTORY : "",
  publicRuntimeConfig: {
    basePath: isProd ? SUB_DIRECTORY : "",
  },
  reactStrictMode: true, // <= trueからfalseに！！
  experimental: {
    clientRouterFilter: false,
  },
  webpack(config, context) {
    config.plugins.push(
      new NextPublicTsPlugin({
        inputDir: path.join("src", "+public"),
        outputDir: path.join("public"),
        autoDetect: true,
      }),
    );
    return config;
  },
};

module.exports = nextConfig;
