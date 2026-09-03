import type { ComponentType } from "react";
import type { ColorPalette, ThemeManifest, ThemeShellProps } from "@/contexts/themes/contracts/types";
import * as venoreSlime from "./venore-slime";
import * as venoreBasic from "./venore-basic";
import * as venoreNightcity from "./venore-nightcity";
import * as venoreKazordoon from "./venore-kazordoon";
import * as venorePulse from "./venore-pulse";
import * as venoreFrost from "./venore-frost";
import * as menonitaClassic from "./menonita-classic";
import * as aprendaMusica from "./aprenda-musica";

export type ThemeShellComponent = ComponentType<ThemeShellProps>;

// colorPalettes (T3, docs/implementation-roadmap.md — Fase 5): catálogo de paletas salváveis do
// tema, mesmo raciocínio de `Shell` — cada tema declara o próprio, os valores partem da paleta
// base do theme.css daquele tema específico. [] = tema ainda sem catálogo (todos exceto
// venore-slime nesta fundação).
export type ThemeRegistryEntry = { manifest: ThemeManifest; Shell: ThemeShellComponent; colorPalettes: ColorPalette[] };

// Registro dos temas instalados em código (docs/venore-docks.md — "Sobre temas"). Next.js exige
// import estático para bundling, então instalar um tema novo é uma entrada nova aqui, não um
// scan de filesystem em runtime. `Shell` é o único componente que o registro exige — quem decide
// a árvore/arranjo entre as regiões (header, footer, sidebar, conteúdo) é o próprio tema
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
    colorPalettes: [],
  },
  "venore-nightcity": {
    manifest: venoreNightcity.venoreNightcityManifest,
    Shell: venoreNightcity.Shell,
    colorPalettes: [],
  },
  "venore-kazordoon": {
    manifest: venoreKazordoon.venoreKazordoonManifest,
    Shell: venoreKazordoon.Shell,
    colorPalettes: [],
  },
  "venore-pulse": {
    manifest: venorePulse.venorePulseManifest,
    Shell: venorePulse.Shell,
    colorPalettes: [],
  },
  "venore-frost": {
    manifest: venoreFrost.venoreFrostManifest,
    Shell: venoreFrost.Shell,
    colorPalettes: [],
  },
  "menonita-classic": {
    manifest: menonitaClassic.menonitaClassicManifest,
    Shell: menonitaClassic.Shell,
    colorPalettes: [],
  },
  "aprenda-musica": {
    manifest: aprendaMusica.aprendaMusicaManifest,
    Shell: aprendaMusica.Shell,
    colorPalettes: [],
  },
};
