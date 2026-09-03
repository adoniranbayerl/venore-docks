import { generateHueRotationPalettes, THEME_HUE_PRESETS } from "../generate-hue-rotation-palettes";

// Catálogo gerado a partir dos tokens de hue de marca do theme.css deste tema (L e C
// preservados; só o hue gira). Ver src/themes/generate-hue-rotation-palettes.ts.
export const VENORE_KAZORDOON_COLOR_PALETTES = generateHueRotationPalettes(
  {
    light: {
      primary: "oklch(0.2 0.006 75)",
      primaryForeground: "oklch(0.99 0.002 90)",
      accent: "oklch(0.77 0.15 70)",
      accentForeground: "oklch(0.2 0.04 60)",
      ring: "oklch(0.77 0.15 70)",
    },
    dark: {
      primary: "oklch(0.96 0.003 80)",
      primaryForeground: "oklch(0.17 0.006 75)",
      accent: "oklch(0.75 0.16 68)",
      accentForeground: "oklch(0.15 0.03 60)",
      ring: "oklch(0.75 0.16 68)",
    },
  },
  THEME_HUE_PRESETS,
);
