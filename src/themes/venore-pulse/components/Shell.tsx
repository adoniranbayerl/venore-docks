import type { ThemeShellProps } from "@/contexts/themes/contracts/types";
import { ContentSlot } from "./ContentSlot";
import { FooterSlot } from "./FooterSlot";
import { HeaderSlot } from "./HeaderSlot";
import { SidebarSlot } from "./SidebarSlot";

// Header full-width no topo (como o Slime), mas Sidebar sem colapso — a simplicidade da sidebar É
// a identidade "sóbria" deste tema (pedido desta sessão), não um recurso que falta. Footer
// full-width por baixo de TUDO — inclusive da sidebar, não só da coluna de conteúdo (diferença do
// Slime, onde o Footer mora dentro da coluna de conteúdo e a sidebar estica até acompanhar sua
// altura): aqui a sidebar termina onde o conteúdo termina, e o Footer fecha a página inteira
// embaixo dos dois, mesmo espírito do Kazordoon (Footer é sempre banda de página inteira).
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
    <div className="flex min-h-full flex-1 flex-col">
      <HeaderSlot {...header} />
      <div className="flex flex-1">
        <SidebarSlot {...sidebarLeft} />
        <ContentSlot
          sidebarContextualEnabled={sidebarContextualEnabled}
          sidebarContextual={sidebarContextual}
          breadcrumbs={breadcrumbs}
          breadcrumbsJsonLd={breadcrumbsJsonLd}
        >
          {children}
        </ContentSlot>
      </div>
      <FooterSlot {...footer} />
    </div>
  );
}
