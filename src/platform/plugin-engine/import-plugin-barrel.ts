import { PLUGIN_BARRELS } from "@/plugins/plugin-barrels.generated";
import { isPluginActive } from "./is-plugin-active";

// Dependência OPCIONAL cross-plugin (docs/plugins-repos-separados-plano.md; docs/venore-docks.md —
// "Sistema de plugins"). Um plugin que declara `dependencies: [{ pluginKey, type: "optional" }]`
// no manifesto consome o OUTRO plugin só assim: o barrel é carregado por `import()` preguiçoso
// (mapa gerado — plugin ausente não tem entrada, nada quebra o build) e só quando o outro plugin
// está ATIVO agora. Retorna null quando o plugin não está presente/instalado/ativo — o chamador
// degrada a feature (esconde o atalho, recusa com erro claro etc.).
export async function importActivePluginBarrel<T = unknown>(pluginKey: string): Promise<T | null> {
  const loader = PLUGIN_BARRELS[pluginKey];
  if (!loader) return null;
  if (!(await isPluginActive(pluginKey))) return null;
  return (await loader()) as T;
}
