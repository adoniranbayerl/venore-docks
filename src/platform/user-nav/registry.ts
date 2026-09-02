import { PLUGIN_CONTRIBUTIONS } from "@/plugins/contributions";
import type { NavItem } from "@/contexts/themes";
import { registerPlugins } from "../plugin-engine/register-plugins";

// Itens que os plugins ativos contribuem pro MENU DO USUÁRIO (user-nav), não pro admin-nav. Vêm
// de src/plugins/*/contributions.ts (campo `userNavItems`), agregados em PLUGIN_CONTRIBUTIONS pelo
// codegen — platform/theme-rendering não pode importar um plugin diretamente (boundary). Só o
// plugin ativo entra.
export async function collectUserNavItems(): Promise<NavItem[]> {
  const pluginReport = await registerPlugins();
  const activePluginKeys = new Set(
    pluginReport.entries.filter((entry) => entry.status === "active").map((entry) => entry.key),
  );

  const items: NavItem[] = [];
  for (const [key, contributions] of Object.entries(PLUGIN_CONTRIBUTIONS)) {
    if (!activePluginKeys.has(key) || !contributions.userNavItems) continue;
    items.push(...(await contributions.userNavItems()));
  }
  return items;
}
