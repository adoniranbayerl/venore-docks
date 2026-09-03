import { generateHueRotationPalettes, THEME_HUE_PRESETS } from "../generate-hue-rotation-palettes";

// Catálogo gerado a partir dos tokens de hue de marca do theme.css deste tema (L e C
// preservados; só o hue gira). Ver src/themes/generate-hue-rotation-palettes.ts.
export const MENONITA_CLASSIC_COLOR_PALETTES = generateHueRotationPalettes(
  {
    light: {
      primary: "oklch(0.52 0.099 210.2)",
      primaryForeground: "oklch(0.973 0.01 219.6)",
      accent: "oklch(0.752 0.096 205.7)",
      accentForeground: "oklch(0.215 0.027 225.7)",
      ring: "oklch(0.52 0.099 210.2)",
    },
    dark: {
      primary: "oklch(0.752 0.096 205.7)",
      primaryForeground: "oklch(0.215 0.027 225.7)",
      accent: "oklch(0.52 0.099 210.2)",
      accentForeground: "oklch(0.973 0.01 219.6)",
      ring: "oklch(0.52 0.099 210.2)",
    },
  },
  THEME_HUE_PRESETS,
);
