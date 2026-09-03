import { getSetting } from "@/contexts/settings";
import type { GetActiveThemeResult } from "./types";
import type { ActiveThemeState } from "../../../contracts/types";

// Nenhum tema foi explicitamente ativado ainda — o core roda com o Venore Slime (padrão e
// fallback ao mesmo tempo) até um admin ativar outro (docs/venore-docks.md — "Sobre temas").
const FALLBACK_ACTIVE_THEME: ActiveThemeState = { themeKey: "venore-slime", activatedAt: null };

export async function getActiveTheme(): Promise<GetActiveThemeResult> {
  // skipCache: `theme.active` alimenta o `data-theme` do <html> em toda rota; o cache em memória
  // de 300s é por processo e num deploy multi-instância deixa instâncias servindo o tema anterior
  // por minutos após a troca (ver GetSettingQuery). resolveActiveTheme já memoiza por request.
  const result = await getSetting({ key: "theme.active", skipCache: true });
  if (!result.success) {
    return result;
  }

  const record = result.data;
  if (!record || typeof record.value !== "string") {
    return { success: true, data: FALLBACK_ACTIVE_THEME };
  }

  return { success: true, data: { themeKey: record.value, activatedAt: record.updatedAt } };
}
