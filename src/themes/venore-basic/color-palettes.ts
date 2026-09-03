import { generateHueRotationPalettes, THEME_HUE_PRESETS } from "../generate-hue-rotation-palettes";

// Catálogo gerado a partir dos tokens de hue de marca do theme.css deste tema (L e C
// preservados; só o hue gira). Ver src/themes/generate-hue-rotation-palettes.ts.
export const VENORE_BASIC_COLOR_PALETTES = generateHueRotationPalettes(
  {
    light: {
      primary: "oklch(0.4 0.15 260)",
      primaryForeground: "oklch(0.98 0 0)",
      accent: "oklch(0.85 0.05 260)",
      accentForeground: "oklch(0.18 0 0)",
      ring: "oklch(0.4 0.15 260)",
    },
    dark: {
      primary: "oklch(0.75 0.13 260)",
      primaryForeground: "oklch(0.16 0 0)",
      accent: "oklch(0.35 0.06 260)",
      accentForeground: "oklch(0.95 0 0)",
      ring: "oklch(0.75 0.13 260)",
    },
  },
  THEME_HUE_PRESETS,
);
