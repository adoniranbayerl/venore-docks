import type { ComponentType } from "react";
import type { ColorPalette, ThemeManifest, ThemeShellProps } from "@/contexts/themes/contracts/types";

export type ThemeShellComponent = ComponentType<ThemeShellProps>;

// colorPalettes (T3): catálogo de paletas salváveis do tema. `[]` = tema sem catálogo.
export type ThemeRegistryEntry = { manifest: ThemeManifest; Shell: ThemeShellComponent; colorPalettes: ColorPalette[] };
