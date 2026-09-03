import { activateTheme as persistActiveTheme, type ActivateThemeResult } from "@/contexts/themes";
import { THEME_REGISTRY } from "@/themes/registry";

export type ActivateThemeInput = { themeKey: string };

// Ponto de wiring (mesmo raciocínio de activate-color-palette.ts, docs/venore-docks.md regra 12):
// o gate de `themeContractVersion` só é real se comparar a versão QUE O TEMA declara contra o
// intervalo suportado pelo core. Essa versão vive no manifesto (THEME_REGISTRY), que
// contexts/themes não pode importar — então quem cruza os dois é platform/, não a action.
//
// Antes, a action passava `CURRENT_THEME_CONTRACT_VERSION` (a constante do próprio core), então
// `semver.satisfies` no service nunca podia falhar — o gate era código morto. Aqui a versão vem
// de `manifest.themeContractVersion` do tema-alvo.
export async function activateTheme(command: ActivateThemeInput): Promise<ActivateThemeResult> {
  const entry = THEME_REGISTRY[command.themeKey];
  if (!entry) {
    return {
      success: false,
      error: {
        code: "theme-engine.activation.unknown_theme",
        message: `Tema "${command.themeKey}" não está no registro.`,
      },
    };
  }

  return persistActiveTheme({
    themeKey: command.themeKey,
    themeContractVersion: entry.manifest.themeContractVersion,
  });
}
