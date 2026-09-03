import Link from "next/link";
import type { BreadcrumbItem } from "@/contexts/themes/contracts/types";

// Trilha minimalista com separador "·" — nem chevron (Slime/Nightcity), nem "/" (Kazordoon).
// Puramente apresentacional, mesmo contrato de slot que os outros três já seguem.
export function Breadcrumbs({
  breadcrumbs,
  breadcrumbsJsonLd,
}: {
  breadcrumbs: BreadcrumbItem[];
  breadcrumbsJsonLd: Record<string, unknown> | null;
}) {
  if (breadcrumbs.length === 0) return null;

  return (
    <>
      <nav aria-label="Breadcrumb" className="border-b border-border/60">
        <ol className="mx-auto flex w-full max-w-6xl flex-wrap items-center gap-2 px-6 py-3 text-sm text-muted-foreground">
          {breadcrumbs.map((item, index) => (
            <li key={item.key} className="flex items-center gap-2">
              {index > 0 && (
                <span aria-hidden="true" className="text-muted-foreground/40">
                  ·
                </span>
              )}
              {item.current ? (
                <span aria-current="page" className="font-medium text-foreground">
                  {item.label}
                </span>
              ) : item.href ? (
                <Link href={item.href} className="ui-motion-base hover:text-foreground">
                  {item.label}
                </Link>
              ) : (
                <span>{item.label}</span>
              )}
            </li>
          ))}
        </ol>
      </nav>
      {breadcrumbsJsonLd && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbsJsonLd) }} />
      )}
    </>
  );
}
