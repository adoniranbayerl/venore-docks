import Link from "next/link";
import type { HeaderSlotProps } from "@/contexts/themes/contracts/types";
import { MobileNavToggleButton } from "../../venore-slime/components/MobileNavToggleButton";
import { PlatformBrand } from "../../venore-slime/components/PlatformBrand";
import { UserMenu } from "../../venore-slime/components/UserMenu";

// Faixa única, full-width, sem mecânica de encolher ao rolar — calma de propósito ("sóbrio").
// O ponto aceso ao lado da marca é o ÚNICO lugar da interface onde a animação de pulso aparece
// (@keyframes pulse-glow, theme.css) — pedido desta sessão: "acentuação... não exagerada" é um
// efeito pontual, não espalhado por vários componentes.
export function HeaderSlot({ brand, userbarEnabled, headerNavItems, user, canAccessAdmin, onSignOut }: HeaderSlotProps) {
  return (
    <header className="sticky top-0 z-40 flex h-16 shrink-0 items-center justify-between gap-6 border-b border-border bg-card px-4 text-foreground shadow-header sm:px-6">
      <div className="flex min-w-0 items-center gap-3">
        <MobileNavToggleButton />
        <Link href="/" aria-label={brand.name} className="inline-flex min-w-0 items-center gap-2">
          <PlatformBrand {...brand} isScrolled={false} />
          <span aria-hidden="true" className="size-1.5 shrink-0 rounded-full bg-accent animate-[pulse-glow_2.8s_ease-in-out_infinite]" />
        </Link>
      </div>

      {headerNavItems.length > 0 && (
        <nav className="hidden flex-1 items-center justify-center gap-1 md:flex">
          {headerNavItems.map((item) => (
            <a
              key={item.key}
              href={item.href}
              className="rounded-md px-3 py-1.5 text-sm font-medium text-muted-foreground ui-motion-base outline-none hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
            >
              {item.label}
            </a>
          ))}
        </nav>
      )}

      {userbarEnabled ? (
        user ? (
          <UserMenu user={user} canAccessAdmin={canAccessAdmin} onSignOut={onSignOut} />
        ) : (
          <Link
            href="/login"
            className="rounded-md px-3 py-1.5 text-sm font-medium text-muted-foreground ui-motion-base outline-none hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
          >
            Entrar
          </Link>
        )
      ) : null}
    </header>
  );
}
