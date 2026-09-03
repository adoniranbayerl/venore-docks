import type { SidebarLeftSlotProps } from "@/contexts/themes/contracts/types";
import { cn } from "@/lib/utils";
import { MobileNavDrawer } from "../../venore-slime/components/MobileNavDrawer";
import { SidebarNavLink } from "../../venore-slime/components/SidebarNavLink";
import { AdminNavSwitch } from "./AdminNavSwitch";

// Sidebar fixa, sem colapso — nem rail de ícones (Nightcity) nem coluna que expande/colapsa
// (Slime): uma única largura, sempre com rótulo visível. Simplicidade é a identidade "sóbria"
// deste tema (pedido desta sessão): `collapsed`/`onToggleCollapsed` do contrato não são usados
// aqui de propósito — mesmo precedente de venore-basic/venore-kazordoon ignorando campos que não
// fazem sentido pro design (nenhuma prop é obrigatória de *usar*, só de aceitar).
//
// SidebarNavLink e MobileNavDrawer são os mesmos componentes do Venore Slime, reaproveitados como
// estão: SidebarNavLink já é 100% orientado a token (a identidade "sóbria" vem inteira do
// theme.css, não de reescrever o widget de novo — mesmo raciocínio já usado pro Nightcity/
// Kazordoon reaproveitarem PlatformBrand/UserMenu) e MobileNavDrawer é mecânica genérica de
// off-canvas (focus-trap, Escape, scroll-lock), não identidade visual.
export function SidebarSlot({ enabled, navMode, navItems, navGroups, canToggleAdminNav, onToggleNavMode }: SidebarLeftSlotProps) {
  if (!enabled) return null;

  const isAdmin = navMode === "admin";

  return (
    <MobileNavDrawer
      asideClassName={cn(
        "relative flex h-full w-full flex-col px-4 py-6 text-foreground shadow-float lg:w-(--sidebar-width) lg:shrink-0 lg:border-r lg:shadow-none",
        isAdmin ? "border-ring bg-(image:--sidebar-bg-admin)" : "border-border bg-(image:--sidebar-bg)",
      )}
    >
      <nav data-nav-mode={navMode} className="flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto">
        {isAdmin
          ? navGroups.map((group, index) => (
              <div key={group.key} className="space-y-1 pb-4">
                {index > 0 && <span aria-hidden="true" className="mb-3 block h-px w-full bg-border" />}
                <p className="px-3 pb-1 text-[11px] font-semibold uppercase tracking-caps text-muted-foreground/70">{group.label}</p>
                {group.items.map((item) => (
                  <SidebarNavLink key={item.key} item={item} collapsed={false} isAdmin />
                ))}
              </div>
            ))
          : navItems.map((item) => <SidebarNavLink key={item.key} item={item} collapsed={false} isAdmin={false} />)}

        {isAdmin && navGroups.length === 0 && <p className="px-3 text-sm text-muted-foreground/56">—</p>}
        {!isAdmin && navItems.length === 0 && <p className="px-3 text-sm text-muted-foreground/56">—</p>}
      </nav>

      {canToggleAdminNav && (
        <div className="mt-3 shrink-0 border-t border-border pt-3">
          <AdminNavSwitch isAdmin={isAdmin} onToggleNavMode={onToggleNavMode} />
        </div>
      )}
    </MobileNavDrawer>
  );
}
