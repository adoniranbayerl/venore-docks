import type { SidebarLeftSlotProps } from "@/contexts/themes/contracts/types";
import { cn } from "@/lib/utils";
import { MobileNavDrawer } from "../../venore-slime/components/MobileNavDrawer";
import { SidebarNavLink } from "../../venore-slime/components/SidebarNavLink";
import { AdminNavSwitch } from "./AdminNavSwitch";

// Largura única, sem colapso — nem rail de ícones, nem coluna que expande/encolhe: pedido desta
// sessão foi "poucos efeitos", e um dos efeitos mais chamativos do Venore Slime era exatamente o
// botão flutuante circular de colapso com sombra + a transição de largura. `collapsed`/
// `onToggleCollapsed` do contrato não são usados aqui de propósito (mesmo precedente do Venore
// Pulse: nenhuma prop é obrigatória de *usar*, só de aceitar).
//
// MobileNavDrawer e SidebarNavLink são os mesmos componentes do Venore Slime, reaproveitados como
// estão: são mecânica genérica (off-canvas com focus-trap/Escape/scroll-lock) e widget de folha
// 100% orientado a token — a identidade "simples e premium" deste tema vem inteira do theme.css
// (fundo sólido em vez de gradiente, sombra rasa) e da moldura em volta deles aqui, não de reescrever
// os dois de novo.
export function SidebarLeftSlot({ enabled, navMode, navItems, navGroups, canToggleAdminNav, onToggleNavMode }: SidebarLeftSlotProps) {
  if (!enabled) return null;

  const isAdmin = navMode === "admin";

  return (
    <MobileNavDrawer
      asideClassName={cn(
        "relative flex h-full w-full flex-col px-4 py-6 text-foreground shadow-float lg:w-(--sidebar-width) lg:shrink-0 lg:border-r lg:shadow-none",
        isAdmin ? "border-ring bg-(--sidebar-bg-admin)" : "border-border bg-(--sidebar-bg)",
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
