import type { MainNavItem } from "@/contexts/themes";

// Valores de slot que NÃO vêm de contexts/settings, CMS, auth nem do manifesto do tema — são
// constantes de plataforma. Antes chegavam via `...venoreSlimeMockProps` (o mock do tema Venore
// Slime) espalhado como base de TODO tema em resolve-theme-slot-props.ts, o que fazia qualquer
// tema não-Slime herdar as constantes do mock do Slime. Aqui ficam explícitas e neutras de tema.
export const THEME_SLOT_DEFAULTS = {
  // O Header sempre monta a user-bar (login / menu do usuário) — não há tema hoje que a dispense
  // e não é decisão editável. Se algum dia for, vira manifest.capabilities.
  userbarEnabled: true,
  // header-nav própria do Header: sem fonte real ainda (Known Gap, AGENTS.md §7) — lista vazia.
  headerNavItems: [] as const,
  // Créditos no rodapé ("feito com…"): desligado por padrão, sem toggle de admin hoje.
  footerCreditsEnabled: false,
  // SidebarLeft sempre existe (é navegação, não área de widget) — nenhum tema a dispensa hoje.
  sidebarLeftEnabled: true,
} as const;

// Fallback pra sidebar nunca ficar vazia quando a leitura do menu "main" do CMS falha
// (resolve-theme-slot-props.ts). Não é conteúdo de exemplo — é o mínimo pra navegar (link à home).
export const FALLBACK_MAIN_NAV_ITEMS: MainNavItem[] = [{ key: "home", label: "Home", href: "/", icon: "home" }];
