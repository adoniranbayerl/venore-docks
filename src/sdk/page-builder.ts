// @venore/plugin-sdk/page-builder — server-only. O componente <BlockRenderer> (renderiza uma
// composição de blocos) e a assinatura dos renderers. NÃO fica no entry raiz porque puxa
// block-registry -> @/plugins/contributions, o que fecharia ciclo com o contributions.ts de um
// plugin que importa o entry raiz. Um plugin que renderiza composição no server importa daqui;
// seu contributions.ts continua importando só "@venore/plugin-sdk".
export { BlockRenderer } from "@/components/page-builder/block-renderer";
export type { BlockRendererComponent, BlockRendererProps, BlockRenderMode } from "@/platform/page-builder/block-renderers";
