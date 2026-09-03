import type { ThemeManifest } from "@/contexts/themes/contracts/types";

export const venoreSlimeManifest: ThemeManifest = {
  key: "venore-slime",
  name: "Venore Slime",
  version: "0.1.0",
  themeContractVersion: "6.0.0",
  // T2 (docs/implementation-roadmap.md — Fase 5): mesmos valores que eram o default global de
  // contexts/settings antes da migração — preserva o visual atual até alguém customizar por tema.
  brandAesthetics: { mode: "svg", size: 100, scrolledSize: 80, position: "left", color: "#143b52" },
  colorModes: ["light", "dark"],
};
