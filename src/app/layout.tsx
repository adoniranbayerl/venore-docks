import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "next-themes";
import { Toaster } from "@/components/ui/sonner";
import { ServiceWorkerRegistrar } from "@/components/pwa/service-worker-registrar";
import { InstallPrompt } from "@/components/pwa/install-prompt";
import { getBrandConfig } from "@/platform/brand/get-brand-config";
import { resolveActiveTheme } from "@/platform/theme-rendering/resolve-active-theme";
import { resolveActiveColorPalette, buildColorPaletteOverrideCss } from "@/platform/theme-rendering/resolve-active-color-palette";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export async function generateMetadata(): Promise<Metadata> {
  const { siteName, faviconUrl } = await getBrandConfig();

  return {
    title: "Venore Docks",
    description: "Painel administrativo e área do aluno da Venore Docks.",
    manifest: "/manifest.webmanifest",
    appleWebApp: { capable: true, statusBarStyle: "black-translucent", title: siteName },
    icons: {
      icon: faviconUrl,
      shortcut: faviconUrl,
      apple: "/icons/apple-touch-icon.png",
    },
  };
}

// themeColor no viewport (não no metadata) — mudou de lugar no App Router. Escuro, combinando com
// o wordmark branco da marca; mesmo valor de app/manifest.ts (CHROME_DARK).
// viewportFit: "cover" habilita as env(safe-area-inset-*) em telas com notch/ilha (modo standalone).
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#171717",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [{ manifest }, activeColorPalette] = await Promise.all([resolveActiveTheme(), resolveActiveColorPalette()]);
  // `activeColorPalette` vem do catálogo em código de cada tema (src/themes/venore-slime/color-
  // palettes.ts) OU, quando paletteId === "custom", de cor digitada pelo admin (platform/theme-
  // engine/custom-color-palette.ts). dangerouslySetInnerHTML só continua seguro aqui porque esse
  // segundo caminho valida cada valor contra /^#[0-9a-f]{6}$/i antes de persistir — nunca chega
  // texto livre não sanitizado nesta interpolação.
  const paletteOverrideCss = activeColorPalette ? buildColorPaletteOverrideCss(manifest.key, activeColorPalette) : null;

  // Tema single-mode (manifest.colorModes com um só valor): força esse modo no next-themes —
  // não há "outro" pra alternar. `forcedTheme` desabilita a troca; o ColorModeToggle lê isso e
  // some. Tema bimodal (o caso atual de todos): forcedColorMode fica undefined e nada muda.
  const forcedColorMode = manifest.colorModes.length === 1 ? manifest.colorModes[0] : undefined;

  return (
    <html
      lang="pt-BR"
      data-theme={manifest.key}
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">
        {/* <style> em qualquer posição do body ainda aplica globalmente ao documento (não é
            escopado pela posição no DOM) — evita depender de suporte a <head> customizado em
            root layout do App Router (mesmo padrão de ChartStyle, src/components/ui/chart.tsx). */}
        {paletteOverrideCss && <style id="color-palette-override" dangerouslySetInnerHTML={{ __html: paletteOverrideCss }} />}
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem forcedTheme={forcedColorMode}>
          {children}
          <Toaster />
          <ServiceWorkerRegistrar />
          <InstallPrompt />
        </ThemeProvider>
      </body>
    </html>
  );
}
