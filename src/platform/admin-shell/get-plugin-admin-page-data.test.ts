import { beforeEach, describe, expect, it, vi } from "vitest";

const getAdminPageData = vi.fn();
vi.mock("./get-admin-page-data", () => ({
  getAdminPageData: (...args: unknown[]) => getAdminPageData(...args),
}));

const isPluginActive = vi.fn();
vi.mock("../plugin-engine/is-plugin-active", () => ({
  isPluginActive: (...args: unknown[]) => isPluginActive(...args),
}));

// Manifestos de teste: a key existe e o gate deriva as permissions da navigation. "solo" tem
// requiredPermission string, "multi" tem array, "silent" não declara navigation nenhuma.
vi.mock("@/plugins/registry", () => ({
  PLUGIN_REGISTRY: [
    { key: "solo", navigation: [{ requiredPermission: "solo.manage" }] },
    { key: "multi", navigation: [{ requiredPermission: ["multi.manage", "multi.work", "multi.read"] }] },
    { key: "silent", navigation: [] },
  ],
}));

const superadmin = { id: "u1", name: null, email: null, isSuperadmin: true, permissions: [] as string[] };
function actorWith(permissions: string[]) {
  return { granted: true as const, actor: { ...superadmin, isSuperadmin: false, permissions } };
}

describe("getPluginAdminPageData", () => {
  beforeEach(() => {
    getAdminPageData.mockReset();
    isPluginActive.mockReset().mockResolvedValue(true);
  });

  it("propagates the base admin gate as-is when it denies", async () => {
    getAdminPageData.mockResolvedValue({ granted: false, reason: "unauthenticated" });

    const { getPluginAdminPageData } = await import("./get-plugin-admin-page-data");
    expect(await getPluginAdminPageData("solo")).toEqual({ granted: false, reason: "unauthenticated" });
    expect(isPluginActive).not.toHaveBeenCalled();
  });

  it("denies as forbidden when the plugin is disabled, even for a superadmin", async () => {
    isPluginActive.mockResolvedValue(false);
    getAdminPageData.mockResolvedValue({ granted: true, actor: superadmin });

    const { getPluginAdminPageData } = await import("./get-plugin-admin-page-data");
    expect(await getPluginAdminPageData("solo")).toEqual({ granted: false, reason: "forbidden" });
    expect(isPluginActive).toHaveBeenCalledWith("solo");
  });

  it("grants a superadmin regardless of the manifest permissions", async () => {
    getAdminPageData.mockResolvedValue({ granted: true, actor: superadmin });

    const { getPluginAdminPageData } = await import("./get-plugin-admin-page-data");
    expect((await getPluginAdminPageData("silent")).granted).toBe(true);
  });

  it("grants when the actor holds ANY of the navigation requiredPermission entries", async () => {
    getAdminPageData.mockResolvedValue(actorWith(["multi.read"]));

    const { getPluginAdminPageData } = await import("./get-plugin-admin-page-data");
    expect((await getPluginAdminPageData("multi")).granted).toBe(true);
  });

  it("denies as forbidden when the actor passed the base gate but holds none of them", async () => {
    getAdminPageData.mockResolvedValue(actorWith(["platform.admin.access"]));

    const { getPluginAdminPageData } = await import("./get-plugin-admin-page-data");
    expect(await getPluginAdminPageData("solo")).toEqual({ granted: false, reason: "forbidden" });
  });

  it("is superadmin-only when the manifest declares no requiredPermission", async () => {
    getAdminPageData.mockResolvedValue(actorWith(["anything"]));

    const { getPluginAdminPageData } = await import("./get-plugin-admin-page-data");
    expect(await getPluginAdminPageData("silent")).toEqual({ granted: false, reason: "forbidden" });
  });
});
