import { getActiveColorPalette, type ColorPalette } from "@/contexts/themes";
import { resolveActiveTheme } from "@/platform/theme-rendering/resolve-active-theme";
import { getCustomColorPalette } from "./custom-color-palette";

export type ColorPaletteStateView = ColorPalette & { isActive: boolean };

// Composição pra seção "Paleta de cor" de /admin/themes (T3 — docs/implementation-roadmap.md
// Fase 5): junta o catálogo do TEMA ATIVO (THEME_REGISTRY, via resolveActiveTheme) com o
// paletteId salvo (contexts/themes). Só o tema ativo é relevante aqui — o catálogo de um tema
// não-ativo não pode ser aplicado (nunca vira CSS de verdade), então nem faz sentido listar.
// "default" (nenhuma paleta ativada — usar theme.css como está) é sempre o primeiro item, mesmo
// quando o catálogo do tema está vazio.
export async function listColorPaletteStates(): Promise<{ themeName: string; palettes: ColorPaletteStateView[] }> {
  const [{ manifest, colorPalettes }, activePaletteResult] = await Promise.all([
    resolveActiveTheme(),
    getActiveColorPalette(),
  ]);
  const customPalette = await getCustomColorPalette(manifest.key);

  const activePaletteId = activePaletteResult.success ? activePaletteResult.data.paletteId : "default";

  const defaultEntry: ColorPaletteStateView = {
    id: "default",
    name: "Padrão do tema",
    light: {},
    dark: {},
    isActive: activePaletteId === "default",
  };

  // "Personalizada" sempre aparece na lista (mesmo sem cor salva ainda) — é a entrada que leva
  // pro formulário de edição em /admin/themes, além de poder ser ativada como qualquer outra.
  const customEntry: ColorPaletteStateView = { ...customPalette, isActive: activePaletteId === customPalette.id };

  const palettes = [
    defaultEntry,
    ...colorPalettes.map((palette) => ({ ...palette, isActive: palette.id === activePaletteId })),
    customEntry,
  ];

  return { themeName: manifest.name, palettes };
}
