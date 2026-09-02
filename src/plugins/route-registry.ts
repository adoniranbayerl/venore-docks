// Registro das route-tables dos plugins instalados, chaveado pela `key` do manifesto. O conteúdo
// é GERADO por scripts/gen-plugin-registry.ts (postinstall / predev / prebuild) a partir das
// pastas presentes em src/plugins/*/routes/route-table.ts — ver docs/plugins-repos-separados-plano.md.
// Este arquivo continua sendo o import estável (`import { PLUGIN_ROUTE_TABLES } from
// "@/plugins/route-registry"`).
export { PLUGIN_ROUTE_TABLES } from "./route-registry.generated";
