import { Sitemap } from "@/components/sitemap";
import type { FooterSlotProps } from "@/contexts/themes/contracts/types";
import { BrandMark } from "./BrandMark";

// Faixa plana, sem painel de marca em destaque (Venore Slime usava bg-accent/14 + escala 125% na
// logo) — pedido desta sessão foi "poucos efeitos", então marca aqui é só a mesma BrandMark do
// Header em tamanho reduzido + descrição em texto, sem moldura extra. brand.color/logo não são
// consumidos aqui de propósito (mesmo precedente do Venore Pulse: o contrato só exige aceitar o
// campo, não usá-lo).
export function FooterSlot({ brand, sitemapItems, creditsEnabled }: FooterSlotProps) {
  return (
    <footer className="border-t border-border bg-card px-6 py-8">
      <div className="mx-auto flex w-full max-w-6xl flex-wrap items-start justify-between gap-8">
        <div className="min-w-0">
          <BrandMark name={brand.name} size="sm" />
          {brand.description.trim().length > 0 && <p className="mt-2 max-w-[32ch] text-xs text-muted-foreground">{brand.description}</p>}
        </div>

        {sitemapItems.length > 0 && (
          <div className="flex-1 lg:max-w-2xl">
            <Sitemap items={sitemapItems} />
          </div>
        )}
      </div>

      {creditsEnabled && (
        <div data-credits className="mx-auto mt-6 w-full max-w-6xl border-t border-border pt-4 text-xs text-muted-foreground">
          Venore Docks
        </div>
      )}
    </footer>
  );
}
