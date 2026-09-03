"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { useActionToast } from "@/hooks/use-action-toast";
import type { HeaderBehavior } from "@/platform/header-behavior/get-header-behavior";
import { updateHeaderBehaviorAction, type ThemesActionState } from "../actions";

const initialState: ThemesActionState = { error: null };

// T4 (docs/implementation-roadmap.md — Fase 5): page.tsx só renderiza este form quando o tema
// ativo declara manifest.capabilities.headerBehavior (hoje só o Venore Slime), então não precisa
// de aviso condicional aqui — "opções do tema só aparecem pro seu respectivo tema".
export function HeaderBehaviorForm({ behavior }: { behavior: HeaderBehavior }) {
  const [state, formAction, pending] = useActionState(updateHeaderBehaviorAction, initialState);
  useActionToast({ pending, error: state.error, successMessage: "Comportamento do header salvo." });

  return (
    <form action={formAction} className="max-w-xl space-y-4 rounded-panel border border-border bg-card ui-panel-padding-roomy">
      <div>
        <h2 className="text-sm font-semibold text-foreground">Comportamento do header</h2>
        <p className="mt-1 text-xs text-muted-foreground">Configuração do tema ativo (Venore Slime).</p>
      </div>

      <label className="flex items-start gap-2 text-sm text-foreground">
        <input
          type="checkbox"
          name="sticky"
          defaultChecked={behavior.sticky}
          className="mt-0.5 outline-none ui-motion-base focus-visible:ring-2 focus-visible:ring-ring"
        />
        <span>
          Header fixo no topo ao rolar
          <span className="block text-xs text-muted-foreground">Desligado, o header rola junto com o conteúdo.</span>
        </span>
      </label>

      <label className="flex items-start gap-2 text-sm text-foreground">
        <input
          type="checkbox"
          name="scrollShrink"
          defaultChecked={behavior.scrollShrink}
          className="mt-0.5 outline-none ui-motion-base focus-visible:ring-2 focus-visible:ring-ring"
        />
        <span>
          Encolher e inverter cor ao rolar
          <span className="block text-xs text-muted-foreground">
            Só tem efeito visível com o header fixo ligado acima.
          </span>
        </span>
      </label>

      <Button type="submit" disabled={pending}>
        Salvar
      </Button>
    </form>
  );
}
