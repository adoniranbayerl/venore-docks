import { ChevronLeft, ChevronRight, X } from "lucide-react";
import type { NavGroup, SidebarLeftSlotProps } from "@/contexts/themes/contracts/types";
import { cn } from "@/lib/utils";
import { MobileNavDrawer } from "../../venore-slime/components/MobileNavDrawer";
import { SidebarNavLink } from "../../venore-slime/components/SidebarNavLink";
import { closeMobileNav } from "../../venore-slime/components/mobile-nav-store";
import { AdminNavSwitch } from "./AdminNavSwitch";
import { RailNavLink } from "./RailNavLink";

// Estrutura deliberadamente diferente da SidebarLeftSlot do Venore Slime (docs/themes/
// shell-contract.md): lá é uma coluna com texto que colapsa/expande, aqui é um rail de ícones que
// também colapsa/expande — mas colapsado aqui significa "só ícone, com flyout no hover", não
// "esconder tudo". `collapsed`/`onToggleCollapsed` do contrato (persistido em cookie, resolvido
// no servidor, sem flash pós-hidratação) continuam em uso.
//
// Pedido desta sessão: switch site/admin e botão de expandir/colapsar sobem pro topo do rail (não
// mais depois da lista de nav), e a lista de nav não rola mais (nem overflow-y-auto nem min-h-0 —
// se a lista for maior que a viewport, ela simplesmente estica o rail, não ganha barra de rolagem
// própria).
export function SidebarLeftSlot({
  enabled,
  navMode,
  navItems,
  navGroups,
  canToggleAdminNav,
  onToggleNavMode,
  collapsed,
  onToggleCollapsed,
}: SidebarLeftSlotProps) {
  if (!enabled) return null;

  const isAdmin = navMode === "admin";

  return (
    <>
      <aside
        className={cn(
          "sticky top-0 hidden h-screen shrink-0 flex-col border-r py-4 ui-motion-emphasis lg:flex",
          collapsed ? "w-(--sidebar-width-rail-collapsed) items-center" : "w-(--sidebar-width-rail-expanded) items-stretch",
          isAdmin ? "border-ring bg-(image:--sidebar-bg-admin)" : "border-border bg-(image:--sidebar-bg)",
        )}
      >
        <div className={cn("flex w-full flex-col gap-3 pb-3", collapsed && "items-center")}>
          <form
            action={onToggleCollapsed}
            className={collapsed ? "flex w-full justify-center" : "flex w-full justify-end px-2"}
          >
            <button
              type="submit"
              aria-expanded={!collapsed}
              aria-label={collapsed ? "Expandir barra lateral" : "Colapsar barra lateral"}
              className="flex size-8 items-center justify-center rounded-sm border border-border bg-card text-foreground ui-motion-base outline-none hover:border-ring hover:text-primary focus-visible:ring-2 focus-visible:ring-ring"
            >
              {collapsed ? <ChevronRight className="size-4" aria-hidden="true" /> : <ChevronLeft className="size-4" aria-hidden="true" />}
            </button>
          </form>

          {canToggleAdminNav && <AdminNavSwitch isAdmin={isAdmin} collapsed={collapsed} onToggleNavMode={onToggleNavMode} />}

          <span aria-hidden="true" className={collapsed ? "h-px w-6 bg-border" : "h-px w-full bg-border"} />
        </div>

        <nav data-nav-mode={navMode} className={cn("flex w-full flex-1 flex-col gap-1", collapsed ? "items-center" : "items-stretch")}>
          {isAdmin
            ? navGroups.map((group, index) => (
                <div key={group.key} className={cn("flex w-full flex-col gap-1", collapsed && "items-center")}>
                  {index > 0 && <span aria-hidden="true" className={collapsed ? "my-1.5 h-px w-6 bg-border" : "my-1.5 h-px w-full bg-border"} />}
                  {group.items.map((item) => (
                    <RailNavLink key={item.key} item={item} collapsed={collapsed} />
                  ))}
                </div>
              ))
            : navItems.map((item) => <RailNavLink key={item.key} item={item} collapsed={collapsed} />)}

          {isAdmin && navGroups.length === 0 && <p className="text-[10px] text-muted-foreground/56">—</p>}
          {!isAdmin && navItems.length === 0 && <p className="text-[10px] text-muted-foreground/56">—</p>}
        </nav>
      </aside>

      {/* Off-canvas mobile — o próprio MobileNavDrawer some em `lg:` (ver asideClassName abaixo);
          o rail acima é quem assume a partir daí. Sempre "expandido" (lista cheia), o estado
          collapsed é exclusivo do desktop, mesmo critério documentado no Slime. */}
      <MobileNavDrawer asideClassName="flex h-full w-full flex-col gap-4 bg-card px-5 py-6 text-foreground shadow-float lg:hidden">
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold uppercase tracking-caps text-muted-foreground">Navegação</p>
          <button
            type="button"
            onClick={closeMobileNav}
            aria-label="Fechar navegação"
            className="ui-icon-button-sm ui-motion-base outline-none hover:bg-accent/14 focus-visible:ring-2 focus-visible:ring-ring"
          >
            <X className="size-4" aria-hidden="true" />
          </button>
        </div>

        {canToggleAdminNav && (
          <div className="rounded-sm border border-border bg-muted py-2">
            <AdminNavSwitch isAdmin={isAdmin} collapsed={false} onToggleNavMode={onToggleNavMode} />
          </div>
        )}

        <nav data-nav-mode={navMode} className="min-h-0 flex-1 space-y-1 overflow-y-auto">
          {isAdmin
            ? navGroups.map((group) => <MobileNavGroup key={group.key} group={group} />)
            : navItems.map((item) => <SidebarNavLink key={item.key} item={item} collapsed={false} isAdmin={false} />)}
          {isAdmin && navGroups.length === 0 && <p className="px-3 text-sm text-muted-foreground/56">—</p>}
          {!isAdmin && navItems.length === 0 && <p className="px-3 text-sm text-muted-foreground/56">—</p>}
        </nav>
      </MobileNavDrawer>
    </>
  );
}

function MobileNavGroup({ group }: { group: NavGroup }) {
  return (
    <div className="space-y-1 pb-4">
      <p className="px-3 pb-1 text-[11px] font-semibold uppercase tracking-caps text-muted-foreground/70">{group.label}</p>
      {group.items.map((item) => (
        <SidebarNavLink key={item.key} item={item} collapsed={false} isAdmin />
      ))}
    </div>
  );
}
