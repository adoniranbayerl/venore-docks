import { PLUGIN_ROUTE_TABLES } from "@/plugins/route-registry";
import { isPluginActive } from "@/platform/plugin-engine/is-plugin-active";
import { matchPluginRoutes } from "./match-route";
import type { ResolvedPluginPageRoute } from "./resolve-admin-route";

// Slot paralelo @sidebarContextual (coluna contextual do layout). Diferente de
// resolvePublicPluginRoute, aqui não há estado "reserved-not-found": um slot que não casa — ou
// casa com um plugin desativado — simplesmente não renderiza nada (retorna null). O dispatcher
// físico é único: src/app/(platform)/@sidebarContextual/[[...slug]]/page.tsx. Padrões da área
// `sidebarContextual` são caminhos completos (ex: "academy/:courseSlug/:lessonId").
export async function resolveSidebarContextualPluginRoute(
  segments: string[],
): Promise<ResolvedPluginPageRoute | null> {
  for (const [pluginKey, table] of Object.entries(PLUGIN_ROUTE_TABLES)) {
    if (!table.sidebarContextual) {
      continue;
    }

    const matched = matchPluginRoutes(table.sidebarContextual, segments);
    if (!matched) {
      continue;
    }

    if (!(await isPluginActive(pluginKey))) {
      return null;
    }

    return { Component: matched.route.Component, params: matched.params };
  }

  return null;
}
