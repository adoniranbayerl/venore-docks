import type { MetadataRoute } from "next";
import { getBrandConfig } from "@/platform/brand/get-brand-config";

// Manifesto da PWA (rota /manifest.webmanifest). Dinâmico porque o nome vem de contexts/settings
// (getBrandConfig). Ícones são gerados por scripts/generate-pwa-icons.mjs.
//
// theme_color / background_color são "dica de chrome do SO" (tinta da status bar, fundo do splash
// antes do 1º paint), não parte do design system — ficam como constante aqui, escura pra combinar
// com o wordmark branco da marca. Se a identidade mudar, ajuste os dois + rode o script de ícones.
export const dynamic = "force-dynamic";

const CHROME_DARK = "#171717";

export default async function manifest(): Promise<MetadataRoute.Manifest> {
  const { siteName } = await getBrandConfig();

  return {
    name: siteName,
    // short_name é o rótulo curto embaixo do ícone; o SO trunca sozinho se não couber. Sem uma
    // forma curta dedicada em settings, repete o nome (melhor que inventar uma abreviação).
    short_name: siteName,
    description: siteName,
    lang: "pt-BR",
    dir: "ltr",
    id: "/",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: CHROME_DARK,
    theme_color: CHROME_DARK,
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
