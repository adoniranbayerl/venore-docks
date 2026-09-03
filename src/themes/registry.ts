import * as venoreSlime from "./venore-slime";
import * as venoreBasic from "./venore-basic";
import * as venoreNightcity from "./venore-nightcity";
import * as venoreKazordoon from "./venore-kazordoon";
import * as venorePulse from "./venore-pulse";
import * as venoreFrost from "./venore-frost";
import * as menonitaClassic from "./menonita-classic";
import { GENERATED_THEME_REGISTRY } from "./registry.generated";
import type { ThemeRegistryEntry } from "./registry-types";

export type { ThemeShellComponent, ThemeRegistryEntry } from "./registry-types";

// Registro dos temas (docs/venore-docks.md — "Sobre temas"). `venore-slime` e os temas ainda
// não extraídos vivem em src/themes/ e entram aqui hardcoded; os pacotes @venore/theme-* vêm de
// GENERATED_THEME_REGISTRY (scripts/gen-theme-registry.ts, a partir das deps do package.json).
// `Shell` é o único componente que o registro exige — quem decide a árvore/arranjo é o tema
// (docs/themes/shell-contract.md — Abordagem A), não este arquivo.
export const THEME_REGISTRY: Record<string, ThemeRegistryEntry> = {
  "venore-slime": {
    manifest: venoreSlime.venoreSlimeManifest,
    Shell: venoreSlime.Shell,
    colorPalettes: venoreSlime.VENORE_SLIME_COLOR_PALETTES,
  },
  "venore-basic": {
    manifest: venoreBasic.venoreBasicManifest,
    Shell: venoreBasic.Shell,
    colorPalettes: venoreBasic.VENORE_BASIC_COLOR_PALETTES,
  },
  "venore-nightcity": {
    manifest: venoreNightcity.venoreNightcityManifest,
    Shell: venoreNightcity.Shell,
    colorPalettes: venoreNightcity.VENORE_NIGHTCITY_COLOR_PALETTES,
  },
  "venore-kazordoon": {
    manifest: venoreKazordoon.venoreKazordoonManifest,
    Shell: venoreKazordoon.Shell,
    colorPalettes: venoreKazordoon.VENORE_KAZORDOON_COLOR_PALETTES,
  },
  "venore-pulse": {
    manifest: venorePulse.venorePulseManifest,
    Shell: venorePulse.Shell,
    colorPalettes: venorePulse.VENORE_PULSE_COLOR_PALETTES,
  },
  "venore-frost": {
    manifest: venoreFrost.venoreFrostManifest,
    Shell: venoreFrost.Shell,
    colorPalettes: venoreFrost.VENORE_FROST_COLOR_PALETTES,
  },
  "menonita-classic": {
    manifest: menonitaClassic.menonitaClassicManifest,
    Shell: menonitaClassic.Shell,
    colorPalettes: menonitaClassic.MENONITA_CLASSIC_COLOR_PALETTES,
  },
  // Pacotes @venore/theme-* instalados (inclui `academy`, o antigo aprenda-musica extraído).
  ...GENERATED_THEME_REGISTRY,
};
