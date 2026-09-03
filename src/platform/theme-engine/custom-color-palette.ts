import { getSetting, setSetting } from "@/contexts/settings";
import type { ColorPalette, PaletteColorTokens } from "@/contexts/themes";
import type { OperationResult } from "@/shared/types";
import { CUSTOM_COLOR_PALETTE_ID } from "./custom-color-palette-id";

export { CUSTOM_COLOR_PALETTE_ID };

const SETTING_KEY = "theme.customColorPalette";

// Vocabulário deliberadamente menor que PaletteColorToken (pedido desta sessão: só primary/
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

export async function setCustomColorPalette(input: CustomColorPaletteInput): Promise<OperationResult<{ id: string }>> {
  if (!hasOnlyValidHexTokens(input.light) || !hasOnlyValidHexTokens(input.dark)) {
    return {
      success: false,
      error: {
        code: "theme-engine.custom_color_palette.invalid_value",
        message: "Cada cor precisa ser um hexadecimal válido (#rrggbb).",
      },
    };
  }

  const stored: StoredCustomColorPalette = { light: input.light, dark: input.dark };
  const result = await setSetting({ key: SETTING_KEY, value: stored });
  if (!result.success) return result;

  return { success: true, data: { id: CUSTOM_COLOR_PALETTE_ID } };
}

export async function getCustomColorPalette(): Promise<ColorPalette> {
  // skipCache: a paleta personalizada vira CSS de override no root layout de toda rota — mesma
  // defasagem multi-instância que afeta theme.active/theme.activePaletteId (ver GetSettingQuery).
  const result = await getSetting({ key: SETTING_KEY, skipCache: true });
  const stored = result.success && result.data ? (result.data.value as StoredCustomColorPalette) : null;

  return {
    id: CUSTOM_COLOR_PALETTE_ID,
    name: "Personalizada",
    light: stored?.light ?? {},
    dark: stored?.dark ?? {},
  };
}
