import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  turbopack: {
    resolveAlias: {
      "@x402/core/client": "./lib/empty-shim.js",
      "@x402/core": "./lib/empty-shim.js",
      "@x402/evm/exact/client": "./lib/empty-shim.js",
      "@x402/evm/upto/client": "./lib/empty-shim.js",
      "@x402/evm": "./lib/empty-shim.js",
      "@x402/svm/exact/client": "./lib/empty-shim.js",
      "@x402/svm": "./lib/empty-shim.js",
      "@x402/extensions": "./lib/empty-shim.js",
    },
  },
  webpack: (config) => {
    config.resolve = config.resolve || {};
    const shim = path.resolve(__dirname, "lib/empty-shim.js");
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      "@x402/core/client": shim,
      "@x402/core": shim,
      "@x402/evm/exact/client": shim,
      "@x402/evm/upto/client": shim,
      "@x402/evm": shim,
      "@x402/svm/exact/client": shim,
      "@x402/svm": shim,
      "@x402/extensions": shim,
    };
    return config;
  },
};

export default nextConfig;
