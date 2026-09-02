import type { ReactNode } from "react";
import type { Block, BlockDefinition } from "@/contexts/cms";
import { PLUGIN_CLIENT_CONTRIBUTIONS } from "@/plugins/contributions.client";

// Mesmo contrato de props de BlockFieldsPanel (block-fields-panel.tsx) — troca de painel é
// transparente pro caller (composition-builder.tsx). Um bloco só ganha um painel aqui quando o
// campo que ele precisa editar não cabe em nenhum EditorFieldType genérico (ex: um compositor
// visual de notas) — todo outro bloco continua sem entrada aqui e usa o BlockFieldsPanel genérico.
export type BlockFieldPanelProps = {
  block: Block;
  definition: BlockDefinition;
  errorMessage: string | null;
  onChange: (data: Record<string, unknown>) => void;
};
export type BlockFieldPanelComponent = (props: BlockFieldPanelProps) => ReactNode;

// Vem de PLUGIN_CLIENT_CONTRIBUTIONS (src/plugins/contributions.client.generated.ts) — o agregado
// CLIENT, gerado pelo codegen a partir dos `contributions.client.ts` de cada plugin, que importam
// os painéis DIRETO de "./blocks/field-panels". Esse caminho nunca passa por
// "@/plugins/contributions" (server) nem por barrel de plugin, que arrastariam blockRenderers ->
// handler -> @/contexts/auth -> next-auth pro bundle client do builder do CMS (mesmo motivo de
// block-renderers.tsx ser "server-only").
// Superset chaveado por block key. Não filtra por plugin ativo: o painel só é consultado
// (composition-builder.tsx: blockFieldPanels[block.key]) pra um bloco que já está no palette, e o
// palette (listBlockDefinitions(activePluginKeys)) é quem remove os blocos de plugin desativado —
// uma entrada órfã aqui nunca é alcançada.
function collectPluginFieldPanels(): Record<string, BlockFieldPanelComponent> {
  return Object.assign(
    {},
    ...Object.values(PLUGIN_CLIENT_CONTRIBUTIONS).map((contributions) => contributions.blockFieldPanels ?? {}),
  );
}

// Exportado como mapa, não como função resolveBlockFieldPanel(key) — o único consumidor
// (composition-builder.tsx) é um client component com hooks, e react-hooks/static-components não
// aceita escolher dinamicamente uma tag JSX a partir do retorno de uma chamada de função dentro do
// corpo de um componente assim; indexar um Record (mesmo padrão de ICON_COMPONENTS em
// block-renderers.tsx) é reconhecido como referência estável.
export const blockFieldPanels: Record<string, BlockFieldPanelComponent> = collectPluginFieldPanels();
