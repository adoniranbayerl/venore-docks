import { describe, expect, it } from "vitest";
import { contrastRatio } from "./contrast";

describe("contrastRatio", () => {
  it("preto vs. branco = 21 (máximo)", () => {
    expect(contrastRatio("#000000", "#ffffff")).toBeCloseTo(21, 0);
  });

  it("é simétrico (ordem dos argumentos não importa)", () => {
    expect(contrastRatio("#123456", "#abcdef")).toBeCloseTo(contrastRatio("#abcdef", "#123456"), 5);
  });

  it("cor igual = 1 (mínimo)", () => {
    expect(contrastRatio("#3366cc", "#3366cc")).toBeCloseTo(1, 5);
  });

  it("branco em quase-branco fica bem abaixo de 4.5", () => {
    expect(contrastRatio("#ffffff", "#fefefe")).toBeLessThan(1.1);
  });

  it("um par legível (texto escuro em fundo claro) passa de 4.5", () => {
    expect(contrastRatio("#1f2933", "#f5f7fa")).toBeGreaterThan(4.5);
  });
});
