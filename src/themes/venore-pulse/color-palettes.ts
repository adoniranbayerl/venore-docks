import { generateHueRotationPalettes, THEME_HUE_PRESETS } from "../generate-hue-rotation-palettes";

// Catálogo gerado a partir dos tokens de hue de marca do theme.css deste tema (L e C
// preservados; só o hue gira). Ver src/themes/generate-hue-rotation-palettes.ts.
export const VENORE_PULSE_COLOR_PALETTES = generateHueRotationPalettes(
  {
    light: {
      primary: "oklch(0.22 0.016 260)",
      primaryForeground: "oklch(0.985 0.004 250)",
      accent: "oklch(0.8 0.22 132)",
      accentForeground: "oklch(0.2 0.05 132)",
      ring: "oklch(0.8 0.22 132)",
    },
    dark: {
      primary: "oklch(0.94 0.008 250)",
      primaryForeground: "oklch(0.19 0.014 258)",
      accent: "oklch(0.82 0.22 132)",
      accentForeground: "oklch(0.16 0.04 132)",
      ring: "oklch(0.82 0.22 132)",
    },
  },
  THEME_HUE_PRESETS,
);
