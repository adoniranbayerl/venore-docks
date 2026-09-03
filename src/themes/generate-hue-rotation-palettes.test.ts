import { describe, expect, it } from "vitest";
import { generateHueRotationPalettes, THEME_HUE_PRESETS } from "./generate-hue-rotation-palettes";

const base = {
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
};

describe("generateHueRotationPalettes", () => {
  it("preserva L e C da base e troca só o hue", () => {
    const [oceano] = generateHueRotationPalettes(base, [
      { id: "oceano", name: "Oceano", primaryHue: 245, accentHue: 210 },
    ]);

    expect(oceano.light.primary).toBe("oklch(0.78 0.185 245)");
    expect(oceano.light.accent).toBe("oklch(0.9 0.205 210)");
    expect(oceano.light.ring).toBe("oklch(0.736 0.058 245)"); // ring segue o hue de primary
    expect(oceano.dark.primary).toBe("oklch(0.84 0.205 245)");
  });

  it("gera uma paleta por preset, com os ids/nomes do preset", () => {
    const palettes = generateHueRotationPalettes(base, THEME_HUE_PRESETS);
    expect(palettes.map((p) => p.id)).toEqual(THEME_HUE_PRESETS.map((p) => p.id));
  });

  it("devolve o valor original se não for oklch (não quebra o catálogo)", () => {
    const [p] = generateHueRotationPalettes(
      { light: { ...base.light, primary: "#3366cc" }, dark: base.dark },
      [{ id: "x", name: "X", primaryHue: 10, accentHue: 20 }],
    );
    expect(p.light.primary).toBe("#3366cc");
  });
});
