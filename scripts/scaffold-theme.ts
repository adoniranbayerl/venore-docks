/**
 * scaffold-theme.ts — cria o esqueleto de um tema novo (tier 1: reaproveita a Shell do
 * venore-slime, só o theme.css é próprio). Ver docs/themes/shell-contract.md — "Tiers de Shell".
 *
 *   npx tsx scripts/scaffold-theme.ts <chave-kebab> "Nome de Exibição"
 *
 * O que faz:
 *   - src/themes/<chave>/theme.css       — cópia do venore-slime com o seletor [data-theme] trocado
 *   - src/themes/<chave>/manifest.ts     — manifesto completo, com TODOs de brandAesthetics
 *   - src/themes/<chave>/color-palettes.ts — catálogo via generateHueRotationPalettes
 *   - src/themes/<chave>/index.ts        — reexporta a Shell do venore-slime + o catálogo
 *   - src/app/globals.css                — adiciona o @import do theme.css
 *   - src/themes/registry.ts             — adiciona a entrada no THEME_REGISTRY
 *
 * Depois: recolorir o theme.css, ajustar brandAesthetics/capabilities no manifest, rodar
 *   npm run typecheck && npm run lint && npx vitest run src/themes
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const [rawKey, ...nameParts] = process.argv.slice(2);
const key = (rawKey ?? "").trim();
const displayName = nameParts.join(" ").trim() || key;

if (!/^[a-z][a-z0-9-]*$/.test(key)) {
  console.error('Uso: npx tsx scripts/scaffold-theme.ts <chave-kebab> "Nome de Exibição"');
  process.exit(1);
}

const root = process.cwd();
const themeDir = join(root, "src", "themes", key);
if (existsSync(themeDir)) {
  console.error(`Já existe src/themes/${key}/ — abortando.`);
  process.exit(1);
}

const camel = key.replace(/-([a-z0-9])/g, (_, c: string) => c.toUpperCase());
const constName = `${key.replace(/-/g, "_").toUpperCase()}_COLOR_PALETTES`;

// --- theme.css: cópia do venore-slime, seletor trocado -----------------------------------------
const slimeCss = readFileSync(join(root, "src", "themes", "venore-slime", "theme.css"), "utf8");
const themeCss =
  `/* ${displayName} — scaffold (tier 1: Shell do venore-slime, theme.css próprio).\n` +
  `   Valores copiados do venore-slime como ponto de partida — RECOLORIR.\n` +
  `   O contrato de tokens (src/themes/theme-token-contract.test.ts) exige o vocabulário completo\n` +
  `   nos dois blocos, então não remova tokens: só troque valores. */\n\n` +
  slimeCss
    .replace(/\[data-theme="venore-slime"\]/g, `[data-theme="${key}"]`)
    .replace(/^\/\*[\s\S]*?\*\/\s*/, ""); // tira o cabeçalho original do slime

// --- manifest.ts ------------------------------------------------------------------------------
const manifestTs = `import type { ThemeManifest } from "@/contexts/themes/contracts/types";

export const ${camel}Manifest: ThemeManifest = {
  key: "${key}",
  name: "${displayName}",
  version: "0.1.0",
  themeContractVersion: "6.0.0",
  // TODO: ajuste a estética de marca deste tema (copiado do venore-slime).
  brandAesthetics: { mode: "svg", size: 100, scrolledSize: 80, position: "left", color: "#143b52" },
  colorModes: ["light", "dark"],
  // capabilities: { headerBehavior: true }, // habilite se a Shell respeitar sticky/scrollShrink
};
`;

// --- color-palettes.ts (seed = valores de hue de marca do venore-slime) ------------------------
const palettesTs = `import { generateHueRotationPalettes, THEME_HUE_PRESETS } from "../generate-hue-rotation-palettes";

// TODO: troque os oklch abaixo pelos tokens de hue de marca do theme.css deste tema depois de
// recolorir (primary / primary-foreground / accent / accent-foreground / ring, light e dark).
export const ${constName} = generateHueRotationPalettes(
  {
    light: {
      primary: "oklch(0.78 0.185 152)",
      primaryForeground: "oklch(0.18 0.02 160)",
      accent: "oklch(0.9 0.205 102)",
      accentForeground: "oklch(0.17 0.018 158)",
      ring: "oklch(0.736 0.058 160)",
    },
    dark: {
      primary: "oklch(0.84 0.205 150)",
      primaryForeground: "oklch(0.17 0.018 158)",
      accent: "oklch(0.94 0.214 131)",
      accentForeground: "oklch(0.17 0.018 158)",
      ring: "oklch(0.458 0.056 156)",
    },
  },
  THEME_HUE_PRESETS,
);
`;

// --- index.ts (tier 1) -----------------------------------------------------------------------
const indexTs = `export { ${camel}Manifest } from "./manifest";
// Tier 1: reaproveita a Shell do venore-slime — este tema só muda o theme.css. Para arranjo
// próprio, troque por uma Shell autoral (docs/themes/shell-contract.md — "Tiers de Shell").
export { Shell } from "../venore-slime/components/Shell";
export { ${constName} } from "./color-palettes";
`;

mkdirSync(themeDir, { recursive: true });
writeFileSync(join(themeDir, "theme.css"), themeCss);
writeFileSync(join(themeDir, "manifest.ts"), manifestTs);
writeFileSync(join(themeDir, "color-palettes.ts"), palettesTs);
writeFileSync(join(themeDir, "index.ts"), indexTs);

// --- globals.css: adiciona o @import logo após o último @import de tema ------------------------
const globalsPath = join(root, "src", "app", "globals.css");
let globals = readFileSync(globalsPath, "utf8");
const importLine = `@import "../themes/${key}/theme.css";`;
if (!globals.includes(importLine)) {
  const themeImportRe = /@import "\.\.\/themes\/[^"]+\/theme\.css";\r?\n/g;
  let lastEnd = -1;
  for (const m of globals.matchAll(themeImportRe)) lastEnd = m.index! + m[0].length;
  if (lastEnd < 0) {
    console.warn("! não achei os @import de tema em globals.css — adicione manualmente:", importLine);
  } else {
    globals = globals.slice(0, lastEnd) + importLine + "\n" + globals.slice(lastEnd);
    writeFileSync(globalsPath, globals);
  }
}

// --- registry.ts: import + entrada no THEME_REGISTRY ------------------------------------------
const registryPath = join(root, "src", "themes", "registry.ts");
let registry = readFileSync(registryPath, "utf8");
const nsImport = `import * as ${camel} from "./${key}";`;
if (!registry.includes(nsImport)) {
  const importRe = /import \* as \w+ from "\.\/[^"]+";\r?\n/g;
  let lastEnd = -1;
  for (const m of registry.matchAll(importRe)) lastEnd = m.index! + m[0].length;
  registry = registry.slice(0, lastEnd) + nsImport + "\n" + registry.slice(lastEnd);
}
const entry =
  `  "${key}": {\n` +
  `    manifest: ${camel}.${camel}Manifest,\n` +
  `    Shell: ${camel}.Shell,\n` +
  `    colorPalettes: ${camel}.${constName},\n` +
  `  },\n`;
if (!registry.includes(`"${key}": {`)) {
  registry = registry.replace(/\n};\s*$/, `\n${entry}};\n`);
}
writeFileSync(registryPath, registry);

console.log(`✓ src/themes/${key}/ criado (tier 1) + globals.css + registry.ts atualizados.

Próximos passos:
  1. Recolorir src/themes/${key}/theme.css (só valores; não remova tokens).
  2. Ajustar brandAesthetics / capabilities em src/themes/${key}/manifest.ts.
  3. Atualizar os oklch de src/themes/${key}/color-palettes.ts pra bater com o theme.css.
  4. npm run typecheck && npm run lint && npx vitest run src/themes
  5. (opcional) arranjo próprio: substituir a Shell reexportada por uma autoral.`);
