import { getSetting, setSetting } from "@/contexts/settings";
import type { ColorPalette, PaletteColorTokens } from "@/contexts/themes";
import type { OperationResult } from "@/shared/types";
import { CUSTOM_COLOR_PALETTE_ID } from "./custom-color-palette-id";
import { contrastRatio, MIN_CUSTOM_PALETTE_CONTRAST } from "./contrast";

export { CUSTOM_COLOR_PALETTE_ID };

// Uma paleta personalizada POR TEMA — a chave carrega o themeKey. Antes era uma chave global
// (`theme.customColorPalette`), então trocar de tema mantinha as cores personalizadas por cima
// de uma base diferente. Agora a paleta viaja com o tema, igual aos presets de catálogo.
const SETTING_KEY_PREFIX = "theme.customColorPalette";
const settingKeyFor = (themeKey: string) => `${SETTING_KEY_PREFIX}.${themeKey}`;

// Vocabulário deliberadamente menor que PaletteColorToken (pedido de sessão anterior: só primary/
// secondary/background/text) — cada um mapeia 1:1 pra uma var shadcn de theme.css (AGENTS.md §3).
const CUSTOM_COLOR_TOKENS = ["primary", "secondary", "background", "foreground"] as const;
type CustomColorToken = (typeof CUSTOM_COLOR_TOKENS)[number];

// <input type="color"> do client só produz #rrggbb — a validação aqui é a defesa de verdade
// contra qualquer payload malformado batendo direto no FormData (ver aviso em app/layout.tsx
// sobre dangerouslySetInnerHTML: cor arbitrária de admin exige validação antes de virar CSS).
const HEX_COLOR_PATTERN = /^#[0-9a-f]{6}$/i;

export type CustomColorPaletteInput = { light: PaletteColorTokens; dark: PaletteColorTokens };

type StoredCustomColorPalette = { light: PaletteColorTokens; dark: PaletteColorTokens };

function hasOnlyValidHexTokens(tokens: PaletteColorTokens): boolean {
  return Object.entries(tokens).every(
    ([token, value]) =>
      CUSTOM_COLOR_TOKENS.includes(token as CustomColorToken) && typeof value === "string" && HEX_COLOR_PATTERN.test(value),
  );
}

// Só checa quando os DOIS tokens do par existem naquele modo — um modo que só mexe em `primary`
// não é barrado. Retorna a mensagem de erro, ou null se está ok.
function contrastProblem(tokens: PaletteColorTokens, modeLabel: string): string | null {
  const fg = tokens.foreground;
  const bg = tokens.background;
  if (!fg || !bg) return null;
  const ratio = contrastRatio(fg, bg);
  if (ratio >= MIN_CUSTOM_PALETTE_CONTRAST) return null;
  return `Contraste texto/fundo no ${modeLabel} é ${ratio.toFixed(1)}:1 — mínimo ${MIN_CUSTOM_PALETTE_CONTRAST}:1 pra legibilidade.`;
}

export async function setCustomColorPalette(
  themeKey: string,
  input: CustomColorPaletteInput,
): Promise<OperationResult<{ id: string }>> {
  if (!hasOnlyValidHexTokens(input.light) || !hasOnlyValidHexTokens(input.dark)) {
    return {
      success: false,
      error: {
        code: "theme-engine.custom_color_palette.invalid_value",
        message: "Cada cor precisa ser um hexadecimal válido (#rrggbb).",
      },
    };
  }

  const contrastError = contrastProblem(input.light, "modo claro") ?? contrastProblem(input.dark, "modo escuro");
  if (contrastError) {
    return {
      success: false,
      error: { code: "theme-engine.custom_color_palette.low_contrast", message: contrastError },
    };
  }

  const stored: StoredCustomColorPalette = { light: input.light, dark: input.dark };
  const result = await setSetting({ key: settingKeyFor(themeKey), value: stored });
  if (!result.success) return result;

  return { success: true, data: { id: CUSTOM_COLOR_PALETTE_ID } };
}

export async function getCustomColorPalette(themeKey: string): Promise<ColorPalette> {
  // skipCache: a paleta personalizada vira CSS de override no root layout de toda rota — mesma
  // defasagem multi-instância que afeta theme.active/theme.activePaletteId (ver GetSettingQuery).
  const result = await getSetting({ key: settingKeyFor(themeKey), skipCache: true });
  const stored = result.success && result.data ? (result.data.value as StoredCustomColorPalette) : null;

  return {
    id: CUSTOM_COLOR_PALETTE_ID,
    name: "Personalizada",
    light: stored?.light ?? {},
    dark: stored?.dark ?? {},
  };
}
