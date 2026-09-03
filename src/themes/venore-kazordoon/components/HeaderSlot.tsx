import Link from "next/link";
import type { HeaderSlotProps } from "@/contexts/themes/contracts/types";
import { PlatformBrand } from "../../venore-slime/components/PlatformBrand";
import { UserMenu } from "../../venore-slime/components/UserMenu";

// Faixa única e estática — sem mecânica de encolher ao rolar (nem do Slime, nem o rail do
// Nightcity), sem botão de menu mobile (não existe drawer off-canvas neste tema — ver
// NavBarSlot.tsx). Só uma borda inferior de 1px, pegada shadcn/vercel: nada de gradiente, nada de
// sombra difusa.
export function HeaderSlot({ brand, userbarEnabled, headerNavItems, user, canAccessAdmin, onSignOut }: HeaderSlotProps) {
  return (
    <header className="sticky top-0 z-40 flex h-14 shrink-0 items-center justify-between gap-6 border-b border-border bg-background px-6 text-foreground">
      <div className="flex min-w-0 items-center gap-6">
        <Link href="/" aria-label={brand.name} className="inline-flex min-w-0 items-center">
          <PlatformBrand {...brand} isScrolled={false} />
        </Link>

        {headerNavItems.length > 0 && (
          <nav className="hidden items-center gap-5 md:flex">
            {headerNavItems.map((item) => (
              <a
                key={item.key}
                href={item.href}
                className="text-sm font-medium text-muted-foreground ui-motion-base outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
              >
                {item.label}
              </a>
            ))}
          </nav>
        )}
      </div>

      {userbarEnabled ? (
        user ? (
          <UserMenu user={user} canAccessAdmin={canAccessAdmin} onSignOut={onSignOut} />
        ) : (
          <Link
            href="/login"
            className="text-sm font-medium text-muted-foreground ui-motion-base outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
          >
            Entrar
          </Link>
        )
      ) : null}
    </header>
  );
}
