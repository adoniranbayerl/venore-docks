"use server";

import { revalidatePath } from "next/cache";
import { setSetting } from "@/contexts/settings";
import { activateTheme } from "@/platform/theme-engine/activate-theme";
import { toggleThemeEnabled } from "@/platform/theme-engine/toggle-theme-enabled";
import { activateColorPalette } from "@/platform/theme-engine/activate-color-palette";
import { setCustomColorPalette } from "@/platform/theme-engine/custom-color-palette";
import { HEADER_BEHAVIOR_SETTING_KEYS } from "@/platform/header-behavior/get-header-behavior";

export type ThemesActionState = { error: string | null };

const THEMES_PATH = "/admin/themes";

// Tema, paleta de cor e comportamento de header são renderizados no root layout (data-theme,
// paletteOverrideCss) e no Shell, então valem pra toda rota — revalidar só THEMES_PATH deixava
// as outras páginas servindo o data-theme antigo até essa rota específica ser revisitada (bug:
// "às vezes, ao trocar de página, volta pro tema anterior"). revalidatePath("/", "layout")
// invalida o root layout e, por consequência, toda a árvore de rotas abaixo dele.
const revalidateEverywhere = () => revalidatePath("/", "layout");

// Mesmo padrão de removeRoleAction (/admin/rbac/actions.ts): erro do handler é devolvido de
// verdade via useActionState, nunca descartado silenciosamente (docs/venore-docks.md).
export async function activateThemeAction(
  _prevState: ThemesActionState,
  formData: FormData,
): Promise<ThemesActionState> {
  const themeKey = String(formData.get("themeKey") ?? "");

  const result = await activateTheme({ themeKey });

  if (!result.success) {
    return { error: result.error.message };
  }

  revalidateEverywhere();
  return { error: null };
}

export async function toggleThemeEnabledAction(
  _prevState: ThemesActionState,
  formData: FormData,
): Promise<ThemesActionState> {
  const themeKey = String(formData.get("themeKey") ?? "");
  const enabled = formData.get("enabled") === "true";

  const result = await toggleThemeEnabled({ themeKey, enabled });
  if (!result.success) {
    return { error: result.error.message };
  }

  revalidatePath(THEMES_PATH);
  return { error: null };
}

// T3 (docs/implementation-roadmap.md — Fase 5, fundação): mesmo padrão de activateThemeAction —
// erro devolvido via useActionState, revalida a mesma página.
export async function activateColorPaletteAction(
  _prevState: ThemesActionState,
  formData: FormData,
): Promise<ThemesActionState> {
  const paletteId = String(formData.get("paletteId") ?? "");

  const result = await activateColorPalette({ paletteId });
  if (!result.success) {
    return { error: result.error.message };
  }

  revalidateEverywhere();
  return { error: null };
}

// Movido de admin/settings/appearance/actions.ts (pedido desta sessão: comportamento de header
// junto do tema, não em "identidade do site") — mesmo padrão de action acima, checkbox ausente no
// FormData == desmarcado (semântica padrão de HTML forms, não um "não informado").
export async function updateHeaderBehaviorAction(
  _prevState: ThemesActionState,
  formData: FormData,
): Promise<ThemesActionState> {
  const entries: Array<{ key: string; value: unknown }> = [
    { key: HEADER_BEHAVIOR_SETTING_KEYS.sticky, value: formData.get("sticky") === "on" },
    { key: HEADER_BEHAVIOR_SETTING_KEYS.scrollShrink, value: formData.get("scrollShrink") === "on" },
  ];

  for (const entry of entries) {
    const result = await setSetting(entry);
    if (!result.success) {
      return { error: result.error.message };
    }
  }

  revalidateEverywhere();
  return { error: null };
}

// Cor personalizada (pedido desta sessão): salva os 4 tokens (primary/secondary/background/text)
// pros dois modos e já ativa "custom" como paleta corrente — o admin não precisa de um segundo
// clique em "Usar" depois de salvar. Campo vazio (input type=color sempre manda algo, mas o campo
// pode estar ausente do FormData se removido do form no futuro) vira token omitido, não string
// vazia — setCustomColorPalette só aceita hex válido ou ausência da chave.
export async function updateCustomColorPaletteAction(
  _prevState: ThemesActionState,
  formData: FormData,
): Promise<ThemesActionState> {
  const tokens = ["primary", "secondary", "background", "foreground"] as const;

  function readTokens(mode: "light" | "dark") {
    const result: Record<string, string> = {};
    for (const token of tokens) {
      const value = formData.get(`${mode}-${token}`);
      if (typeof value === "string" && value.trim().length > 0) {
        result[token] = value;
      }
    }
    return result;
  }

  const saveResult = await setCustomColorPalette({ light: readTokens("light"), dark: readTokens("dark") });
  if (!saveResult.success) {
    return { error: saveResult.error.message };
  }

  const activateResult = await activateColorPalette({ paletteId: saveResult.data.id });
  if (!activateResult.success) {
    return { error: activateResult.error.message };
  }

  revalidateEverywhere();
  return { error: null };
}
