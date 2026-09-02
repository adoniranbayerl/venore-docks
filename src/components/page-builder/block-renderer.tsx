import type { ReactNode } from "react";
import { isBlockConfigured, type Block, type Composition } from "@/contexts/cms";
import { pluginKeyForBlockKey, resolveBlockDefinition } from "@/platform/page-builder/block-registry";
import { resolveBlockRenderer, type BlockRenderMode } from "@/platform/page-builder/block-renderers";
import { getActivePluginKeys } from "@/platform/plugin-engine/get-active-plugin-keys";

export type { BlockRenderMode };

function isDev() {
  return process.env.NODE_ENV !== "production";
}

// Bloco desconhecido (key sem definition resolvível, ou sem renderer resolvível) não deve
// derrubar a página em produção — entries com composição de um plugin desativado, ou de uma
// versão futura do editor, ainda precisam renderizar o resto. Em dev, um aviso discreto ajuda
// a notar o problema cedo.
function UnknownBlockWarning({ blockKey }: { blockKey: string }) {
  if (!isDev()) {
    return null;
  }
  return (
    <div className="rounded border border-dashed border-destructive/50 p-2 text-xs text-destructive">
      Bloco desconhecido: {blockKey}
    </div>
  );
}

function UnconfiguredBlockPlaceholder({ label, missingMessage }: { label: string; missingMessage: string }) {
  return (
    <div className="rounded border border-dashed border-border p-3 text-xs">
      <p className="font-medium text-muted-foreground">{label}</p>
      <p className="mt-1 text-muted-foreground/56">{missingMessage}</p>
    </div>
  );
}

export async function BlockRenderer({ blocks, mode }: { blocks: Composition; mode: BlockRenderMode }) {
  // Resolvido uma vez por árvore de render: um bloco cuja key pertence a um plugin hoje
  // desativado não renderiza (nem no público, nem no preview do builder) — trata-se como bloco
  // desconhecido, mesma degradação graciosa de uma key sem definition. registerPlugins() por
  // trás tem cache curto próprio.
  const activePluginKeys = await getActivePluginKeys();
  return <>{await renderBlocks(blocks, mode, activePluginKeys)}</>;
}

async function renderBlocks(
  blocks: Composition,
  mode: BlockRenderMode,
  activePluginKeys: ReadonlySet<string>,
): Promise<ReactNode[]> {
  return Promise.all(blocks.map((block) => renderBlock(block, mode, activePluginKeys)));
}

async function renderBlock(
  block: Block,
  mode: BlockRenderMode,
  activePluginKeys: ReadonlySet<string>,
): Promise<ReactNode> {
  const owningPluginKey = pluginKeyForBlockKey(block.key);
  if (owningPluginKey && !activePluginKeys.has(owningPluginKey)) {
    return <UnknownBlockWarning key={block.id} blockKey={block.key} />;
  }

  const definition = resolveBlockDefinition(block.key);
  if (!definition) {
    return <UnknownBlockWarning key={block.id} blockKey={block.key} />;
  }

  if (!isBlockConfigured(definition, block.data)) {
    if (mode === "published") {
      return null;
    }
    return (
      <UnconfiguredBlockPlaceholder
        key={block.id}
        label={definition.label}
        missingMessage={definition.missingConfigMessage ?? "Bloco não configurado."}
      />
    );
  }

  const Renderer = await resolveBlockRenderer(block.key);
  if (!Renderer) {
    return <UnknownBlockWarning key={block.id} blockKey={block.key} />;
  }

  return (
    <Renderer
      key={block.id}
      block={block}
      mode={mode}
      renderBlocks={(children) => renderBlocks(children, mode, activePluginKeys)}
    />
  );
}
