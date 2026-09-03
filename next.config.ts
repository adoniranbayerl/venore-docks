import { createRequire } from "node:module";
import type { NextConfig } from "next";

// Plugins são pacotes npm `@venore/plugin-*` (docs/plugins-repos-separados-plano.md) publicados
// como TypeScript cru — o Next transpila via transpilePackages. Lista derivada das dependencies,
// sem nome de plugin hard-coded.
const hostPkg = createRequire(import.meta.url)("./package.json") as { dependencies?: Record<string, string> };
const pluginPackages = Object.keys(hostPkg.dependencies ?? {}).filter(
  (dep) => dep.startsWith("@venore/plugin-") && dep !== "@venore/plugin-sdk",
);

const nextConfig: NextConfig = {
  transpilePackages: pluginPackages,
  allowedDevOrigins: ["192.168.6.8"],
  experimental: {
    serverActions: {
      bodySizeLimit: "10mb",
    },
  },
  async headers() {
    return [
      {
        // Service worker da PWA (public/sw.js): nunca cacheado pelo navegador (senão uma versão
        // nova nunca chega) e pode controlar todo o site.
        source: "/sw.js",
        headers: [
          { key: "Content-Type", value: "application/javascript; charset=utf-8" },
          { key: "Cache-Control", value: "no-cache, no-store, must-revalidate" },
          { key: "Service-Worker-Allowed", value: "/" },
        ],
      },
    ];
  },
};

export default nextConfig;
