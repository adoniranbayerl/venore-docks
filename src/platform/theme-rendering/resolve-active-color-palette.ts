import { cache } from "react";
import { getActiveColorPalette, type ColorPalette, type PaletteColorTokens } from "@/contexts/themes";
import { resolveActiveTheme } from "./resolve-active-theme";
import { CUSTOM_COLOR_PALETTE_ID, getCustomColorPalette } from "@/platform/theme-engine/custom-color-palette";

// T3 (docs/implementation-roadmap.md — Fase 5, fundação): paleta ativa resolvida pra runtime —
// null quando o paletteId salvo é "default" ou não existe (mais) no catálogo do tema ativo (ex:
// tema trocado depois de escolher uma paleta específica do tema anterior), caso em que o
// theme.css do tema ativo simplesmente vale como está, sem override nenhum. cache() pelo mesmo
// motivo de resolveActiveTheme/resolveBrandAesthetics: usado tanto no root layout (aplica o
// override) quanto potencialmente em telas admin no mesmo request.
export const resolveActiveColorPalette = cache(async (): Promise<ColorPalette | null> => {
  const [{ colorPalettes, manifest }, activePaletteResult] = await Promise.all([
    resolveActiveTheme(),
    getActiveColorPalette(),
  ]);
  if (!activePaletteResult.success) return null;

  const paletteId = activePaletteResult.data.paletteId;
  if (paletteId === "default") return null;
  if (paletteId === CUSTOM_COLOR_PALETTE_ID) return getCustomColorPalette(manifest.key);

  return colorPalettes.find((palette) => palette.id === paletteId) ?? null;
});

const TOKEN_NAME_PREFIX = "--";

function buildDeclarationBlock(tokens: PaletteColorTokens): string {
  return Object.entries(tokens)
    .map(([token, value]) => `${TOKEN_NAME_PREFIX}${token}: ${value};`)
    .join(" ");
}

// Especificidade (0,1,1) — `html[data-theme="x"]` — deliberadamente maior que o seletor de
// theme.css (`[data-theme="x"]`, especificidade 0,1,0): garante que o override vence na cascata
// sem depender de ordem de inserção no documento nem de `!important` (o `<style>` pode acabar
// renderizado em qualquer posição do body — ver comentário em layout.tsx). Mesmo raciocínio pro
// par `.dark` (0,2,1 > 0,2,0).
export function buildColorPaletteOverrideCss(themeKey: string, palette: ColorPalette): string {
  const blocks: string[] = [];
  if (Object.keys(palette.light).length > 0) {
    blocks.push(`html[data-theme="${themeKey}"] { ${buildDeclarationBlock(palette.light)} }`);
  }
  if (Object.keys(palette.dark).length > 0) {
    blocks.push(`html[data-theme="${themeKey}"].dark { ${buildDeclarationBlock(palette.dark)} }`);
  }
  return blocks.join("\n");
}
