import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { THEME_REGISTRY } from "./registry";
import {
  declaredTokenNames,
  extractRuleBody,
  isColorValue,
  SLIME_IDENTITY_TOKENS,
  tokenValue,
} from "./theme-token-contract";

const THEMES_DIR = join(process.cwd(), "src", "themes");
const readThemeCss = (key: string) => readFileSync(join(THEMES_DIR, key, "theme.css"), "utf8");

// O contrato É o que o venore-slime declara (menos a identidade exclusiva dele).
const slimeCss = readThemeCss("venore-slime");
const slimeBase = extractRuleBody(slimeCss, `[data-theme="venore-slime"]`);
const slimeDark = extractRuleBody(slimeCss, `[data-theme="venore-slime"].dark`);
if (!slimeBase || !slimeDark) {
  throw new Error("venore-slime/theme.css não tem os blocos [data-theme] / [data-theme].dark esperados.");
}

const identity = new Set(SLIME_IDENTITY_TOKENS);
const baseContract = declaredTokenNames(slimeBase).filter((name) => !identity.has(name));
const slimeDarkNames = new Set(declaredTokenNames(slimeDark));
// Tokens de cor que o slime REDECLARA no bloco .dark = os que flipam entre light/dark. Todo tema
// precisa flipar os mesmos. Tokens de cor que o slime deixa só no base (--overlay-foreground,
// --presentation-*) são "congelados" de propósito e ficam fora da exigência de dark.
const darkContract = baseContract.filter(
  (name) => slimeDarkNames.has(name) && isColorValue(tokenValue(slimeBase, name) ?? ""),
);

describe("contrato de tokens de tema", () => {
  it("o contrato derivado do venore-slime não está vazio (sanidade do parser)", () => {
    expect(baseContract.length).toBeGreaterThan(50);
    expect(darkContract.length).toBeGreaterThan(20);
  });

  for (const key of Object.keys(THEME_REGISTRY)) {
    describe(key, () => {
      const css = readThemeCss(key);
      const base = extractRuleBody(css, `[data-theme="${key}"]`);
      const dark = extractRuleBody(css, `[data-theme="${key}"].dark`);

      it("tem o bloco base [data-theme] e o bloco .dark", () => {
        expect(base, `[data-theme="${key}"] {`).toBeTruthy();
        expect(dark, `[data-theme="${key}"].dark {`).toBeTruthy();
      });

      it("o bloco base declara todo token do contrato", () => {
        const present = new Set(declaredTokenNames(base ?? ""));
        const missing = baseContract.filter((name) => !present.has(name));
        expect(missing, `faltando no bloco base de ${key}`).toEqual([]);
      });

      it("o bloco .dark redeclara todo token de cor que o slime flipa", () => {
        const present = new Set(declaredTokenNames(dark ?? ""));
        const missing = darkContract.filter((name) => !present.has(name));
        expect(missing, `faltando no bloco .dark de ${key}`).toEqual([]);
      });
    });
  }
});
