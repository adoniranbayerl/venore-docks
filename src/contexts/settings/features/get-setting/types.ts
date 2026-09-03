import type { OperationResult } from "@/shared/types";
import type { SettingRecord } from "../../contracts/types";

// skipCache: pula o cache em memória (leitura E write-through). Para chaves lidas no root layout
// de TODA rota e cuja defasagem é imediatamente visível — hoje `theme.active`,
// `theme.activePaletteId` e `theme.customColorPalette`. O cache tem TTL de 300s e é POR PROCESSO:
// num deploy multi-instância (Vercel), o `invalidateCache` do `setSetting` só limpa a instância
// que atendeu a escrita, então as demais servem o valor anterior por até 5 min (sintoma: "ao
// navegar, o tema às vezes volta pro anterior"). Quem lê essas chaves já memoiza por request
// (React `cache()` em resolve-active-theme.ts), então pular o cache custa 1 SELECT indexado.
export type GetSettingQuery = { key: string; skipCache?: boolean };
export type GetSettingResult = OperationResult<SettingRecord | null>;
