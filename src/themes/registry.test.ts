import semver from "semver";
import { describe, expect, it } from "vitest";
import { SUPPORTED_THEME_CONTRACT_RANGE } from "@/contexts/themes/contracts/contract-version";
import { THEME_REGISTRY } from "./registry";

// Invariantes estruturais do registro estático (docs/venore-docks.md — "Sobre temas"). Não há
// scan de filesystem em runtime; a única defesa contra drift entre a chave do registro, a
// `manifest.key` e o seletor `[data-theme]` é esta suíte.
describe("THEME_REGISTRY", () => {
  const entries = Object.entries(THEME_REGISTRY);

  it("tem pelo menos o venore-slime (fallback obrigatório do sistema)", () => {
    expect(THEME_REGISTRY["venore-slime"]).toBeDefined();
  });

  it.each(entries)("%s: manifest.key bate com a chave do registro", (registryKey, entry) => {
    expect(entry.manifest.key).toBe(registryKey);
  });

  it.each(entries)("%s: expõe um Shell chamável", (_registryKey, entry) => {
    expect(typeof entry.Shell).toBe("function");
  });

  it.each(entries)(
    "%s: themeContractVersion satisfaz o intervalo suportado pelo core (%s)",
    (_registryKey, entry) => {
      expect(semver.valid(entry.manifest.themeContractVersion)).not.toBeNull();
      expect(
        semver.satisfies(entry.manifest.themeContractVersion, SUPPORTED_THEME_CONTRACT_RANGE),
      ).toBe(true);
    },
  );
});
