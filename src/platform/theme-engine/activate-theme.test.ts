import { beforeEach, describe, expect, it, vi } from "vitest";

const persistActiveTheme = vi.fn();
vi.mock("@/contexts/themes", () => ({
  activateTheme: (...args: unknown[]) => persistActiveTheme(...args),
}));

vi.mock("@/themes/registry", () => ({
  THEME_REGISTRY: {
    "venore-slime": { manifest: { key: "venore-slime", themeContractVersion: "6.0.0" } },
    "legacy-theme": { manifest: { key: "legacy-theme", themeContractVersion: "3.2.0" } },
  },
}));

describe("activateTheme (platform wrapper)", () => {
  beforeEach(() => {
    persistActiveTheme.mockReset();
    persistActiveTheme.mockResolvedValue({ success: true, data: { themeKey: "venore-slime", activatedAt: new Date() } });
  });

  it("resolve a themeContractVersion do manifesto do tema-alvo, não uma constante do core", async () => {
    const { activateTheme } = await import("./activate-theme");
    await activateTheme({ themeKey: "legacy-theme" });

    expect(persistActiveTheme).toHaveBeenCalledWith({ themeKey: "legacy-theme", themeContractVersion: "3.2.0" });
  });

  it("recusa uma key que não está no registro, sem chamar o context", async () => {
    const { activateTheme } = await import("./activate-theme");
    const result = await activateTheme({ themeKey: "inexistente" });

    expect(result).toEqual({
      success: false,
      error: { code: "theme-engine.activation.unknown_theme", message: expect.any(String) },
    });
    expect(persistActiveTheme).not.toHaveBeenCalled();
  });
});
