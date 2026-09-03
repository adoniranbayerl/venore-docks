import type { ContentSlotProps } from "@/contexts/themes/contracts/types";
import { Breadcrumbs } from "./Breadcrumbs";

export function ContentSlot({ children, sidebarContextualEnabled, sidebarContextual, breadcrumbs, breadcrumbsJsonLd }: ContentSlotProps) {
  const showAside = sidebarContextualEnabled && sidebarContextual != null;

  return (
    <div data-sidebar-contextual={showAside} className="flex-1 min-w-0 bg-(image:--app-background)">
      <Breadcrumbs breadcrumbs={breadcrumbs} breadcrumbsJsonLd={breadcrumbsJsonLd} />
      <div className={`mx-auto flex w-full max-w-7xl gap-8 px-6 py-8 ${showAside ? "flex-col lg:flex-row" : ""}`}>
        <main className="min-w-0 flex-1 text-foreground">{children}</main>
        {showAside && (
          <aside className="w-full shrink-0 border-border/60 pt-6 text-foreground lg:w-72 lg:border-l lg:pt-0 lg:pl-6">
            {sidebarContextual}
          </aside>
        )}
      </div>
    </div>
  );
}
