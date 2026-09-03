import { generateHueRotationPalettes, THEME_HUE_PRESETS } from "../generate-hue-rotation-palettes";

// Catálogo gerado a partir dos tokens de hue de marca do theme.css deste tema (L e C
// preservados; só o hue gira). Ver src/themes/generate-hue-rotation-palettes.ts.
export const VENORE_NIGHTCITY_COLOR_PALETTES = generateHueRotationPalettes(
  {
    light: {
      primary: "oklch(0.56 0.16 196)",
      primaryForeground: "oklch(0.98 0.01 196)",
      accent: "oklch(0.6 0.24 340)",
      accentForeground: "oklch(0.98 0.02 340)",
      ring: "oklch(0.56 0.16 196)",
    },
    dark: {
      primary: "oklch(0.85 0.16 196)",
      primaryForeground: "oklch(0.09 0.024 280)",
      accent: "oklch(0.73 0.25 340)",
      accentForeground: "oklch(0.09 0.024 340)",
      ring: "oklch(0.85 0.16 196)",
    },
  },
  THEME_HUE_PRESETS,
);
