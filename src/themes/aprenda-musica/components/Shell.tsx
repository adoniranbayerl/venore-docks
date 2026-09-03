import type { ThemeShellProps } from "@/contexts/themes/contracts/types";
import { ContentSlot } from "./ContentSlot";
import { FooterSlot } from "./FooterSlot";
import { HeaderSlot } from "./HeaderSlot";
import { SidebarLeftSlot } from "./SidebarLeftSlot";

// Layout autoral (não reskin — pedido desta sessão): Header full-width no topo; Sidebar e Content
// lado a lado; Footer full-width por baixo de TUDO, inclusive da sidebar (diferença deliberada do
// Venore Slime, onde o Footer mora dentro da coluna de conteúdo e a sidebar estica até acompanhar
// sua altura) — aqui a sidebar termina onde o conteúdo termina, e o Footer fecha a página inteira
// embaixo dos dois, uma faixa só. Sem "muitos efeitos": nenhuma das quatro regiões usa gradiente,
// glow ou sombra funda — só borda de 1px e sombra rasa (theme.css).
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
        <SidebarLeftSlot {...sidebarLeft} />
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
