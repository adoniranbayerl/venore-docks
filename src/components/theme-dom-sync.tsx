"use client";

import { useEffect } from "react";

// Rede de segurança pro atributo `data-theme` no <html>. A causa real do "ao navegar, o tema
// às vezes volta pro anterior" era o cache em memória de settings (por processo, TTL 300s) num
// deploy multi-instância — resolvido lendo theme.active sem cache
// (contexts/settings/features/get-setting + get-active-theme). Com isso, todo render de servidor
// já emite o <html data-theme> certo, e revalidatePath("/", "layout") no activateThemeAction
// invalida o segmento do root layout em todas as rotas do Router Cache do cliente.
//
// Este componente cobre só o resíduo: garantir que, num render de cliente, o atributo no <html>
// acompanhe o tema resolvido no servidor mesmo que a reconciliação de atributo de <html> em
// navegação soft do App Router escorregue. Sem estado próprio — só espelha a prop.
export function ThemeDomSync({ themeKey }: { themeKey: string }) {
  useEffect(() => {
    if (document.documentElement.dataset.theme !== themeKey) {
      document.documentElement.dataset.theme = themeKey;
    }
  }, [themeKey]);

  return null;
}
