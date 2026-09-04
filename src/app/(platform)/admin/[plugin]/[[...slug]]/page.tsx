import { notFound } from "next/navigation";
import { resolveAdminPluginRoute } from "@/platform/plugin-routing/resolve-admin-route";

// Único ponto de entrada de rota admin de plugin em app/ — nenhuma pasta nomeada por plugin existe
// mais debaixo de admin/** (era admin/broadcast, admin/donations, admin/birthdays, admin/academy,
// admin/enrollment-dashboard, cada uma com sua própria árvore de sub-rotas). A tabela de rotas de
// cada plugin (src/plugins/<nome>/routes/route-table.ts) decide o resto — instalar uma rota admin
// nova num plugin não toca em app/ nunca mais.
export default async function AdminPluginRoutePage({
  params,
  searchParams,
}: {
  params: Promise<{ plugin: string; slug?: string[] }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { plugin, slug } = await params;
  // Normaliza: neste Next o optional catch-all pode entregar `[""]` (ou `[]`) pra /admin/<plugin>
  // sem segmento extra — sem filtrar os vazios, o padrão "" da route-table do plugin (raiz) não
  // casava e a rota virava 404 (o link "Erasto League"/"Broadcast" na nav do admin).
  const segments = (slug ?? []).filter((segment) => segment.length > 0);
  const resolved = await resolveAdminPluginRoute(plugin, segments);
  if (!resolved) {
    console.error(
      `[admin-plugin-route] sem match: plugin=${JSON.stringify(plugin)} rawSlug=${JSON.stringify(slug)} segments=${JSON.stringify(segments)}`,
    );
    notFound();
  }

  const { Component, params: routeParams } = resolved;
  return <Component params={Promise.resolve(routeParams)} searchParams={searchParams} />;
}
