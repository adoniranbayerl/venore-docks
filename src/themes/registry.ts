import * as venoreSlime from "./venore-slime";
import { GENERATED_THEME_REGISTRY } from "./registry.generated";
import type { ThemeRegistryEntry } from "./registry-types";

export type { ThemeShellComponent, ThemeRegistryEntry } from "./registry-types";

// Registro dos temas (docs/venore-docks.md — "Sobre temas"). `venore-slime` é o único tema que
// vive em src/themes/ (fallback obrigatório do sistema, AGENTS.md §3) e entra aqui hardcoded;
// todo o resto vem de GENERATED_THEME_REGISTRY — os pacotes @venore/theme-* descobertos a partir
// das deps do package.json (scripts/gen-theme-registry.ts). `Shell` é o único componente que o
// registro exige — quem decide a árvore/arranjo é o tema (docs/themes/shell-contract.md —
// Abordagem A), não este arquivo.
export const THEME_REGISTRY: Record<string, ThemeRegistryEntry> = {
  "venore-slime": {
    manifest: venoreSlime.venoreSlimeManifest,
    Shell: venoreSlime.Shell,
    colorPalettes: venoreSlime.VENORE_SLIME_COLOR_PALETTES,
  },
  ...GENERATED_THEME_REGISTRY,
};
