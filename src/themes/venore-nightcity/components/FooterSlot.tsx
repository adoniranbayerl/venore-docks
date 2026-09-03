import { Sitemap } from "@/components/sitemap";
import type { FooterSlotProps } from "@/contexts/themes/contracts/types";

// Faixa fina, não o bloco alto com painel de marca em destaque do Venore Slime — a identidade
// visual deste tema já mora inteira na Sidebar (rail) e no Header, então o rodapé só precisa
// fechar a página. brand.color (usado pelo Slime como sublinhado de acento sob a marca) não é
// consumido aqui — decisão de design deste tema, o contrato só exige aceitar o campo, não usá-lo
// (mesmo precedente de venore-basic ignorando sidebarLeft.collapsed).
export function FooterSlot({ brand, sitemapItems, creditsEnabled }: FooterSlotProps) {
  return (
    <footer className="mt-auto border-t border-border/70 bg-card/60 px-4 py-4 sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-7xl flex-wrap items-center justify-between gap-x-8 gap-y-4">
        <div className="flex min-w-0 items-center gap-2">
          <span aria-hidden="true" className="h-1.5 w-1.5 shrink-0 rounded-full bg-primary shadow-[0_0_6px_var(--primary)]" />
          <p className="shrink-0 text-xs font-semibold uppercase tracking-caps text-foreground">{brand.name}</p>
          {brand.description.trim().length > 0 && (
            <p className="hidden max-w-[32ch] truncate text-xs text-muted-foreground md:block">{brand.description}</p>
          )}
        </div>

        {sitemapItems.length > 0 && (
          <div className="flex-1 lg:max-w-2xl">
            <Sitemap items={sitemapItems} />
          </div>
        )}
      </div>

      {creditsEnabled && (
        <div data-credits className="mx-auto mt-3 w-full max-w-7xl border-t border-border/70 pt-3 text-xs text-muted-foreground">
          Venore Docks
        </div>
      )}
    </footer>
  );
}
