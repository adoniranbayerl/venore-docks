import { generateHueRotationPalettes, THEME_HUE_PRESETS } from "../generate-hue-rotation-palettes";

// Catálogo gerado a partir dos tokens de hue de marca do theme.css deste tema (L e C
// preservados; só o hue gira). Ver src/themes/generate-hue-rotation-palettes.ts.
export const APRENDA_MUSICA_COLOR_PALETTES = generateHueRotationPalettes(
  {
    light: {
      primary: "oklch(0.72 0.19 55)",
      primaryForeground: "oklch(0.17 0.02 55)",
      accent: "oklch(0.62 0.14 305)",
      accentForeground: "oklch(0.98 0.01 305)",
      ring: "oklch(0.62 0.14 305)",
    },
    dark: {
      primary: "oklch(0.78 0.19 55)",
      primaryForeground: "oklch(0.18 0.02 55)",
      accent: "oklch(0.72 0.16 305)",
      accentForeground: "oklch(0.17 0.02 305)",
      ring: "oklch(0.55 0.14 305)",
    },
  },
  THEME_HUE_PRESETS,
);
