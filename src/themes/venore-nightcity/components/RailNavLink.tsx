"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { usePathname } from "next/navigation";
import type { MainNavItem } from "@/contexts/themes/contracts/types";
import { cn } from "@/lib/utils";
import { NavIcon } from "@/platform/nav-icons/NavIcon";

// Item de navegação do rail, com dois estados (pedido desta sessão: "rail com opção de expandir e
// aparecer rótulos", revertendo a simplificação anterior que tinha achatado a árvore e removido o
// flyout):
// - collapsed: só ícone, sempre a mesma largura fixa. Rótulo (e, pra agregador, a lista de
//   filhos) aparece num flyout ao lado, CSS-only via group-hover/group-focus-within — não depende
//   de JS pra abrir/fechar, só pra decidir _o quê_ mostrar (ícone vs ícone+texto).
// - expandido: ícone + rótulo lado a lado, sempre visíveis; agregador vira acordeão inline (usa
//   useState local), mesmo espírito do SidebarNavLink do Venore Slime, mas restyled pro rail
//   (ícone permanece à esquerda, não desaparece ao expandir).
function isDescendantActive(item: MainNavItem, pathname: string | null): boolean {
  if (item.href === null) return item.children.some((child) => isDescendantActive(child, pathname));
  return item.href === pathname;
}

export const ICON_BUTTON_BASE =
  "group/rail-item relative flex items-center gap-3 rounded-sm text-muted-foreground ui-motion-base outline-none hover:scale-[1.02] hover:bg-accent/10 hover:text-primary focus-visible:ring-2 focus-visible:ring-ring";

const COLLAPSED_BUTTON = "size-11 justify-center self-center";
const EXPANDED_BUTTON = "h-11 w-full justify-start px-3";

export const FLYOUT_BASE =
  "pointer-events-none invisible absolute left-full top-1/2 z-50 ml-2 -translate-x-1 -translate-y-1/2 rounded-sm border border-border bg-popover text-popover-foreground opacity-0 shadow-float ui-motion-base group-hover/rail-item:visible group-hover/rail-item:pointer-events-auto group-hover/rail-item:translate-x-0 group-hover/rail-item:opacity-100 group-focus-within/rail-item:visible group-focus-within/rail-item:pointer-events-auto group-focus-within/rail-item:translate-x-0 group-focus-within/rail-item:opacity-100";

// Glow pulsante (@keyframes nightcity-pulse, theme.css) — única animação decorativa deste tema
// além das transições de motion padrão; sinaliza "você está aqui" sem depender só de cor.
const ACTIVE_BAR =
  "absolute left-0 top-1/2 h-6 w-0.5 -translate-y-1/2 rounded-full bg-primary shadow-[0_0_6px_var(--primary)] animate-[nightcity-pulse_2.4s_ease-in-out_infinite]";

export function RailNavLink({ item, collapsed }: { item: MainNavItem; collapsed: boolean }) {
  const pathname = usePathname();
  const isActiveAncestor = item.href === null && isDescendantActive(item, pathname);
  const [expanded, setExpanded] = useState(isActiveAncestor);

  if (item.href === null) {
    if (collapsed) {
      return (
        <div className="relative">
          <button type="button" aria-label={item.label} className={cn(ICON_BUTTON_BASE, COLLAPSED_BUTTON, isActiveAncestor && "text-primary")}>
            {isActiveAncestor && <span aria-hidden="true" className={ACTIVE_BAR} />}
            <NavIcon iconKey={item.icon} className="size-5 shrink-0" />
          </button>
          <div className={cn(FLYOUT_BASE, "w-48 p-1.5")}>
            <p className="px-2 pb-1 text-[10px] font-semibold uppercase tracking-caps text-muted-foreground">{item.label}</p>
            <div className="flex flex-col gap-0.5">
              {item.children.map((child) =>
                child.href === null ? (
                  <p key={child.key} className="px-2 py-1 text-xs text-muted-foreground">
                    {child.label}
                  </p>
                ) : (
                  <Link
                    key={child.key}
                    href={child.href}
                    className="rounded-sm px-2 py-1.5 text-sm ui-motion-base outline-none hover:bg-accent/14 hover:text-primary focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    {child.label}
                  </Link>
                ),
              )}
            </div>
          </div>
        </div>
      );
    }

    const contentId = `rail-nav-group-${item.key}`;

    return (
      <div className="w-full px-2">
        <button
          type="button"
          onClick={() => setExpanded((value) => !value)}
          aria-expanded={expanded}
          aria-controls={contentId}
          className={cn(ICON_BUTTON_BASE, EXPANDED_BUTTON, isActiveAncestor && "text-primary")}
        >
          {isActiveAncestor && <span aria-hidden="true" className={ACTIVE_BAR} />}
          <NavIcon iconKey={item.icon} className="size-5 shrink-0" />
          <span className="flex-1 truncate text-left text-xs font-medium uppercase tracking-caps">{item.label}</span>
          <ChevronDown aria-hidden="true" className={cn("size-4 shrink-0 ui-motion-base", expanded && "rotate-180")} />
        </button>
        {expanded && (
          <div id={contentId} className="ml-5 flex flex-col gap-0.5 border-l border-border py-1 pl-2">
            {item.children.map((child) =>
              child.href === null ? null : <RailNavLink key={child.key} item={child} collapsed={false} />,
            )}
          </div>
        )}
      </div>
    );
  }

  const isActive = pathname === item.href;

  if (collapsed) {
    return (
      <Link
        href={item.href}
        aria-current={isActive ? "page" : undefined}
        title={item.label}
        className={cn(ICON_BUTTON_BASE, COLLAPSED_BUTTON, isActive && "text-primary")}
      >
        {isActive && <span aria-hidden="true" className={ACTIVE_BAR} />}
        <NavIcon iconKey={item.icon} className="size-5 shrink-0" />
        <span className={cn(FLYOUT_BASE, "whitespace-nowrap px-2.5 py-1.5 text-xs font-medium uppercase tracking-caps")}>{item.label}</span>
      </Link>
    );
  }

  return (
    <div className="w-full px-2">
      <Link href={item.href} aria-current={isActive ? "page" : undefined} className={cn(ICON_BUTTON_BASE, EXPANDED_BUTTON, isActive && "text-primary")}>
        {isActive && <span aria-hidden="true" className={ACTIVE_BAR} />}
        <NavIcon iconKey={item.icon} className="size-5 shrink-0" />
        <span className="truncate text-xs font-medium uppercase tracking-caps">{item.label}</span>
      </Link>
    </div>
  );
}
