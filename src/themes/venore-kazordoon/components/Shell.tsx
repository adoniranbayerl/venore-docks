import type { ThemeShellProps } from "@/contexts/themes/contracts/types";
import { ContentSlot } from "./ContentSlot";
import { FooterSlot } from "./FooterSlot";
import { HeaderSlot } from "./HeaderSlot";
import { NavBarSlot } from "./NavBarSlot";

// Arranjo estruturalmente diferente dos outros dois temas (docs/themes/shell-contract.md —
// Abordagem A; pedido desta sessão: "shell deve ser diferente dos outros dois temas"). Slime é
// Header no topo + (SidebarLeft | Content+Footer) lado a lado; Nightcity é (rail de altura
// inteira) | (Header+Content+Footer). Kazordoon não tem nenhuma coluna lateral: é uma pilha
// vertical só — Header, barra de navegação horizontal (NavBarSlot, substitui a SidebarLeft por
// completo), Content, Footer — cada um ocupando a largura inteira. Nenhum dos três temas
// concorda em "onde mora a navegação secundária": coluna colapsável, rail de ícones, ou barra
// horizontal de abas.
export function Shell({
  header,
  footer,
  sidebarLeft,
  children,
  sidebarContextualEnabled,
  sidebarContextual,
  breadcrumbs,
  breadcrumbsJsonLd,
}: ThemeShellProps) {
  return (
    <div className="flex min-h-full flex-1 flex-col bg-background">
      <HeaderSlot {...header} />
      <NavBarSlot {...sidebarLeft} />
      <ContentSlot
        sidebarContextualEnabled={sidebarContextualEnabled}
        sidebarContextual={sidebarContextual}
        breadcrumbs={breadcrumbs}
        breadcrumbsJsonLd={breadcrumbsJsonLd}
      >
        {children}
      </ContentSlot>
      <FooterSlot {...footer} />
    </div>
  );
}
