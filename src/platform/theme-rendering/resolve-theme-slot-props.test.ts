import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

const getCurrentUser = vi.fn();
const getMenuByLocation = vi.fn();
const collectNotificationAlert = vi.fn();
const resolveBrandAesthetics = vi.fn();
const getBrandConfig = vi.fn();
const getHeaderBehavior = vi.fn();

vi.mock("@/contexts/auth", () => ({
  getCurrentUser: (...args: unknown[]) => getCurrentUser(...args),
}));

vi.mock("@/contexts/cms", () => ({
  getMenuByLocation: (...args: unknown[]) => getMenuByLocation(...args),
}));

// Sem isso, um `user` não-nulo faria resolveThemeSlotProps chamar o registry de verdade
// (platform/notifications/notification-registry.ts → @/plugins/academy → banco), quebrando a regra
// de teste unitário sem banco real (AGENTS.md §5).
vi.mock("@/platform/notifications/notification-registry", () => ({
  collectNotificationAlert: (...args: unknown[]) => collectNotificationAlert(...args),
}));

// resolve-brand-aesthetics (via resolveActiveTheme → @/contexts/themes) e get-brand-config/
// get-header-behavior (via @/contexts/settings) leem do banco real — sem stub, este teste
// unitário abre conexão de verdade e trava por timeout quando não há Postgres (AGENTS.md §5).
// Nenhuma asserção aqui depende do conteúdo de marca/comportamento do header, só do payload de
// user/nav/sitemap, então basta um valor fixo.
vi.mock("./resolve-brand-aesthetics", () => ({
  resolveBrandAesthetics: (...args: unknown[]) => resolveBrandAesthetics(...args),
}));

vi.mock("@/platform/brand/get-brand-config", () => ({
  getBrandConfig: (...args: unknown[]) => getBrandConfig(...args),
}));

// Este teste não exercita contribuição de plugin. Com um plugin instalado, PLUGIN_CONTRIBUTIONS
// deixa de ser vazio e arrasta transitivamente (via @venore/plugin-sdk -> delete-media-safely ->
// media-usage-registry) módulos que os mocks parciais daqui não cobrem. Zerar o mapa corta a
// cadeia sem afetar o que o teste mede.
vi.mock("@/plugins/contributions", () => ({ PLUGIN_CONTRIBUTIONS: {} }));

vi.mock("@/platform/header-behavior/get-header-behavior", () => ({
  getHeaderBehavior: (...args: unknown[]) => getHeaderBehavior(...args),
}));

// Importado uma única vez em beforeAll, não dentro de cada `it`: sob a suíte cheia o custo de
// transform do grafo do SUT chegava a estourar o timeout de 5s do primeiro teste (o hook tem
// orçamento próprio, maior, e paga esse custo uma vez só).
let resolveThemeSlotProps: typeof import("./resolve-theme-slot-props").resolveThemeSlotProps;

function sidebarNavInput(
  overrides: Partial<{
    canAccessAdmin: boolean;
    onSignOut: () => Promise<void>;
    collapsed: boolean;
    onToggleCollapsed: () => Promise<void>;
  }> = {},
) {
  return {
    navMode: "main" as const,
    adminNavGroups: [],
    canToggleAdminNav: false,
    onToggleNavMode: vi.fn(),
    canAccessAdmin: false,
    onSignOut: vi.fn(),
    collapsed: false,
    onToggleCollapsed: vi.fn(),
    ...overrides,
  };
}

describe("resolveThemeSlotProps", () => {
  beforeAll(async () => {
    ({ resolveThemeSlotProps } = await import("./resolve-theme-slot-props"));
  }, 30000);

  beforeEach(() => {
    getCurrentUser.mockReset();
    getMenuByLocation.mockReset();
    getMenuByLocation.mockResolvedValue({ success: true, data: [] });
    collectNotificationAlert.mockReset();
    collectNotificationAlert.mockResolvedValue(null);
    resolveBrandAesthetics.mockReset();
    resolveBrandAesthetics.mockResolvedValue({ mode: "svg", size: 100, scrolledSize: 80, position: "left", color: "#000000" });
    getBrandConfig.mockReset();
    getBrandConfig.mockResolvedValue({
      siteName: "Test Site",
      logoUrl: "/brand/brand-logo.svg",
      scrolledLogoUrl: "/brand/brand-logo-scrolled.png",
      faviconUrl: "/brand/favicon.ico",
      footerDescription: "Descrição de teste",
    });
    getHeaderBehavior.mockReset();
    getHeaderBehavior.mockResolvedValue({ sticky: true, scrollShrink: true });
  });

  it("resolves header.user as null when there is no authenticated user", async () => {
    getCurrentUser.mockResolvedValue({ success: true, data: null });

    const props = await resolveThemeSlotProps(sidebarNavInput());

    expect(props.header.user).toBeNull();
  });

  it("resolves header.user from the authenticated user, preferring name over email", async () => {
    getCurrentUser.mockResolvedValue({
      success: true,
      data: { id: "user-1", name: "Ada Lovelace", email: "ada@example.com", image: "https://img/ada.png" },
    });

    const props = await resolveThemeSlotProps(sidebarNavInput());

    expect(props.header.user).toEqual({
      displayName: "Ada Lovelace",
      email: "ada@example.com",
      imageUrl: "https://img/ada.png",
    });
  });

  it("falls back displayName to email, then to a generic label, when name is missing", async () => {
    getCurrentUser.mockResolvedValue({
      success: true,
      data: { id: "user-1", name: null, email: "ada@example.com", image: null },
    });

    const props = await resolveThemeSlotProps(sidebarNavInput());

    expect(props.header.user?.displayName).toBe("ada@example.com");

    getCurrentUser.mockResolvedValue({
      success: true,
      data: { id: "user-1", name: null, email: null, image: null },
    });

    const props2 = await resolveThemeSlotProps(sidebarNavInput());
    expect(props2.header.user?.displayName).toBe("Usuário");
  });

  it("passes canAccessAdmin and onSignOut through to header props", async () => {
    getCurrentUser.mockResolvedValue({ success: true, data: null });
    const onSignOut = vi.fn();

    const props = await resolveThemeSlotProps(sidebarNavInput({ canAccessAdmin: true, onSignOut }));

    expect(props.header.canAccessAdmin).toBe(true);
    expect(props.header.onSignOut).toBe(onSignOut);
  });

  it("resolves sidebarLeft.navItems from the main-nav menu when navMode is main", async () => {
    getCurrentUser.mockResolvedValue({ success: true, data: null });
    getMenuByLocation.mockResolvedValue({
      success: true,
      data: [{ id: "item-1", label: "Home", href: "/", isExternal: false, children: [] }],
    });

    const props = await resolveThemeSlotProps(sidebarNavInput());

    expect(props.sidebarLeft.navItems).toEqual([{ key: "item-1", label: "Home", href: "/" }]);
    expect(getMenuByLocation).toHaveBeenCalledWith({ location: "main" });
  });

  it("keeps a 'label' grouper item (href null) with its children as a nested main-nav tree, instead of dropping it", async () => {
    getCurrentUser.mockResolvedValue({ success: true, data: null });
    getMenuByLocation.mockResolvedValue({
      success: true,
      data: [
        {
          id: "group-1",
          label: "Recursos Humanos",
          href: null,
          isExternal: false,
          children: [
            { id: "item-1", label: "Item 1", href: "/rh/item-1", isExternal: false, children: [] },
            { id: "item-2", label: "Item 2", href: "/rh/item-2", isExternal: false, children: [] },
          ],
        },
        { id: "item-3", label: "Teologia", href: "/teologia/teste", isExternal: false, children: [] },
      ],
    });

    const props = await resolveThemeSlotProps(sidebarNavInput());

    expect(props.sidebarLeft.navItems).toEqual([
      {
        key: "group-1",
        label: "Recursos Humanos",
        href: null,
        children: [
          { key: "item-1", label: "Item 1", href: "/rh/item-1" },
          { key: "item-2", label: "Item 2", href: "/rh/item-2" },
        ],
      },
      { key: "item-3", label: "Teologia", href: "/teologia/teste" },
    ]);
  });

  it("drops a 'label' grouper item entirely when it ends up with no visible children (e.g. all filtered by permission)", async () => {
    getCurrentUser.mockResolvedValue({ success: true, data: null });
    getMenuByLocation.mockResolvedValue({
      success: true,
      data: [{ id: "group-1", label: "Recursos Humanos", href: null, isExternal: false, children: [] }],
    });

    const props = await resolveThemeSlotProps(sidebarNavInput());

    expect(props.sidebarLeft.navItems).toEqual([]);
  });

  it("carries the icon chosen in the CMS editor through to main-nav items, omitting it when absent", async () => {
    getCurrentUser.mockResolvedValue({ success: true, data: null });
    getMenuByLocation.mockResolvedValue({
      success: true,
      data: [
        { id: "item-1", label: "Recursos Humanos", href: null, isExternal: false, icon: "users", children: [{ id: "item-2", label: "Item 1", href: "/rh/item-1", isExternal: false, icon: null, children: [] }] },
        { id: "item-3", label: "Teologia", href: "/teologia", isExternal: false, icon: null, children: [] },
      ],
    });

    const props = await resolveThemeSlotProps(sidebarNavInput());

    expect(props.sidebarLeft.navItems).toEqual([
      {
        key: "item-1",
        label: "Recursos Humanos",
        href: null,
        icon: "users",
        children: [{ key: "item-2", label: "Item 1", href: "/rh/item-1", icon: undefined }],
      },
      { key: "item-3", label: "Teologia", href: "/teologia", icon: undefined },
    ]);
  });

  it("falls back to the mock nav items when the main-nav menu lookup fails", async () => {
    getCurrentUser.mockResolvedValue({ success: true, data: null });
    getMenuByLocation.mockResolvedValue({ success: false, error: { code: "err", message: "boom" } });

    const props = await resolveThemeSlotProps(sidebarNavInput());

    expect(props.sidebarLeft.navItems).toEqual([{ key: "home", label: "Home", href: "/", icon: "home" }]);
  });

  it("passes collapsed and onToggleCollapsed through to sidebarLeft props", async () => {
    getCurrentUser.mockResolvedValue({ success: true, data: null });
    const onToggleCollapsed = vi.fn();

    const props = await resolveThemeSlotProps(sidebarNavInput({ collapsed: true, onToggleCollapsed }));

    expect(props.sidebarLeft.collapsed).toBe(true);
    expect(props.sidebarLeft.onToggleCollapsed).toBe(onToggleCollapsed);
  });

  it("uses adminNavGroups, not the main-nav menu, when navMode is admin", async () => {
    getCurrentUser.mockResolvedValue({ success: true, data: null });
    const adminNavGroups = [{ key: "rbac", label: "RBAC", items: [{ key: "admin.roles", label: "Papéis", href: "/admin/rbac" }] }];

    const props = await resolveThemeSlotProps({ ...sidebarNavInput(), navMode: "admin", adminNavGroups });

    expect(props.sidebarLeft.navGroups).toBe(adminNavGroups);
    expect(props.sidebarLeft.navItems).toEqual([]);
  });

  it("resolves footer.sitemapItems from the sitemap-location menu, reshaped as a tree", async () => {
    getCurrentUser.mockResolvedValue({ success: true, data: null });
    getMenuByLocation.mockImplementation(async ({ location }: { location: string }) => {
      if (location === "sitemap") {
        return {
          success: true,
          data: [
            {
              id: "col-1",
              label: "Institucional",
              href: null,
              isExternal: false,
              children: [{ id: "item-1", label: "Sobre", href: "/sobre", isExternal: false, children: [] }],
            },
          ],
        };
      }
      return { success: true, data: [] };
    });

    const props = await resolveThemeSlotProps(sidebarNavInput());

    expect(props.footer.sitemapItems).toEqual([
      {
        key: "col-1",
        label: "Institucional",
        href: null,
        isExternal: false,
        children: [{ key: "item-1", label: "Sobre", href: "/sobre", isExternal: false, children: [] }],
      },
    ]);
    expect(getMenuByLocation).toHaveBeenCalledWith({ location: "sitemap" });
  });

  it("resolves footer.sitemapItems to an empty list when there is no menu configured for the sitemap location, without falling back to any mock", async () => {
    getCurrentUser.mockResolvedValue({ success: true, data: null });
    getMenuByLocation.mockResolvedValue({ success: true, data: [] });

    const props = await resolveThemeSlotProps(sidebarNavInput());

    expect(props.footer.sitemapItems).toEqual([]);
  });

  it("resolves footer.sitemapItems to an empty list when the sitemap-location lookup fails", async () => {
    getCurrentUser.mockResolvedValue({ success: true, data: null });
    getMenuByLocation.mockImplementation(async ({ location }: { location: string }) => {
      if (location === "sitemap") {
        return { success: false, error: { code: "err", message: "boom" } };
      }
      return { success: true, data: [] };
    });

    const props = await resolveThemeSlotProps(sidebarNavInput());

    expect(props.footer.sitemapItems).toEqual([]);
  });
});
