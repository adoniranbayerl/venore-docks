import Link from "next/link";
import type { HeaderSlotProps } from "@/contexts/themes/contracts/types";
import { UserMenu } from "./UserMenu";
import { MobileNavToggleButton } from "./MobileNavToggleButton";
import { PlatformBrand } from "./PlatformBrand";
import { HeaderScrollSentinel } from "./HeaderScrollSentinel";

// Header encolhe e inverte pra bg-primary/text-primary-foreground ao rolar (docs/ui/shell-spec.md
// §2). Continua um server component: o único client real é HeaderScrollSentinel (sibling, abaixo
// de tudo), que escreve `data-scrolled` direto no <header> via DOM depois de detectar o scroll com
// IntersectionObserver. Todo o resto — bg/border/sombra do próprio <header>, nav, login link, user
// menu, botão hamburger — reage via seletor CSS (`data-[scrolled=true]:` no próprio elemento,
// `group-data-[scrolled=true]/header:` nos descendentes), nunca via prop `isScrolled` recomputada
// em React. Único lugar que ainda recebe um `isScrolled` boolean de verdade é PlatformBrand,
// porque esse componente também é usado fora do header (preview estático em
// admin/settings/brand/_components/brand-settings-form.tsx, dois painéis lado a lado sem
// scroll real nenhum) — o valor passado aqui é só o baseline SSR; dentro do header de verdade ele
// é sempre sobrescrito pelas classes group-data (ver comentário em PlatformBrand.tsx).
export function HeaderSlot({ brand, userbarEnabled, headerNavItems, user, canAccessAdmin, onSignOut, userNavItems }: HeaderSlotProps) {
  return (
    <>
      <HeaderScrollSentinel />
      <header
        id="site-header"
        data-scrolled="false"
        className={
          "group/header sticky top-0 z-40 flex h-16 items-center justify-between gap-4 border-b border-header-border-subtle bg-card px-4 text-foreground ui-motion-emphasis sm:px-6 md:h-24 lg:h-28 " +
          "data-[scrolled=true]:h-16 data-[scrolled=true]:border-primary data-[scrolled=true]:bg-primary data-[scrolled=true]:text-primary-foreground data-[scrolled=true]:shadow-header " +
          (brand.position === "center" ? "relative" : "")
        }
      >
        <div className="flex items-center gap-2">
          <MobileNavToggleButton />
          <Link
            href="/"
            aria-label={brand.name}
            className={
              "inline-flex items-center " +
              (brand.position === "center" ? "absolute left-1/2 -translate-x-1/2" : "")
            }
          >
            <PlatformBrand {...brand} isScrolled={false} />
          </Link>
        </div>

        {headerNavItems.length > 0 && (
          <nav className="flex flex-1 items-center justify-center gap-1">
            {headerNavItems.map((item) => (
              <a
                key={item.key}
                href={item.href}
                className="rounded-xl px-3 py-1.5 text-xs font-medium uppercase tracking-caps text-muted-foreground ui-motion-base outline-none hover:bg-accent/14 hover:text-foreground active:bg-accent/14 active:text-foreground focus-visible:ring-2 focus-visible:ring-ring group-data-[scrolled=true]/header:text-primary-foreground group-data-[scrolled=true]/header:hover:bg-primary-foreground/10 group-data-[scrolled=true]/header:hover:text-primary-foreground group-data-[scrolled=true]/header:active:bg-primary-foreground/10 group-data-[scrolled=true]/header:active:text-primary-foreground"
              >
                {item.label}
              </a>
            ))}
          </nav>
        )}

        {userbarEnabled ? (
          user ? (
            <UserMenu user={user} canAccessAdmin={canAccessAdmin} onSignOut={onSignOut} userNavItems={userNavItems} />
          ) : (
            <Link
              href="/login"
              className="rounded-xl px-3 py-1.5 text-xs font-medium uppercase tracking-caps text-muted-foreground ui-motion-base outline-none hover:bg-accent/14 hover:text-foreground active:bg-accent/14 active:text-foreground focus-visible:ring-2 focus-visible:ring-ring group-data-[scrolled=true]/header:text-primary-foreground group-data-[scrolled=true]/header:hover:bg-primary-foreground/10 group-data-[scrolled=true]/header:hover:text-primary-foreground group-data-[scrolled=true]/header:active:bg-primary-foreground/10 group-data-[scrolled=true]/header:active:text-primary-foreground"
            >
              Entrar
            </Link>
          )
        ) : null}
      </header>
    </>
  );
}
