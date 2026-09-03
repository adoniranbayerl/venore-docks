import type { ContentSlotProps } from "@/contexts/themes/contracts/types";
import { Breadcrumbs } from "./Breadcrumbs";

// bg-background sólido — sem `bg-(image:--app-background)` como Slime/Nightcity, porque este
// tema não declara gradiente nenhum (pedido: "clean, sem degradês exagerados").
export function ContentSlot({ children, sidebarContextualEnabled, sidebarContextual, breadcrumbs, breadcrumbsJsonLd }: ContentSlotProps) {
  const showAside = sidebarContextualEnabled && sidebarContextual != null;

  return (
    <div data-sidebar-contextual={showAside} className="flex-1 bg-background">
      <Breadcrumbs breadcrumbs={breadcrumbs} breadcrumbsJsonLd={breadcrumbsJsonLd} />
      <div className={`mx-auto flex w-full max-w-6xl gap-10 px-6 py-8 ${showAside ? "flex-col lg:flex-row" : ""}`}>
        <main className="min-w-0 flex-1 text-foreground">{children}</main>
        {showAside && (
          <aside className="w-full shrink-0 border-border/70 pt-6 text-foreground lg:w-64 lg:border-l lg:pt-0 lg:pl-8">
            {sidebarContextual}
          </aside>
        )}
      </div>
    </div>
  );
}
