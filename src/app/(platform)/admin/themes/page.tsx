import { Badge } from "@/components/ui/badge";
import { getSettingsPageData } from "@/platform/admin-shell/get-settings-page-data";
import { listThemeStates } from "@/platform/theme-engine/list-theme-states";
import { listColorPaletteStates } from "@/platform/theme-engine/list-color-palette-states";
import { CUSTOM_COLOR_PALETTE_ID } from "@/platform/theme-engine/custom-color-palette";
import { getHeaderBehavior } from "@/platform/header-behavior/get-header-behavior";
import { ActivateThemeButton } from "./_components/activate-theme-button";
import { ToggleThemeControl } from "./_components/toggle-theme-control";
import { ActivateColorPaletteButton } from "./_components/activate-color-palette-button";
import { CustomColorPaletteForm } from "./_components/custom-color-palette-form";
import { HeaderBehaviorForm } from "./_components/header-behavior-form";

export default async function ThemesAdminPage() {
  const gate = await getSettingsPageData();

  if (!gate.granted) {
    return (
      <div className="rounded-panel border border-border bg-card ui-panel-padding-roomy text-center">
        <h1 className="text-lg font-semibold text-foreground">Acesso negado</h1>
        <p className="mt-2 text-sm text-muted-foreground">Você não tem permissão para gerenciar temas.</p>
      </div>
    );
  }

  const [themes, colorPaletteStates, headerBehavior] = await Promise.all([
    listThemeStates(),
    listColorPaletteStates(),
    getHeaderBehavior(),
  ]);
  const customPalette = colorPaletteStates.palettes.find((palette) => palette.id === CUSTOM_COLOR_PALETTE_ID);
  const activeTheme = themes.find((theme) => theme.isActive);
  const activeThemeSupportsHeaderBehavior = activeTheme?.manifest.capabilities?.headerBehavior ?? false;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl font-semibold text-foreground">Aparência</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Escolha o tema visual usado no site, ajuste o comportamento do header e as cores, entre os temas
          instalados e habilitados.
        </p>
      </div>

      <section className="rounded-panel border border-border bg-card ui-panel-padding-roomy">
        <ul className="space-y-3">
          {themes.map(({ manifest, enabled, isActive, canDisable, disableBlockedReason }) => (
            <li key={manifest.key} className="flex items-center justify-between gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <span className="font-medium text-foreground">{manifest.name}</span>
                {isActive && <Badge variant="secondary">Ativo</Badge>}
              </div>
              <div className="flex items-center gap-2">
                {!isActive && enabled && <ActivateThemeButton themeKey={manifest.key} />}
                <ToggleThemeControl
                  themeKey={manifest.key}
                  themeName={manifest.name}
                  enabled={enabled}
                  canDisable={canDisable}
                  disableBlockedReason={disableBlockedReason}
                />
              </div>
            </li>
          ))}
        </ul>
      </section>

      {activeThemeSupportsHeaderBehavior && <HeaderBehaviorForm behavior={headerBehavior} />}

      <section className="rounded-panel border border-border bg-card ui-panel-padding-roomy">
        <div>
          <h2 className="text-sm font-semibold text-foreground">Paleta de cor — {colorPaletteStates.themeName}</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Sobrescreve só a cor de destaque (primary/accent) do tema ativo, sem precisar trocar de tema, ou use
            &quot;Personalizada&quot; abaixo pra definir suas próprias cores de primary/secondary/background/text.
          </p>
        </div>
        <ul className="mt-4 space-y-3">
          {colorPaletteStates.palettes.map((palette) => (
            <li key={palette.id} className="flex items-center justify-between gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <span
                  aria-hidden
                  className="size-4 rounded-full border border-border"
                  style={{ background: palette.light.primary ?? "var(--primary)" }}
                />
                <span className="font-medium text-foreground">{palette.name}</span>
                {palette.isActive && <Badge variant="secondary">Ativa</Badge>}
              </div>
              {!palette.isActive && <ActivateColorPaletteButton paletteId={palette.id} />}
            </li>
          ))}
        </ul>

        {customPalette && <CustomColorPaletteForm light={customPalette.light} dark={customPalette.dark} />}
      </section>
    </div>
  );
}
