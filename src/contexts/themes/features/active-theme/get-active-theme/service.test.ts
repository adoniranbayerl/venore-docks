import { beforeEach, describe, expect, it, vi } from "vitest";

const getSetting = vi.fn();

vi.mock("@/contexts/settings", () => ({
  getSetting: (...args: unknown[]) => getSetting(...args),
}));

describe("getActiveTheme", () => {
  beforeEach(() => {
    getSetting.mockReset();
  });

  it("maps the setting record to ActiveThemeState when the key exists", async () => {
    getSetting.mockResolvedValue({ success: true, data: { key: "theme.active", value: "custom", updatedAt: new Date("2026-01-01") } });

    const { getActiveTheme } = await import("./service");
    const result = await getActiveTheme();

    expect(getSetting).toHaveBeenCalledWith({ key: "theme.active", skipCache: true });
    expect(result).toEqual({ success: true, data: { themeKey: "custom", activatedAt: new Date("2026-01-01") } });
  });

  it("falls back to the default theme when the setting does not exist yet", async () => {
    getSetting.mockResolvedValue({ success: true, data: null });

    const { getActiveTheme } = await import("./service");
    const result = await getActiveTheme();

    expect(result).toEqual({ success: true, data: { themeKey: "venore-slime", activatedAt: null } });
  });

  it("falls back to the default theme when the stored value is not a string", async () => {
    getSetting.mockResolvedValue({ success: true, data: { key: "theme.active", value: { corrupted: true }, updatedAt: new Date() } });

    const { getActiveTheme } = await import("./service");
    const result = await getActiveTheme();

    expect(result).toEqual({ success: true, data: { themeKey: "venore-slime", activatedAt: null } });
  });
});
