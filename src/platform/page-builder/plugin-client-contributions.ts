import type { BlockFieldPanelComponent } from "./block-field-panels";

// Contraparte CLIENT de PluginContributions (plugin-engine/plugin-contributions.ts): só o que um
// plugin contribui pro page-builder e que é alcançável a partir do builder do CMS
// (composition-builder.tsx é "use client"). Hoje só `blockFieldPanels` — painel de edição 100%
// custom pra um bloco cujo campo não cabe em nenhum EditorFieldType genérico.
//
// Um plugin declara isso num `contributions.client.ts` na raiz da pasta, importando os painéis
// DIRETO de "./blocks/field-panels" (nunca do barrel index.ts, nunca de blocks/index.ts — os dois
// arrastam blockRenderers -> handler -> @/contexts/auth -> next-auth pro bundle client). O codegen
// agrega os presentes em src/plugins/contributions.client.generated.ts, e block-field-panels.ts
// itera esse mapa — sem passar por @/plugins/contributions (server) nem por barrel de plugin.
//
// O import de BlockFieldPanelComponent aqui é `import type` de propósito: block-field-panels.ts
// consome o agregado gerado, que reimporta este módulo — o ciclo é só de tipo, apagado em runtime.
export type PluginClientContributions = {
  blockFieldPanels?: Record<string, BlockFieldPanelComponent>;
};
