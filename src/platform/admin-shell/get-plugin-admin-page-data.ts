import { PLUGIN_REGISTRY } from "@/plugins/registry";
import { isPluginActive } from "../plugin-engine/is-plugin-active";
import { getAdminPageData } from "./get-admin-page-data";
import type { AdminPageGate } from "./types";

// Gate "de seção" genérico da rota admin de QUALQUER plugin (docs/venore-docks.md — regra 13).
// Substitui os antigos get-<plugin>-page-data.ts (um arquivo quase idêntico por plugin, cada um
// nomeando o plugin e suas permissions dentro de platform/). As permissions que liberam a seção
// são derivadas do próprio manifesto — a união dos `requiredPermission` dos itens de navigation,
// exatamente o conjunto que já decide se o item de nav aparece. platform/ não conhece nome de
// plugin nenhum: recebe a key e lê só o registro agregado (@/plugins/registry, como
// is-plugin-active.ts / register-plugins.ts).
//
// Semântica preservada dos loaders originais: base admin gate primeiro (propaga negativa como
// está); plugin desabilitado -> forbidden (fecha a rota pra quem digita a URL direto, mesmo com o
// item de nav já escondido via registerPlugins()); acesso = isSuperadmin OU QUALQUER UMA das
// permissions (OR-gate). Sem `requiredPermission` no manifesto, a seção fica só pra superadmin.
export async function getPluginAdminPageData(pluginKey: string): Promise<AdminPageGate> {
  const gate = await getAdminPageData();
  if (!gate.granted) {
    return gate;
  }

  if (!(await isPluginActive(pluginKey))) {
    return { granted: false, reason: "forbidden" };
  }

  const manifest = PLUGIN_REGISTRY.find((entry) => entry.key === pluginKey);
  const sectionPermissions = [
    ...new Set(
      (manifest?.navigation ?? []).flatMap((item) => {
        if (!item.requiredPermission) return [];
        return Array.isArray(item.requiredPermission) ? item.requiredPermission : [item.requiredPermission];
      }),
    ),
  ];

  const hasSectionAccess =
    gate.actor.isSuperadmin || sectionPermissions.some((permission) => gate.actor.permissions.includes(permission));
  if (!hasSectionAccess) {
    return { granted: false, reason: "forbidden" };
  }

  return gate;
}
