import { describe, expect, it, vi } from "vitest";
import type { BlockDefinition } from "@/contexts/cms";

// Blocos de plugin fingidos (sem plugins no repo) — a lógica sob teste é o FILTRO por plugin
// ativo de block-registry.ts, que não depende de nenhum plugin real.
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
    alpha: { blockDefinitions: [fakeLeafDefinition("alpha.one")] },
    beta: { blockDefinitions: [fakeLeafDefinition("beta.one"), fakeLeafDefinition("beta.two")] },
  },
}));

const { listBlockDefinitions, pluginKeyForBlockKey } = await import("./block-registry");

function allAllowedBlockKeys(definitions: { areaDefinitions?: { allowedBlockKeys: string[] }[] }[]): string[] {
  return definitions.flatMap((definition) => definition.areaDefinitions?.flatMap((area) => area.allowedBlockKeys) ?? []);
}

describe("listBlockDefinitions — filtro por plugin ativo", () => {
  it("sem activePluginKeys devolve todo bloco instalado (paridade com o comportamento antigo)", () => {
    const keys = listBlockDefinitions().map((definition) => definition.key);
    expect(keys).toContain("alpha.one");
    expect(keys).toContain("beta.one");
    expect(keys).toContain("beta.two");
  });

  it("um plugin fora do set não contribui bloco — nem no palette, nem como opção de área aninhada", () => {
    const active = new Set(["alpha"]); // beta desativado

    const definitions = listBlockDefinitions(active);
    const keys = definitions.map((definition) => definition.key);

    expect(keys).not.toContain("beta.one");
    expect(keys).not.toContain("beta.two");
    expect(keys).toContain("alpha.one");

    // nenhuma área aninhada (row/section/accordion-item/tabs-item) oferece um bloco de beta como
    // destino de drop
    expect(allAllowedBlockKeys(definitions).filter((key) => key.startsWith("beta."))).toEqual([]);
  });

  it("com todos os plugins ativos o resultado é igual ao sem filtro", () => {
    const active = new Set(["alpha", "beta"]);
    expect(listBlockDefinitions(active).map((d) => d.key).sort()).toEqual(
      listBlockDefinitions().map((d) => d.key).sort(),
    );
  });
});

describe("pluginKeyForBlockKey", () => {
  it("resolve a plugin key dona de uma block key contribuída por plugin", () => {
    expect(pluginKeyForBlockKey("alpha.one")).toBe("alpha");
    expect(pluginKeyForBlockKey("beta.two")).toBe("beta");
  });

  it("devolve null pra bloco de core", () => {
    expect(pluginKeyForBlockKey("core.content.heading")).toBeNull();
    expect(pluginKeyForBlockKey("core.layout.row")).toBeNull();
  });
});
