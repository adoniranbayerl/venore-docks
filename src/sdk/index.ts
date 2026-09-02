// @venore/plugin-sdk — raiz da superfície SERVER / domínio que um plugin pode usar.
//
// A superfície de cada context vem por SUBPATH próprio (espelha a estrutura de hoje, evita
// colisão de nomes entre contexts): `@venore/plugin-sdk/rbac`, `/auth`, `/cms`, `/media`,
// `/settings`, `/import-export`, `/web-push`, `/observability`. Client React em
// `@venore/plugin-sdk/ui`. (Helpers de seed de integração — `/testing` — voltam quando o primeiro
// plugin for reconstruído; cada plugin traz os seus.)
//
// Plano: docs/plugins-repos-separados-plano.md. Enquanto os plugins estão no monorepo, é só um
// alias de tsconfig; na extração (Fase 3) vira pacote publicado, com bundle reescrevendo os `@/…`.
//
// NÃO importar deste entrypoint (nem dos subpaths de context) em componente CLIENT de plugin —
// arrasta `pg`/server-only pro bundle do browser. Client usa "@venore/plugin-sdk/ui".

// --- shared / infra ---
export type { OperationResult } from "@/shared/types";
export { db } from "@/infrastructure/database/client";
export { getCache, setCache, invalidateCache, invalidateCacheByPrefix } from "@/infrastructure/cache/memory-cache";

// --- plugin engine / routing ---
export { isPluginActive } from "@/platform/plugin-engine/is-plugin-active";
export { importActivePluginBarrel } from "@/platform/plugin-engine/import-plugin-barrel";
export type { PluginManifest } from "@/platform/plugin-engine/manifest-schema";
export type { PluginContributions, PluginSeedFn } from "@/platform/plugin-engine/plugin-contributions";
export * from "@/platform/plugin-routing/types";
// NÃO reexportar @/platform/plugin-engine/plugin-seed-registry: ele importa @/plugins/contributions
// (pra RESOLVER seeds), e um plugin que importa deste entry fecharia ciclo em runtime via o
// próprio contributions.ts. Um plugin DECLARA `seeds` no contributions.ts; nunca resolve.

// --- platform helpers usados por plugin ---
export * from "@/platform/brand/get-brand-config";
export * from "@/platform/breadcrumbs/types";
export * from "@/platform/breadcrumbs/define-segment";
export * from "@/platform/media-usage/types";
// deleteMediaSafely NÃO fica aqui: puxa media-usage-registry -> @/plugins/contributions, o que
// fecha um ciclo em runtime com o contributions.ts de qualquer plugin que importe deste entry.
// Vive em "@venore/plugin-sdk/media".
export * from "@/platform/page-builder/rich-text/render";
export * from "@/platform/theme-rendering/resolve-brand-aesthetics";

// Gate "de seção" da rota admin de um plugin (getAdminPageData + plugin ativo + OR das permissions
// da navigation do manifesto). type-only p/ block-renderers: block-renderers.tsx é "server-only",
// mas `export type` não dispara o guard.
export { getPluginAdminPageData } from "@/platform/admin-shell/get-plugin-admin-page-data";
export type { AdminPageGate } from "@/platform/admin-shell/types";
export type {
  BlockRendererComponent,
  BlockRendererProps,
  BlockRenderMode,
} from "@/platform/page-builder/block-renderers";
// NÃO reexportar aqui o componente <BlockRenderer> (@/components/page-builder/block-renderer):
// ele puxa block-registry -> @/plugins/contributions e fecha ciclo em runtime com o
// contributions.ts de qualquer plugin que importe deste entry.
