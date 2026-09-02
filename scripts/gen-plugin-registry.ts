// Gera src/plugins/registry.generated.ts + route-registry.generated.ts +
// contributions.generated.ts + contributions.client.generated.ts a partir dos plugins PRESENTES
// em src/plugins/*/manifest.ts. Roda em postinstall / predev / prebuild / pretypecheck / pretest.
// Um plugin ausente (modelo de repos separados, ver docs/plugins-repos-separados-plano.md)
// simplesmente não entra — nenhum import fixo pra quebrar o build.
//
// Convenção obrigatória do plugin: manifest.ts exporta `<camelKey>Manifest`; se tiver rota,
// routes/route-table.ts exporta `<camelKey>RouteTable`; se contribui código pro core,
// contributions.ts exporta `<camelKey>Contributions` e, quando tem painel de campo de bloco
// custom, contributions.client.ts exporta `<camelKey>ClientContributions`. camelKey = key kebab
// -> camelCase ("company-metrics" -> "companyMetrics").

import { existsSync, readdirSync, writeFileSync } from "node:fs";
import path from "node:path";

const PLUGINS_DIR = path.resolve(process.cwd(), "src/plugins");
const HEADER = "// GERADO por scripts/gen-plugin-registry.ts — NÃO editar à mão (gitignored).\n";

function toCamel(key: string): string {
  return key.replace(/-([a-z0-9])/g, (_, c: string) => c.toUpperCase());
}

function discoverPluginKeys(): string[] {
  return readdirSync(PLUGINS_DIR, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && !entry.name.startsWith("_") && !entry.name.startsWith("."))
    .map((entry) => entry.name)
    .filter((name) => existsSync(path.join(PLUGINS_DIR, name, "manifest.ts")))
    .sort();
}

const keys = discoverPluginKeys();
const routeKeys = keys.filter((key) => existsSync(path.join(PLUGINS_DIR, key, "routes", "route-table.ts")));
const contributionKeys = keys.filter((key) => existsSync(path.join(PLUGINS_DIR, key, "contributions.ts")));
const clientContributionKeys = keys.filter((key) => existsSync(path.join(PLUGINS_DIR, key, "contributions.client.ts")));

const registry =
  HEADER +
  `import type { PluginManifest } from "@/platform/plugin-engine/manifest-schema";\n` +
  keys.map((key) => `import { ${toCamel(key)}Manifest } from "./${key}/manifest";`).join("\n") +
  `\n\nexport const PLUGIN_REGISTRY: PluginManifest[] = [\n` +
  keys.map((key) => `  ${toCamel(key)}Manifest,`).join("\n") +
  `\n];\n`;

const routeRegistry =
  HEADER +
  `import type { PluginRouteTable } from "@/platform/plugin-routing/types";\n` +
  routeKeys.map((key) => `import { ${toCamel(key)}RouteTable } from "./${key}/routes/route-table";`).join("\n") +
  `\n\nexport const PLUGIN_ROUTE_TABLES: Record<string, PluginRouteTable> = {\n` +
  routeKeys.map((key) => `  "${key}": ${toCamel(key)}RouteTable,`).join("\n") +
  `\n};\n`;

const contributionsRegistry =
  HEADER +
  `import type { PluginContributions } from "@/platform/plugin-engine/plugin-contributions";\n` +
  contributionKeys.map((key) => `import { ${toCamel(key)}Contributions } from "./${key}/contributions";`).join("\n") +
  `\n\nexport const PLUGIN_CONTRIBUTIONS: Record<string, PluginContributions> = {\n` +
  contributionKeys.map((key) => `  "${key}": ${toCamel(key)}Contributions,`).join("\n") +
  `\n};\n`;

const clientContributionsRegistry =
  HEADER +
  `import type { PluginClientContributions } from "@/platform/page-builder/plugin-client-contributions";\n` +
  clientContributionKeys
    .map((key) => `import { ${toCamel(key)}ClientContributions } from "./${key}/contributions.client";`)
    .join("\n") +
  `\n\nexport const PLUGIN_CLIENT_CONTRIBUTIONS: Record<string, PluginClientContributions> = {\n` +
  clientContributionKeys.map((key) => `  "${key}": ${toCamel(key)}ClientContributions,`).join("\n") +
  `\n};\n`;

// Só as keys, sem NENHUM import — módulo folha. Consumido por observability/origin-registry.ts
// (muito central); importar o registry.generated (que puxa manifest -> @venore/plugin-sdk)
// fecharia ciclo com o SDK.
const pluginKeys = HEADER + `export const PLUGIN_KEYS: string[] = [${keys.map((k) => `"${k}"`).join(", ")}];\n`;

// Mapa key -> loader preguiçoso do barrel público do plugin (só os presentes com index.ts). Usado
// por importActivePluginBarrel (@venore/plugin-sdk) pra dependência OPCIONAL cross-plugin: um
// plugin ausente simplesmente não tem entrada, sem `import` fixo pra quebrar o build.
const barrelKeys = keys.filter((key) => existsSync(path.join(PLUGINS_DIR, key, "index.ts")));
const pluginBarrels =
  HEADER +
  `export const PLUGIN_BARRELS: Record<string, () => Promise<unknown>> = {\n` +
  barrelKeys.map((key) => `  "${key}": () => import("./${key}"),`).join("\n") +
  `\n};\n`;

writeFileSync(path.join(PLUGINS_DIR, "registry.generated.ts"), registry);
writeFileSync(path.join(PLUGINS_DIR, "route-registry.generated.ts"), routeRegistry);
writeFileSync(path.join(PLUGINS_DIR, "contributions.generated.ts"), contributionsRegistry);
writeFileSync(path.join(PLUGINS_DIR, "contributions.client.generated.ts"), clientContributionsRegistry);
writeFileSync(path.join(PLUGINS_DIR, "plugin-keys.generated.ts"), pluginKeys);
writeFileSync(path.join(PLUGINS_DIR, "plugin-barrels.generated.ts"), pluginBarrels);

console.log(
  `gen-plugin-registry: ${keys.length} plugin(s) [${keys.join(", ")}]; ` +
    `${routeKeys.length} com route-table; ${contributionKeys.length} com contributions; ` +
    `${clientContributionKeys.length} com contributions.client`,
);
