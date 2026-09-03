"use client";

import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { usePathname } from "next/navigation";
import type { MainNavItem, NavGroup } from "@/contexts/themes/contracts/types";
import { cn } from "@/lib/utils";

// Aba de navegação horizontal — sublinhado ativo em âmbar, não pill de fundo (padrão de tab
// shadcn/vercel, diferente do bg-accent/14 do Slime e do rail de ícones do Nightcity). Client
// component só por causa de usePathname (mesmo motivo do SidebarNavLink do Slime); dropdown de
// agregador/grupo usa <details>/<summary> nativo — sem useState, sem store — `name` compartilhado
// faz o browser fechar um dropdown irmão automaticamente quando outro abre.
function isDescendantActive(item: MainNavItem, pathname: string | null): boolean {
  if (item.href === null) return item.children.some((child) => isDescendantActive(child, pathname));
  return item.href === pathname;
}

const TAB_BASE =
  "inline-flex h-11 shrink-0 items-center gap-1.5 whitespace-nowrap border-b-2 border-transparent px-1 text-sm font-medium text-muted-foreground ui-motion-base outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring";
const TAB_ACTIVE = "border-accent text-foreground";
const DROPDOWN_PANEL =
  "absolute left-0 top-full z-30 mt-1 min-w-44 rounded-md border border-border bg-popover p-1 text-popover-foreground shadow-float";
const DROPDOWN_LINK =
  "block rounded-sm px-2.5 py-1.5 text-sm ui-motion-base outline-none hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring";

export function NavTab({ item }: { item: MainNavItem }) {
  const pathname = usePathname();

  if (item.href === null) {
    const isActiveAncestor = isDescendantActive(item, pathname);

    return (
      <details name="kazordoon-nav" className="group/tab relative">
        <summary className={cn(TAB_BASE, "cursor-pointer list-none [&::-webkit-details-marker]:hidden", isActiveAncestor && TAB_ACTIVE)}>
          {item.label}
          <ChevronDown aria-hidden="true" className="size-3.5 shrink-0 ui-motion-base group-open/tab:rotate-180" />
        </summary>
        <div className={DROPDOWN_PANEL}>
          {item.children.map((child) =>
            child.href === null ? (
              <p key={child.key} className="px-2.5 py-1.5 text-xs text-muted-foreground">
                {child.label}
              </p>
            ) : (
              <Link key={child.key} href={child.href} className={DROPDOWN_LINK}>
                {child.label}
              </Link>
            ),
          )}
        </div>
      </details>
    );
  }

  const isActive = pathname === item.href;

  return (
    <Link href={item.href} aria-current={isActive ? "page" : undefined} className={cn(TAB_BASE, isActive && TAB_ACTIVE)}>
      {item.label}
    </Link>
  );
}

export function NavGroupTab({ group }: { group: NavGroup }) {
  const pathname = usePathname();
  const isActiveAncestor = group.items.some((item) => item.href === pathname);

  return (
    <details name="kazordoon-nav" className="group/tab relative">
      <summary className={cn(TAB_BASE, "cursor-pointer list-none [&::-webkit-details-marker]:hidden", isActiveAncestor && TAB_ACTIVE)}>
        {group.label}
        <ChevronDown aria-hidden="true" className="size-3.5 shrink-0 ui-motion-base group-open/tab:rotate-180" />
      </summary>
      <div className={DROPDOWN_PANEL}>
        {group.items.map((item) => (
          <Link key={item.key} href={item.href} aria-current={pathname === item.href ? "page" : undefined} className={DROPDOWN_LINK}>
            {item.label}
          </Link>
        ))}
      </div>
    </details>
  );
}
