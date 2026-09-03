import type { HeaderSlotProps, FooterSlotProps, SidebarLeftSlotProps, NavItem } from "@/contexts/themes/contracts/types";

// Dado mockado do tema Venore Slime — não existe CMS nem RBAC de navegação ainda para resolver
// brand/navItems/sitemap de verdade (docs/venore-docks.md — "Sobre temas", ponto 6).
//
// IMPORTANTE: nenhum componente de slot deste tema importa este módulo. Só a camada de
// composição em platform/theme-rendering/resolve-theme-slot-props.ts pode importá-lo e passar
// os valores como props — um tema nunca busca dado sozinho (Contrato de slot).
//
// header aqui cobre brand/userbar/header-nav (sem fonte real ainda). scroll não é mais um campo —
// é detectado inteiramente no client (HeaderScrollSentinel), fora do contrato de slot. user/
// canAccessAdmin/onSignOut vêm de @/contexts/auth via resolve-theme-slot-props.ts, nunca do
// mock. sidebarLeft só cobre enabled + a lista main-nav (usada quando navMode === "main") —
// navMode/canToggleAdminNav/onToggleNavMode/admin-nav são resolvidos de verdade pelo layout e
// mesclados por cima em resolve-theme-slot-props.ts.
export const venoreSlimeMockProps: {
  header: Omit<HeaderSlotProps, "user" | "canAccessAdmin" | "onSignOut">;
  footer: FooterSlotProps;
  sidebarLeft: Omit<
    SidebarLeftSlotProps,
    "navMode" | "navGroups" | "canToggleAdminNav" | "onToggleNavMode" | "collapsed" | "onToggleCollapsed"
  > & {
    navItems: NavItem[];
  };
} = {
  header: {
    // Sobrescrito de verdade por getBrandConfig() em resolve-theme-slot-props.ts — valor aqui
    // só existe pra este objeto tipar como HeaderSlotProps completo.
    brand: {
      name: "Venore Docks",
      mode: "svg",
      size: 100,
      scrolledSize: 80,
      position: "left",
      logoUrl: "/brand/brand-logo.svg",
      scrolledLogoUrl: "/brand/brand-logo-scrolled.png",
    },
    userbarEnabled: true,
    // Sobrescrito de verdade por getHeaderBehavior() em resolve-theme-slot-props.ts (T4) — valor
    // aqui só existe pra este objeto tipar como HeaderSlotProps completo.
    stickyEnabled: true,
    scrollShrinkEnabled: true,
    headerNavItems: [],
  },
  footer: {
    // Sobrescrito de verdade por getBrandConfig() em resolve-theme-slot-props.ts, mesmo princípio
    // do header acima — valor aqui só existe pra este objeto tipar como FooterSlotProps completo.
    brand: {
      name: "Venore Docks",
      mode: "svg",
      size: 100,
      scrolledSize: 80,
      position: "left",
      logoUrl: "/brand/brand-logo.svg",
      scrolledLogoUrl: "/brand/brand-logo-scrolled.png",
      color: "#143b52",
      description: "Plataforma modular para conteúdo, comunidade e operação.",
    },
    sitemapItems: [],
    creditsEnabled: false,
  },
  sidebarLeft: { enabled: true, navItems: [{ key: "home", label: "Home", href: "/", icon: "home" }] },
};
