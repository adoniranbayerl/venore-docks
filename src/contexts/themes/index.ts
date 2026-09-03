export { getActiveThemeHandler as getActiveTheme } from "./features/active-theme/get-active-theme/handler";
export { activateThemeHandler as activateTheme } from "./features/active-theme/activate-theme/handler";
export { getActiveColorPaletteHandler as getActiveColorPalette } from "./features/color-palette/get-active-color-palette/handler";
export { activateColorPaletteHandler as activateColorPalette } from "./features/color-palette/activate-color-palette/handler";
export { themesAdminNavigationItems } from "./admin-navigation";

export type { GetActiveThemeResult } from "./features/active-theme/get-active-theme/types";
export type { ActivateThemeInput, ActivateThemeResult } from "./features/active-theme/activate-theme/types";
export type { GetActiveColorPaletteResult } from "./features/color-palette/get-active-color-palette/types";
export type { ActivateColorPaletteInput, ActivateColorPaletteResult } from "./features/color-palette/activate-color-palette/types";

export { themesBreadcrumbSegments } from "./breadcrumbs";

export type {
  ThemeManifest,
  ThemeColorMode,
  BrandAesthetics,
  ActiveThemeState,
  BreadcrumbItem,
  HeaderSlotProps,
  HeaderBrand,
  HeaderBrandMode,
  HeaderBrandPosition,
  HeaderUserInfo,
  FooterSlotProps,
  FooterBrand,
  ContentSlotProps,
  SidebarLeftSlotProps,
  ThemeShellProps,
  NavItem,
  MainNavItem,
  NavGroup,
  NavMode,
  SitemapItem,
  PaletteColorToken,
  PaletteColorTokens,
  ColorPalette,
  ActiveColorPaletteState,
} from "./contracts/types";
export { CURRENT_THEME_CONTRACT_VERSION, SUPPORTED_THEME_CONTRACT_RANGE } from "./contracts/contract-version";
