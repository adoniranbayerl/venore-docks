import type { SidebarLeftSlotProps } from "@/contexts/themes/contracts/types";
import { AdminNavSwitch } from "./AdminNavSwitch";
import { NavGroupTab, NavTab } from "./NavTab";

// Substitui a SidebarLeft dos outros dois temas (coluna colapsável no Slime, rail de ícones no
// Nightcity) por uma barra horizontal de abas sublinhadas sob o Header — pedido desta sessão:
// shell diferente dos outros dois + pegada shadcn/vercel, cujo padrão de navegação secundária mais
// reconhecível é justamente esse (não um sidebar de jeito nenhum). `collapsed`/`onToggleCollapsed`
// do contrato não têm o que significar numa barra horizontal (não existe coluna pra colapsar) —
// não são usados aqui, o contrato permite (nenhuma prop é obrigatória de *usar*, só de aceitar,
// mesmo precedente de venore-basic e do rail do Nightcity ignorando/reaproveitando campos
// seletivamente). Sem drawer off-canvas nem mobile-nav-store: em telas estreitas a barra quebra
// linha (flex-wrap), não rola (overflow-x-auto, versão anterior desta sessão) — um container com
// overflow-x:auto força overflow-y:auto também (acoplamento do próprio CSS, não escolha nossa), e
// isso vira um clipping box: o dropdown de NavTab/NavGroupTab (position:absolute, mesmo <nav> como
// ancestral) ficava cortado e ganhava scroll interno em vez de sobrepor a página. flex-wrap não
// declara overflow nenhum, então o dropdown volta a sobrepor livremente.
export function NavBarSlot({ enabled, navMode, navItems, navGroups, canToggleAdminNav, onToggleNavMode }: SidebarLeftSlotProps) {
  if (!enabled) return null;

  const isAdmin = navMode === "admin";

  return (
    <div className="border-b border-border bg-background">
      <div className="mx-auto flex w-full max-w-6xl items-center gap-4 px-6">
        <nav data-nav-mode={navMode} className="flex min-w-0 flex-1 flex-wrap items-center gap-1">
          {isAdmin
            ? navGroups.map((group) => <NavGroupTab key={group.key} group={group} />)
            : navItems.map((item) => <NavTab key={item.key} item={item} />)}

          {isAdmin && navGroups.length === 0 && <p className="text-sm text-muted-foreground/56">—</p>}
          {!isAdmin && navItems.length === 0 && <p className="text-sm text-muted-foreground/56">—</p>}
        </nav>

        {canToggleAdminNav && <AdminNavSwitch isAdmin={isAdmin} onToggleNavMode={onToggleNavMode} />}
      </div>
    </div>
  );
}
