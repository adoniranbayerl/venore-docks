import Link from "next/link";
import type { ThemeShellProps, MainNavItem, NavGroup, SitemapItem } from "@/contexts/themes/contracts/types";

// Prova de que o arranjo estrutural é decisão do tema, não da aplicação
// (docs/themes/shell-contract.md — Abordagem A): mesma forma de dado que venore-slime recebe
// (ThemeShellProps), arranjo espacial completamente diferente — nav horizontal abaixo do header
// em vez de coluna lateral fixa, conteúdo full-width sem coluna reservada, contextual embaixo do
// conteúdo em vez de aside ao lado, header não-sticky. `sidebarLeft.collapsed`/
// `onToggleCollapsed` não fazem sentido nesse arranjo (não existe coluna pra colapsar) — o tema
// simplesmente não usa esses dois campos do contrato, o que o contrato permite (nenhuma prop é
// obrigatória de *usar*, só de aceitar).
export function Shell({ header, footer, sidebarLeft, children, sidebarContextualEnabled, sidebarContextual }: ThemeShellProps) {
  const isAdmin = sidebarLeft.navMode === "admin";

  return (
    <div className="flex min-h-full flex-1 flex-col bg-background text-foreground">
      <header className="flex flex-wrap items-center justify-between gap-4 border-b border-border bg-card px-4 py-3">
        <Link href="/" className="text-base font-bold">
          {header.brand.name}
        </Link>

        {header.headerNavItems.length > 0 && (
          <nav className="flex flex-wrap gap-3">
            {header.headerNavItems.map((item) => (
              <a key={item.key} href={item.href} className="text-sm underline underline-offset-2 hover:no-underline">
                {item.label}
              </a>
            ))}
          </nav>
        )}

        {header.userbarEnabled ? (
          header.user ? (
            <div className="flex items-center gap-3 text-sm">
              <span>{header.user.displayName}</span>
              {header.canAccessAdmin && (
                <form action={sidebarLeft.onToggleNavMode}>
                  <button type="submit" className="border border-border px-2 py-1 text-xs">
                    {isAdmin ? "Site" : "Admin"}
                  </button>
                </form>
              )}
              <form action={header.onSignOut}>
                <button type="submit" className="border border-border px-2 py-1 text-xs">
                  Sair
                </button>
              </form>
            </div>
          ) : (
            <Link href="/login" className="text-sm underline underline-offset-2 hover:no-underline">
              Entrar
            </Link>
          )
        ) : null}
      </header>

      {sidebarLeft.enabled && (
        <nav data-nav-mode={sidebarLeft.navMode} className="border-b border-border bg-muted px-4 py-2">
          {isAdmin ? <NavGroups groups={sidebarLeft.navGroups} /> : <NavTree items={sidebarLeft.navItems} />}
        </nav>
      )}

      <div className="flex-1 px-4 py-6">
        <main>{children}</main>
        {sidebarContextualEnabled && sidebarContextual != null && (
          <div className="mt-6 border-t border-border pt-4">{sidebarContextual}</div>
        )}
      </div>

      <footer className="border-t border-border bg-card px-4 py-4 text-sm text-muted-foreground">
        <p className="font-semibold text-foreground">{footer.brand.name}</p>
        {footer.brand.description.trim().length > 0 && <p className="mt-1 max-w-[40ch] text-xs">{footer.brand.description}</p>}
        <SitemapTree items={footer.sitemapItems} />
        {footer.creditsEnabled && <p className="mt-2 text-xs">Venore Docks</p>}
      </footer>
    </div>
  );
}

function NavTree({ items }: { items: MainNavItem[] }) {
  if (items.length === 0) return <p className="text-sm text-muted-foreground">—</p>;

  return (
    <ul className="flex flex-wrap gap-4">
      {items.map((item) => (
        <li key={item.key}>
          {item.href !== null ? (
            <Link href={item.href} className="text-sm underline underline-offset-2 hover:no-underline">
              {item.label}
            </Link>
          ) : (
            <span className="text-sm font-semibold">
              {item.label}
              <NavTree items={item.children} />
            </span>
          )}
        </li>
      ))}
    </ul>
  );
}

function NavGroups({ groups }: { groups: NavGroup[] }) {
  if (groups.length === 0) return <p className="text-sm text-muted-foreground">—</p>;

  return (
    <div className="flex flex-wrap gap-6">
      {groups.map((group) => (
        <div key={group.key}>
          <p className="text-xs font-semibold uppercase">{group.label}</p>
          <ul className="flex flex-wrap gap-3">
            {group.items.map((item) => (
              <li key={item.key}>
                <Link href={item.href} className="text-sm underline underline-offset-2 hover:no-underline">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

function SitemapTree({ items }: { items: SitemapItem[] }) {
  if (items.length === 0) return null;

  return (
    <ul className="flex flex-wrap gap-4">
      {items.map((item) => (
        <li key={item.key}>
          {item.href ? (
            <a href={item.href} target={item.isExternal ? "_blank" : undefined} rel={item.isExternal ? "noreferrer" : undefined}>
              {item.label}
            </a>
          ) : (
            <span className="font-semibold text-foreground">{item.label}</span>
          )}
          {item.children.length > 0 && <SitemapTree items={item.children} />}
        </li>
      ))}
    </ul>
  );
}
