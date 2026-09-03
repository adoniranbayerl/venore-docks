import type { ThemeShellProps } from "@/contexts/themes/contracts/types";
import { ContentSlot } from "./ContentSlot";
import { FooterSlot } from "./FooterSlot";
import { HeaderSlot } from "./HeaderSlot";
import { SidebarLeftSlot } from "./SidebarLeftSlot";

// Arranjo deliberadamente diferente do Venore Slime, não só o theme.css (docs/themes/
// shell-contract.md — Abordagem A; pedido explícito desta sessão: "algo completamente diferente
// do Venore Slime, não apenas mudança de cor"). No Slime, Header cobre a largura inteira no topo,
// acima de Sidebar+Content lado a lado. Aqui é o inverso: Sidebar (rail de ícones) ocupa a altura
// inteira da viewport, ao lado de tudo — inclusive do Header, que vira uma faixa fina restrita à
// coluna de conteúdo, sem a mecânica de encolher ao rolar. Footer também sai do bloco alto com
// painel de marca do Slime e vira uma faixa fina no rodapé da mesma coluna.
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
    <div className="flex min-h-full flex-1">
      <SidebarLeftSlot {...sidebarLeft} />
      <div className="flex min-w-0 flex-1 flex-col">
        <HeaderSlot {...header} />
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
    </div>
  );
}
