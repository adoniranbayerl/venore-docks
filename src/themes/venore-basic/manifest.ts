import type { ThemeManifest } from "@/contexts/themes/contracts/types";

// Segundo tema, mínimo e deliberadamente feio — só existe para provar que trocar o tema ativo
// troca a shell (docs/themes/shell-contract.md, Fase 2). Não é um tema "de produto".
export const venoreBasicManifest: ThemeManifest = {
  key: "venore-basic",
  name: "Venore Basic (prova de conceito)",
  version: "0.1.0",
  themeContractVersion: "6.0.0",
  // T2 (docs/implementation-roadmap.md — Fase 5): mesmos valores que eram o default global de
  // contexts/settings antes da migração — preserva o visual atual até alguém customizar por tema.
  brandAesthetics: { mode: "svg", size: 100, scrolledSize: 80, position: "left", color: "#143b52" },
};
