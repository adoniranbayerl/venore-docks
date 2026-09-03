import Link from "next/link";
import type { HeaderSlotProps } from "@/contexts/themes/contracts/types";
import { cn } from "@/lib/utils";
import { MobileNavToggleButton } from "../../venore-slime/components/MobileNavToggleButton";
import { UserMenu } from "../../venore-slime/components/UserMenu";
import { BrandMark } from "./BrandMark";

// Faixa única de altura fixa, sem mecânica de encolher/inverter cor ao rolar (o Venore Slime tinha
// um HeaderScrollSentinel + troca pra bg-primary; removido de propósito nesta sessão — "poucos
// efeitos"). `scrollShrinkEnabled` do contrato é aceito mas não usado (mesmo precedente do Venore
// Pulse ignorando campos que não fazem sentido pro design); `stickyEnabled` continua respeitado
// porque é a única variação de comportamento que sobra aqui.
export function HeaderSlot({
  brand,
  userbarEnabled,
  stickyEnabled,
  headerNavItems,
  user,
  canAccessAdmin,
  onSignOut,
  messageAlert,
  userNavItems,
}: HeaderSlotProps) {
  return (
    <header
      className={cn(
        "z-40 flex h-16 shrink-0 items-center justify-between gap-6 border-b border-border bg-card px-4 text-foreground shadow-header sm:px-6 md:h-20",
        stickyEnabled && "sticky top-0",
      )}
    >
      <div className="flex min-w-0 items-center gap-3">
        <MobileNavToggleButton />
        <Link href="/" aria-label={brand.name} className="inline-flex min-w-0 items-center">
          <BrandMark name={brand.name} />
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
          <div className="flex items-center gap-2">
            {messageAlert && (
              // Alerta de notificação (mensagem não lida ou atividade avaliada) ao lado do
              // user-nav — mesmo dado/mesma regra do Venore Slime (ver comentário em
              // ../../venore-slime/components/HeaderSlot.tsx), só que com o visual "poucos
              // efeitos" deste tema em vez das classes group-data-scrolled. Tema só renderiza o
              // `label`, já resolvido por quem produziu o alerta.
              <Link
                href={messageAlert.href}
                className="inline-flex items-center gap-1.5 rounded-md px-2 py-1.5 text-sm font-medium text-muted-foreground ui-motion-base outline-none hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring sm:px-2.5"
              >
                <span className="relative flex size-2">
                  <span className="absolute inline-flex size-full animate-ping rounded-full bg-primary opacity-75" />
                  <span className="relative inline-flex size-2 rounded-full bg-primary" />
                </span>
                <span className="hidden sm:inline">{messageAlert.label}</span>
              </Link>
            )}
            <UserMenu user={user} canAccessAdmin={canAccessAdmin} onSignOut={onSignOut} userNavItems={userNavItems} />
          </div>
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
