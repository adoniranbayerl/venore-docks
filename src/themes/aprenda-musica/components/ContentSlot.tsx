import type { ContentSlotProps } from "@/contexts/themes/contracts/types";
import { Breadcrumbs } from "../../venore-slime/components/Breadcrumbs";

// Breadcrumbs é o mesmo componente do Venore Slime, reaproveitado como está: puramente
// tipográfico (texto + chevron), já sem sombra/gradiente nenhum — não há identidade visual própria
// a reescrever aqui, mesmo raciocínio de reaproveitar SidebarNavLink/MobileNavDrawer.
export function ContentSlot({ children, sidebarContextualEnabled, sidebarContextual, breadcrumbs, breadcrumbsJsonLd }: ContentSlotProps) {
  const showAside = sidebarContextualEnabled && sidebarContextual != null;

  return (
    <div data-sidebar-contextual={showAside} className="min-w-0 flex-1 bg-(image:--app-background)">
      <Breadcrumbs breadcrumbs={breadcrumbs} breadcrumbsJsonLd={breadcrumbsJsonLd} />
      <div className={`mx-auto flex w-full max-w-6xl gap-8 px-6 py-8 ${showAside ? "flex-col lg:flex-row" : ""}`}>
        <main className="min-w-0 flex-1 text-foreground">{children}</main>
        {showAside && (
          <aside className="w-full shrink-0 border-border/70 pt-6 text-foreground lg:w-72 lg:border-l lg:pt-0 lg:pl-8">
            {sidebarContextual}
          </aside>
        )}
      </div>
    </div>
  );
}
