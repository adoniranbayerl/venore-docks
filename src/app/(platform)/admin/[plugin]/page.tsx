import { notFound } from "next/navigation";
import { resolveAdminPluginRoute } from "@/platform/plugin-routing/resolve-admin-route";

// Caso "raiz" da rota admin de um plugin: /admin/<plugin> SEM segmento extra. O irmão
// [[...slug]]/page.tsx cobre /admin/<plugin>/a/b/c — mas neste Next um optional catch-all
// ([[...slug]]) aninhado sob um segmento dinâmico ([plugin]) NÃO casa o caminho sem nenhum
// segmento, então /admin/<plugin> caía no catch-all do CMS e virava 404 (era o motivo de o link
// "Erasto League"/"Broadcast" na nav do admin dar "This page could not be found"). Este arquivo é
// só o mesmo dispatch com slug = [].
export default async function AdminPluginRootPage({
  params,
  searchParams,
}: {
  params: Promise<{ plugin: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { plugin } = await params;
  const resolved = await resolveAdminPluginRoute(plugin, []);
  if (!resolved) {
    notFound();
  }

  const { Component, params: routeParams } = resolved;
  return <Component params={Promise.resolve(routeParams)} searchParams={searchParams} />;
}
