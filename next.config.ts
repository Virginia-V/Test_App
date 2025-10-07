import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "pub-c83f1ba2cc05448bb87021240670356e.r2.dev",
        port: "",
        pathname: "/**"
      },
      {
        protocol: "https",
        hostname: "pub-ad375fec02084613b3e47524e6061297.r2.dev",
        port: "",
        pathname: "/**"
      }
    ]
  }
};

export default withNextIntl(nextConfig);
