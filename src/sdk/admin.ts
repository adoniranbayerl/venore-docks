// @venore/plugin-sdk/admin — gate "de seção" da rota admin de um plugin. Puxa @/contexts/auth +
// @/contexts/rbac (getAdminPageData), por isso fora do entry raiz: um plugin importa daqui só nas
// páginas de /admin/<plugin>, não no código compartilhado.
export { getPluginAdminPageData } from "@/platform/admin-shell/get-plugin-admin-page-data";
export type { AdminPageGate } from "@/platform/admin-shell/types";
