import { PLUGIN_KEYS } from "@/plugins/plugin-keys.generated";

// Convenção do projeto (AGENTS.md seção 1): useCase é sempre "<nome>.<feature>...", onde <nome>
// é o context ou plugin que originou a chamada (ex: "rbac.role-assignment.grant-superadmin" →
// "rbac"). CONTEXT_NAMES espelha src/contexts (curado — os contexts do core são fixos); os nomes
// de plugin vêm de plugin-keys.generated.ts (módulo folha, sem imports — este arquivo é muito
// central pra depender do registry, que puxa manifest -> @venore/plugin-sdk).
const CONTEXT_NAMES = ["auth", "cms", "extensions", "media", "rbac", "settings", "themes"];
const PLUGIN_NAMES = new Set(PLUGIN_KEYS);

export function inferOriginFromUseCase(useCase: string): string {
  const prefix = useCase.split(".")[0];
  if (CONTEXT_NAMES.includes(prefix)) return `context:${prefix}`;
  if (PLUGIN_NAMES.has(prefix)) return `plugin:${prefix}`;
  return `context:${prefix}`;
}
