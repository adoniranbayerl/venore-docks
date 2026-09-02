import { PLUGIN_CONTRIBUTIONS } from "@/plugins/contributions";
import { registerPlugins } from "../plugin-engine/register-plugins";
import type { NotificationAlert } from "./types";

// Badge no user-nav. Os providers vêm de src/plugins/*/contributions.ts (campo `notificationAlert`),
// agregados em PLUGIN_CONTRIBUTIONS pelo codegen — platform/ não importa um plugin diretamente
// (boundary). Só entra na consulta se o plugin estiver ativo agora: plugin desabilitado nunca
// deveria acender um alerta pra uma página que também está desabilitada. Primeiro alerta não-nulo
// vence — não soma contagens de plugins diferentes, cada um tem seu próprio destino (href).
export async function collectNotificationAlert(): Promise<NotificationAlert> {
  const pluginReport = await registerPlugins();
  const activePluginKeys = new Set(
    pluginReport.entries.filter((entry) => entry.status === "active").map((entry) => entry.key),
  );

  for (const [key, contributions] of Object.entries(PLUGIN_CONTRIBUTIONS)) {
    if (!activePluginKeys.has(key) || !contributions.notificationAlert) continue;
    const alert = await contributions.notificationAlert();
    if (alert) return alert;
  }

  return null;
}
