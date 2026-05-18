import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  basePath: process.env.GITHUB_PAGES === "true" ? "/learning.app" : undefined,
  assetPrefix: process.env.GITHUB_PAGES === "true" ? "/learning.app/" : undefined,
  turbopack: {
    root: path.join(__dirname),
  },
};

export default nextConfig;
