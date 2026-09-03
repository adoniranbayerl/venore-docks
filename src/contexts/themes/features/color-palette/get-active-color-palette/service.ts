import { getSetting } from "@/contexts/settings";
import type { GetActiveColorPaletteResult } from "./types";
import type { ActiveColorPaletteState } from "../../../contracts/types";

// "default" nunca é um id de ColorPalette de verdade (contracts/types.ts) — significa "sem
// override runtime, usar theme.css como está" (T3, docs/implementation-roadmap.md Fase 5).
const FALLBACK_ACTIVE_COLOR_PALETTE: ActiveColorPaletteState = { paletteId: "default", activatedAt: null };

export async function getActiveColorPalette(): Promise<GetActiveColorPaletteResult> {
  // skipCache pelo mesmo motivo de get-active-theme: o override de paleta é aplicado no root
  // layout de toda rota, e o cache em memória de 300s é por processo (ver GetSettingQuery).
  const result = await getSetting({ key: "theme.activePaletteId", skipCache: true });
  if (!result.success) {
    return result;
  }

  const record = result.data;
  if (!record || typeof record.value !== "string") {
    return { success: true, data: FALLBACK_ACTIVE_COLOR_PALETTE };
  }

  return { success: true, data: { paletteId: record.value, activatedAt: record.updatedAt } };
}
