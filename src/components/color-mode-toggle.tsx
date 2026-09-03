"use client";

import { useSyncExternalStore } from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

const subscribeNever = () => () => {};

// Autocontido via next-themes — o próprio next-themes é a fonte de estado do color mode agora
// (docs/venore-docks.md — "Contrato de slot": exceção deliberada ao princípio "tema nunca lê
// estado sozinho", decisão do usuário registrada em contexts/themes/contracts/contract-version.ts).
// useSyncExternalStore (não useState+useEffect) pra saber se já montou no client: servidor não
// sabe o tema resolvido, e a regra react-hooks/set-state-in-effect proíbe setState síncrono
// dentro de effect.
export function ColorModeToggle({ className }: { className?: string }) {
  const { resolvedTheme, setTheme, forcedTheme } = useTheme();
  const mounted = useSyncExternalStore(
    subscribeNever,
    () => true,
    () => false,
  );

  // Tema single-mode: o root layout passa `forcedTheme` pro ThemeProvider (manifest.colorModes
  // com um valor só). Não há o que alternar — o botão não se renderiza.
  if (forcedTheme) return null;

  const isDark = mounted && resolvedTheme === "dark";

  return (
    <button
      type="button"
      className={"inline-flex items-center gap-2 " + (className ?? "")}
      onClick={() => setTheme(isDark ? "light" : "dark")}
    >
      {isDark ? <Sun className="size-4 shrink-0" aria-hidden="true" /> : <Moon className="size-4 shrink-0" aria-hidden="true" />}
      {isDark ? "Modo claro" : "Modo escuro"}
    </button>
  );
}
