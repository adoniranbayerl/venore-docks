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
//
// T4 (docs/implementation-roadmap.md — Fase 5): stickyEnabled/scrollShrinkEnabled vêm de
// contexts/settings (header.sticky/header.scrollShrink, platform/header-behavior). Quando
// scrollShrinkEnabled é false, HeaderScrollSentinel nem monta — sem ele `data-scrolled` nunca
// sai de "false", então as classes `data-[scrolled=true]:...` simplesmente não casam nunca; não
// precisa de um segundo jogo de classes "sem encolher" pra manter.
export function HeaderSlot({
  brand,
  userbarEnabled,
  stickyEnabled,
  scrollShrinkEnabled,
  headerNavItems,
  user,
  canAccessAdmin,
  onSignOut,
  messageAlert,
  userNavItems,
}: HeaderSlotProps) {
  return (
    <>
      {scrollShrinkEnabled && <HeaderScrollSentinel />}
      <header
        id="site-header"
        data-scrolled="false"
        className={
          "group/header z-40 flex h-16 items-center justify-between gap-4 border-b border-header-border-subtle bg-card px-4 text-foreground ui-motion-emphasis sm:px-6 md:h-24 lg:h-28 " +
          (stickyEnabled ? "sticky top-0 " : "") +
          (scrollShrinkEnabled
            ? "data-[scrolled=true]:h-16 data-[scrolled=true]:border-primary data-[scrolled=true]:bg-primary data-[scrolled=true]:text-primary-foreground data-[scrolled=true]:shadow-header "
            : "") +
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
            <div className="flex items-center gap-2">
              {messageAlert && (
                // Alerta de notificação (mensagem não lida ou atividade avaliada), do lado do
                // user-nav — link e texto já resolvidos pelo registry (deep link pra etapa da aula,
                // ou pra /admin/academy/messages no caso do professor; ver
                // platform/notifications/notification-registry.ts). Tema só renderiza o `label`.
                <Link
                  href={messageAlert.href}
                  className="inline-flex items-center gap-1.5 rounded-xl px-2 py-1.5 text-xs font-medium text-muted-foreground ui-motion-base outline-none hover:bg-accent/14 hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring sm:px-2.5 group-data-[scrolled=true]/header:text-primary-foreground group-data-[scrolled=true]/header:hover:bg-primary-foreground/10"
                >
                  <span className="relative flex size-2">
                    <span className="absolute inline-flex size-full animate-ping rounded-full bg-primary opacity-75 group-data-[scrolled=true]/header:bg-primary-foreground" />
                    <span className="relative inline-flex size-2 rounded-full bg-primary group-data-[scrolled=true]/header:bg-primary-foreground" />
                  </span>
                  <span className="hidden sm:inline">{messageAlert.label}</span>
                </Link>
              )}
              <UserMenu user={user} canAccessAdmin={canAccessAdmin} onSignOut={onSignOut} userNavItems={userNavItems} />
            </div>
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
