export * from "@/contexts/media";
// Fica aqui (não no index) porque puxa media-usage-registry -> @/plugins/contributions: só um
// plugin que importa explicitamente "@venore/plugin-sdk/media" paga esse grafo, sem ciclo com o
// contributions.ts dos plugins que só usam o entry raiz.
export { deleteMediaSafely, type DeleteMediaSafelyInput } from "@/platform/media-lifecycle/delete-media-safely";
