import { generateHueRotationPalettes, THEME_HUE_PRESETS } from "../generate-hue-rotation-palettes";

// Catálogo gerado a partir dos tokens de hue de marca do theme.css deste tema (L e C
// preservados; só o hue gira). Ver src/themes/generate-hue-rotation-palettes.ts.
export const VENORE_FROST_COLOR_PALETTES = generateHueRotationPalettes(
  {
    light: {
      primary: "oklch(0.18 0.02 240)",
      primaryForeground: "oklch(0.97 0.008 230)",
      accent: "oklch(0.82 0.09 220)",
      accentForeground: "oklch(0.16 0.03 230)",
      ring: "oklch(0.82 0.09 220)",
    },
    dark: {
      primary: "oklch(0.95 0.01 225)",
      primaryForeground: "oklch(0.13 0.018 245)",
      accent: "oklch(0.8 0.1 215)",
      accentForeground: "oklch(0.13 0.03 220)",
      ring: "oklch(0.8 0.1 215)",
    },
  },
  THEME_HUE_PRESETS,
);
