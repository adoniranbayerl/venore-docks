// Reexport estável do agregado CLIENT gerado (contributions.client.generated.ts, gitignored,
// escrito por scripts/gen-plugin-registry.ts). Paralelo a contributions.ts / registry.ts /
// route-registry.ts. Consumido só por platform/page-builder/block-field-panels.ts — este caminho
// nunca passa por @/plugins/contributions (server) nem por barrel de plugin, então é seguro
// alcançá-lo a partir do builder do CMS ("use client").
export { PLUGIN_CLIENT_CONTRIBUTIONS } from "./contributions.client.generated";
