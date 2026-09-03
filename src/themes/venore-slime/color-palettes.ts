import { generateHueRotationPalettes, THEME_HUE_PRESETS } from "../generate-hue-rotation-palettes";

// Catálogo gerado a partir dos tokens de hue de marca do theme.css deste tema (L e C
// preservados; só o hue gira). Ver src/themes/generate-hue-rotation-palettes.ts.
export const VENORE_SLIME_COLOR_PALETTES = generateHueRotationPalettes(
  {
    light: {
      primary: "oklch(0.78 0.185 152)",
      primaryForeground: "oklch(0.18 0.02 160)",
      accent: "oklch(0.9 0.205 102)",
      accentForeground: "oklch(0.17 0.018 158)",
      ring: "oklch(0.736 0.058 160)",
    },
    dark: {
      primary: "oklch(0.84 0.205 150)",
      primaryForeground: "oklch(0.17 0.018 158)",
      accent: "oklch(0.94 0.214 131)",
      accentForeground: "oklch(0.17 0.018 158)",
      ring: "oklch(0.458 0.056 156)",
    },
  },
  THEME_HUE_PRESETS,
);
