import { describe, expect, it, vi } from "vitest";
import type { BlockDefinition } from "@/contexts/cms";
import type { BlockRendererComponent } from "./block-renderers";

// vitest resolve sem a condition "react-server" do Next — sem isso, o guard de server-only.ts
// lança ao ser importado. Mock vazio só neste arquivo, sem mexer na condition global do vitest.
vi.mock("server-only", () => ({}));

// block-renderers.tsx importa getMediaAsset de @/contexts/media, cujo barrel sobe até
// @/contexts/auth -> next-auth (não resolve neste ambiente). getMediaAsset nunca é chamado aqui.
vi.mock("@/contexts/media", () => ({
  getMediaAsset: async () => ({ success: false, error: { code: "test", message: "mock" } }),
}));

// Sem plugins no repo: um plugin fingido com UM bloco (definition + renderer) exercita a paridade
// entre block-registry e block-renderers e o loader preguiçoso de blockRenderers.
function fakeLeafDefinition(key: string): BlockDefinition {
  return {
    key,
    label: key,
    category: "plugin",
    structure: "leaf",
    defaultData: {},
    editorFields: [],
    allowedInRoot: true,
  };
}

const fakeRenderer: BlockRendererComponent = () => null;

vi.mock("@/plugins/contributions", () => ({
  PLUGIN_CONTRIBUTIONS: {
    alpha: {
      blockDefinitions: [fakeLeafDefinition("alpha.one")],
      // loader preguiçoso, mesma assinatura que block-renderers.tsx espera
      blockRenderers: async () => ({ "alpha.one": fakeRenderer }),
    },
  },
}));

const { listBlockDefinitions } = await import("./block-registry");
const { listBlockRendererKeys, resolveBlockRenderer } = await import("./block-renderers");

// Guarda de regressão: "adicionei bloco e esqueci o render" (ou vice-versa) vira falha de teste
// em vez de bug só visível em runtime.
describe("paridade entre block-registry e block-renderers", () => {
  it("toda key com definition tem um renderer resolvível", async () => {
    for (const definition of listBlockDefinitions()) {
      expect(await resolveBlockRenderer(definition.key), `sem renderer pra key "${definition.key}"`).not.toBeNull();
    }
  });

  it("toda key com renderer registrado tem uma definition correspondente", async () => {
    const definitionKeys = new Set(listBlockDefinitions().map((definition) => definition.key));
    for (const key of await listBlockRendererKeys()) {
      expect(definitionKeys.has(key), `sem definition pra renderer "${key}"`).toBe(true);
    }
  });
});
