import { describe, expect, it, vi } from "vitest";
import type { BlockDefinition } from "@/contexts/cms";

// Sem plugins no repo (docs/plugins-repos-separados-plano.md) os blocos de plugin são fingidos
// aqui: BlockDefinition é dado puro serializável, então uma fixture local exercita a mesma
// agregação de block-registry.ts sem depender de nenhum plugin.
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

vi.mock("@/plugins/contributions", () => ({
  PLUGIN_CONTRIBUTIONS: {
    alpha: { blockDefinitions: [fakeLeafDefinition("alpha.one"), fakeLeafDefinition("alpha.two")] },
    beta: { blockDefinitions: [fakeLeafDefinition("beta.one")] },
  },
}));

const { listBlockDefinitions } = await import("./block-registry");

// Guarda de regressão: BlockDefinition atravessa o boundary RSC como prop de client component
// (builder), então precisa ser dado puro e serializável — nenhuma função, Date, Map, Set ou
// componente escondido dentro. Isso transforma esse tipo de erro (só visível em runtime, no
// builder) em falha de teste.
describe("listBlockDefinitions", () => {
  it("returns only JSON-serializable definitions", () => {
    for (const definition of listBlockDefinitions()) {
      const roundTripped = JSON.parse(JSON.stringify(definition));
      expect(roundTripped).toEqual(definition);
    }
  });

  it("inclui os blocos contribuídos por plugin além dos de core", () => {
    const keys = listBlockDefinitions().map((definition) => definition.key);
    expect(keys).toContain("alpha.one");
    expect(keys).toContain("beta.one");
    expect(keys).toContain("core.content.heading");
  });
});
