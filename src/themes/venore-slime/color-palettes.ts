import type { ColorPalette } from "@/contexts/themes/contracts/types";

// Catálogo do Venore Slime — T3, fundação (docs/implementation-roadmap.md — Fase 5): só seleção
// entre presets pré-definidos em código, ainda sem UI de criar/editar paleta arbitrária (fica
// pra uma sessão seguinte). Cada preset sobrescreve só primary/accent (+ -foreground/ring), os
// tokens de "hue de marca" de theme.css — background/card/muted/border continuam vindo do
// theme.css do tema ativo, nunca de uma paleta. Valores em oklch, mesma faixa de L/C dos
// originais (docs/venore-docks.md — "Venore Slime" theme.css) pra manter contraste equivalente
// com -foreground; hue é o único eixo que muda entre presets.
export const VENORE_SLIME_COLOR_PALETTES: ColorPalette[] = [
  {
    id: "oceano",
    name: "Oceano",
    light: {
      primary: "oklch(0.72 0.16 250)",
      "primary-foreground": "oklch(0.98 0.01 250)",
      accent: "oklch(0.88 0.12 210)",
      "accent-foreground": "oklch(0.17 0.02 210)",
      ring: "oklch(0.65 0.09 245)",
    },
    dark: {
      primary: "oklch(0.78 0.17 250)",
      "primary-foreground": "oklch(0.17 0.02 250)",
      accent: "oklch(0.82 0.13 205)",
      "accent-foreground": "oklch(0.17 0.02 205)",
      ring: "oklch(0.5 0.08 245)",
    },
  },
  {
    id: "ametista",
    name: "Ametista",
    light: {
      primary: "oklch(0.68 0.19 320)",
      "primary-foreground": "oklch(0.98 0.02 320)",
      accent: "oklch(0.86 0.15 300)",
      "accent-foreground": "oklch(0.18 0.02 300)",
      ring: "oklch(0.6 0.1 315)",
    },
    dark: {
      primary: "oklch(0.76 0.2 320)",
      "primary-foreground": "oklch(0.17 0.02 320)",
      accent: "oklch(0.78 0.16 300)",
      "accent-foreground": "oklch(0.17 0.02 300)",
      ring: "oklch(0.48 0.09 315)",
    },
  },
];
