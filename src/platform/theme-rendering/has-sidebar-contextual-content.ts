import { PLUGIN_ROUTE_TABLES } from "@/plugins/route-registry";

// Único jeito confiável de saber se a rota atual tem conteúdo contextual de verdade. O prop
// `sidebarContextual` que (platform)/layout.tsx recebe do slot paralelo @sidebarContextual NUNCA
// é o `null` literal do JS, mesmo quando o page.tsx/default.tsx que casou devolve null — é sempre
// uma referência de elemento React (confirmado: /admin, sem nenhuma rota própria dentro de
// @sidebarContextual, ainda chegava com `sidebarContextual !== null`) — comparar contra null
// nunca funciona. E mesmo se funcionasse pra carga inicial, o slot é vulnerável ao mesmo problema
// que motivou RouteChangeRefresher (breadcrumbs/route-change-refresher.tsx): App Router não
// re-renderiza um layout persistido em navegação client-side entre rotas que o compartilham, só a
// página filha — o slot contextual pode ficar preso no conteúdo da rota anterior até algo forçar
// um refresh.
//
// A saída: decidir por padrão de rota, a partir do pathname (mesmo header que resolve-
// breadcrumbs.ts já lê, atualizado a cada navegação pelo mesmo RouteChangeRefresher) — nunca pelo
// valor do prop em si. Os padrões vêm da área `sidebarContextual` das route-tables de plugin
// (PLUGIN_ROUTE_TABLES) — o core não enumera rota de plugin à mão. Ex: pattern
// "academy/:courseSlug/:lessonId" vira /^\/academy\/[^/]+\/[^/]+$/.
const SIDEBAR_CONTEXTUAL_ROUTE_PATTERNS: RegExp[] = Object.values(PLUGIN_ROUTE_TABLES)
  .flatMap((table) => table.sidebarContextual ?? [])
  .map((entry) => {
    const body = entry.pattern
      .split("/")
      .map((segment) => (segment.startsWith(":") ? "[^/]+" : segment.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")))
      .join("/");
    return new RegExp(`^/${body}$`);
  });

export function hasSidebarContextualContent(pathname: string | null): boolean {
  if (!pathname) return false;
  return SIDEBAR_CONTEXTUAL_ROUTE_PATTERNS.some((pattern) => pattern.test(pathname));
}
