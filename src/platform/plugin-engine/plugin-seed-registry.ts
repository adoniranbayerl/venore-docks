import { PLUGIN_CONTRIBUTIONS } from "@/plugins/contributions";
import type { PluginSeedFn } from "./plugin-contributions";

// `PluginSeedFn` mora em plugin-contributions.ts agora; re-exportado aqui pra não quebrar os
// `import type { PluginSeedFn } from "@/platform/plugin-engine/plugin-seed-registry"` dos plugins.
export type { PluginSeedFn };

// Os seeds contribuídos por plugin vêm de src/plugins/*/contributions.ts (campo `seeds`),
// agregados em PLUGIN_CONTRIBUTIONS pelo codegen — nada mais é enumerado à mão aqui.
export function resolvePluginSeed(pluginKey: string, seedKey: string): PluginSeedFn | null {
  return PLUGIN_CONTRIBUTIONS[pluginKey]?.seeds?.[seedKey] ?? null;
}

export function listPluginSeedKeys(pluginKey: string): string[] {
  return Object.keys(PLUGIN_CONTRIBUTIONS[pluginKey]?.seeds ?? {});
}
