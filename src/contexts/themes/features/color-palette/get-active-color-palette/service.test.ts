import { beforeEach, describe, expect, it, vi } from "vitest";

const getSetting = vi.fn();

vi.mock("@/contexts/settings", () => ({
  getSetting: (...args: unknown[]) => getSetting(...args),
}));

describe("getActiveColorPalette", () => {
  beforeEach(() => {
    getSetting.mockReset();
  });

  it("maps the setting record to ActiveColorPaletteState when the key exists", async () => {
    getSetting.mockResolvedValue({
      success: true,
      data: { key: "theme.activePaletteId", value: "oceano", updatedAt: new Date("2026-01-01") },
    });

    const { getActiveColorPalette } = await import("./service");
    const result = await getActiveColorPalette();

    expect(getSetting).toHaveBeenCalledWith({ key: "theme.activePaletteId", skipCache: true });
    expect(result).toEqual({ success: true, data: { paletteId: "oceano", activatedAt: new Date("2026-01-01") } });
  });

  it("falls back to the default palette when the setting does not exist yet", async () => {
    getSetting.mockResolvedValue({ success: true, data: null });

    const { getActiveColorPalette } = await import("./service");
    const result = await getActiveColorPalette();

    expect(result).toEqual({ success: true, data: { paletteId: "default", activatedAt: null } });
  });

  it("falls back to the default palette when the stored value is not a string", async () => {
    getSetting.mockResolvedValue({
      success: true,
      data: { key: "theme.activePaletteId", value: { corrupted: true }, updatedAt: new Date() },
    });

    const { getActiveColorPalette } = await import("./service");
    const result = await getActiveColorPalette();

    expect(result).toEqual({ success: true, data: { paletteId: "default", activatedAt: null } });
  });

  it("propagates the error from contexts/settings", async () => {
    getSetting.mockResolvedValue({ success: false, error: { code: "settings.read.failed", message: "boom" } });

    const { getActiveColorPalette } = await import("./service");
    const result = await getActiveColorPalette();

    expect(result).toEqual({ success: false, error: { code: "settings.read.failed", message: "boom" } });
  });
});
