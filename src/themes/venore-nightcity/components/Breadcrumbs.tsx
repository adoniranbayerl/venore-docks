import Link from "next/link";
import { ChevronRight } from "lucide-react";
import type { BreadcrumbItem } from "@/contexts/themes/contracts/types";

// Faixa de rota estilo HUD — barra fina com fundo levemente destacado e um ponto neon à esquerda,
// em vez da lista solta e sem chrome do Breadcrumbs do Venore Slime. Puramente apresentacional,
// mesmo contrato de slot (recebe a trilha já resolvida no servidor, nunca busca rota sozinho).
export function Breadcrumbs({
  breadcrumbs,
  breadcrumbsJsonLd,
}: {
  breadcrumbs: BreadcrumbItem[];
  breadcrumbsJsonLd: Record<string, unknown> | null;
}) {
  if (breadcrumbs.length === 0) return null;

  const hasCollapsibleMiddle = breadcrumbs.length > 2;

  return (
    <>
      <nav aria-label="Breadcrumb" className="border-b border-border/70 bg-card/60">
        <div className="mx-auto flex w-full max-w-7xl items-center gap-2 px-6 py-2.5">
          <span aria-hidden="true" className="h-1.5 w-1.5 shrink-0 rounded-full bg-primary shadow-[0_0_6px_var(--primary)]" />
          <ol className="flex flex-wrap items-center gap-1.5 text-xs uppercase tracking-caps text-muted-foreground">
            {breadcrumbs.map((item, index) => {
              const isFirst = index === 0;
              const isLast = index === breadcrumbs.length - 1;
              const isCollapsedOnMobile = hasCollapsibleMiddle && !isFirst && !isLast;

              return (
                <li key={item.key} className={`items-center gap-1.5 ${isCollapsedOnMobile ? "hidden sm:flex" : "flex"}`}>
                  {!isFirst && <ChevronRight aria-hidden="true" className="size-3 shrink-0 text-muted-foreground/50" />}
                  {item.current ? (
                    <span aria-current="page" className="font-semibold text-primary">
                      {item.label}
                    </span>
                  ) : item.href ? (
                    <Link href={item.href} className="ui-motion-base hover:text-foreground">
                      {item.label}
                    </Link>
                  ) : (
                    <span>{item.label}</span>
                  )}
                  {isFirst && hasCollapsibleMiddle && (
                    <span aria-hidden="true" className="flex items-center gap-1.5 sm:hidden">
                      <ChevronRight className="size-3 shrink-0 text-muted-foreground/50" />
                      <span>…</span>
                    </span>
                  )}
                </li>
              );
            })}
          </ol>
        </div>
      </nav>
      {breadcrumbsJsonLd && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbsJsonLd) }} />
      )}
    </>
  );
}
