import { beforeEach, describe, expect, it, vi } from "vitest";

// Cobre só os dois branches de guarda (antes de tocar banco/drizzle). O caminho feliz —
// aplicar a árvore de migrations de um plugin real e conferir o schema — depende de um pacote
// `@venore/plugin-*` instalado e mora no repo do próprio plugin, não no core vanilla.
vi.mock("@/observability", () => ({
  beginOperation: vi.fn(() => ({ operationId: "op-1", useCase: "test", actor: { id: "system", type: "system" }, kind: "write", startedAt: new Date() })),
  endOperation: vi.fn(),
}));

const PLUGIN_REGISTRY: Array<{ key: string; name: string; version: string; migrationsPath?: string }> = [];

vi.mock("@/plugins/registry", () => ({
  get PLUGIN_REGISTRY() {
    return PLUGIN_REGISTRY;
  },
}));

describe("runPluginMigrations — guardas", () => {
  beforeEach(() => {
    PLUGIN_REGISTRY.length = 0;
  });

  it("erro quando a key não está no registro", async () => {
    const { runPluginMigrations } = await import("./run-plugin-migrations");

    const result = await runPluginMigrations("inexistente");

    expect(result).toEqual({
      success: false,
      error: { code: "plugin-engine.migrations.unknown_plugin", message: expect.any(String) },
    });
  });

  it("erro quando o plugin não declara migrationsPath (settings-only)", async () => {
    PLUGIN_REGISTRY.push({ key: "sem-schema", name: "Sem schema", version: "1.0.0" });
    const { runPluginMigrations } = await import("./run-plugin-migrations");

    const result = await runPluginMigrations("sem-schema");

    expect(result).toEqual({
      success: false,
      error: { code: "plugin-engine.migrations.not_declared", message: expect.any(String) },
    });
  });
});
