"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import type { HeaderUserInfo, NavItem } from "@/contexts/themes/contracts/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ColorModeToggle } from "@/components/color-mode-toggle";

function initials(displayName: string) {
  const parts = displayName.trim().split(/\s+/).filter(Boolean);
  const first = parts[0]?.[0] ?? "";
  const last = parts.length > 1 ? parts[parts.length - 1][0] : "";
  return (first + last).toUpperCase() || "?";
}

type UserMenuProps = {
  user: HeaderUserInfo;
  canAccessAdmin: boolean;
  onSignOut: () => Promise<void>;
  // Links contribuídos por plugins ativos (ex.: "Mensagens" do Academy) — ver o mesmo prop no
  // UserMenu do Venore Slime.
  userNavItems?: NavItem[];
};

// Dropdown com <details>/<summary> (mesmo padrão já usado em src/app/(auth)/login/page.tsx) — só
// "use client" pra cobrir o que HTML puro não dá: <details> nativo não fecha sozinho ao clicar
// fora (só reabrir outro <details> do mesmo `name` fecha os demais, e este está sozinho) — bug
// reportado nesta sessão. O listener de mousedown fecha explicitamente quando o clique é fora do
// <details>; abrir/fechar pelo summary, foco e teclado continuam 100% nativos, sem duplicar nada
// disso em JS. `group` aqui é o próprio <details> (abre/fecha o dropdown, sem relação com scroll);
// o estado de scroll do header vem de `group-data-[scrolled=true]/header:`, o group nomeado
// `header` declarado em HeaderSlot.tsx — os dois "group" coexistem porque têm nomes/escopos
// diferentes.
export function UserMenu({ user, canAccessAdmin, onSignOut, userNavItems = [] }: UserMenuProps) {
  const firstName = user.displayName.split(/\s+/)[0];
  const detailsRef = useRef<HTMLDetailsElement>(null);

  useEffect(() => {
    function handleOutsideClick(event: MouseEvent) {
      const details = detailsRef.current;
      if (!details || !details.open) return;
      if (event.target instanceof Node && !details.contains(event.target)) {
        details.open = false;
      }
    }
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  return (
    <details ref={detailsRef} className="group relative">
      <summary className="flex cursor-pointer list-none items-center gap-2 rounded-xl px-1.5 py-1 ui-motion-base outline-none hover:bg-accent/14 active:bg-accent/14 focus-visible:ring-2 focus-visible:ring-ring group-data-[scrolled=true]/header:hover:bg-primary-foreground/10 group-data-[scrolled=true]/header:active:bg-primary-foreground/10 [&::-webkit-details-marker]:hidden">
        <Avatar>
          {user.imageUrl ? <AvatarImage src={user.imageUrl} alt={user.displayName} /> : null}
          <AvatarFallback>{initials(user.displayName)}</AvatarFallback>
        </Avatar>
        <span className="hidden text-sm font-medium sm:inline">{firstName}</span>
      </summary>

      <div className="absolute right-0 top-full z-50 mt-2 w-64 rounded-panel border border-border bg-card p-3 text-foreground shadow-float">
        <div className="border-b border-border pb-3">
          <p className="truncate text-sm font-semibold">{user.displayName}</p>
          {user.email ? <p className="truncate text-xs text-muted-foreground">{user.email}</p> : null}
        </div>

        <div className="flex flex-col gap-1 py-2">
          <ColorModeToggle className="w-full rounded-xl px-2 py-1.5 text-left text-sm text-muted-foreground ui-motion-base outline-none hover:bg-accent/14 hover:text-foreground active:bg-accent/14 active:text-foreground focus-visible:ring-2 focus-visible:ring-ring" />

          {canAccessAdmin ? (
            <Link
              href="/admin"
              className="rounded-xl px-2 py-1.5 text-sm text-muted-foreground ui-motion-base outline-none hover:bg-accent/14 hover:text-foreground active:bg-accent/14 active:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
            >
              Administração
            </Link>
          ) : null}

          <Link
            href="/account"
            className="rounded-xl px-2 py-1.5 text-sm text-muted-foreground ui-motion-base outline-none hover:bg-accent/14 hover:text-foreground active:bg-accent/14 active:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
          >
            Minha conta
          </Link>

          {userNavItems.map((item) => (
            <Link
              key={item.key}
              href={item.href}
              className="rounded-xl px-2 py-1.5 text-sm text-muted-foreground ui-motion-base outline-none hover:bg-accent/14 hover:text-foreground active:bg-accent/14 active:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
            >
              {item.label}
            </Link>
          ))}
        </div>

        <form action={onSignOut} className="border-t border-border pt-2">
          <button
            type="submit"
            className="w-full rounded-xl px-2 py-1.5 text-left text-sm font-medium text-muted-foreground ui-motion-base outline-none hover:bg-accent/14 hover:text-foreground active:bg-accent/14 active:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
          >
            Sair
          </button>
        </form>
      </div>
    </details>
  );
}
