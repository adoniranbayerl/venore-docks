import { createRequire } from "node:module";
import type { NextConfig } from "next";

// Plugins são pacotes npm `@venore/plugin-*` (docs/plugins-repos-separados-plano.md) publicados
// como TypeScript cru — o Next transpila via transpilePackages. Lista derivada das dependencies,
// sem nome de plugin hard-coded.
const hostPkg = createRequire(import.meta.url)("./package.json") as { dependencies?: Record<string, string> };
// Pacotes @venore/* (plugin e tema) são TS cru — o Next transpila. Os *-sdk são alias de tsconfig,
// não pacote, então ficam de fora.
const venorePackages = Object.keys(hostPkg.dependencies ?? {}).filter(
  (dep) => dep.startsWith("@venore/") && !dep.endsWith("-sdk"),
);

const nextConfig: NextConfig = {
  transpilePackages: venorePackages,
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
  async rewrites() {
    return [
      {
        // O navegador pede GET /favicon.ico na raiz por conta própria (aba, favoritos, histórico),
        // independente do <link rel="icon"> no <head>. Sem src/app/favicon.ico (removido pra não
        // travar a customização do admin), isso daria 404. Aqui aponta pro fallback de marca — o
        // <link> do metadata ainda manda pra aba quando há um favicon customizado.
        source: "/favicon.ico",
        destination: "/brand/favicon.ico",
      },
    ];
  },
};

export default nextConfig;
