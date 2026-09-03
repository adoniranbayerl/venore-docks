// Razão de contraste WCAG 2.x (luminância relativa) entre dois hex #rrggbb. Usada pra barrar
// uma paleta personalizada que zere a legibilidade (ex: texto quase da cor do fundo) antes de
// virar CSS de override — o admin escolhe cor livre no picker, sem noção de contraste.

function toLinear(channel8bit: number): number {
  const c = channel8bit / 255;
  return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
}

function relativeLuminance(hex: string): number {
  const value = Number.parseInt(hex.slice(1), 16);
  const r = toLinear((value >> 16) & 0xff);
  const g = toLinear((value >> 8) & 0xff);
  const b = toLinear(value & 0xff);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

// Sempre >= 1. 21 = preto vs. branco. WCAG AA pra texto normal = 4.5.
export function contrastRatio(hexA: string, hexB: string): number {
  const a = relativeLuminance(hexA);
  const b = relativeLuminance(hexB);
  const lighter = Math.max(a, b);
  const darker = Math.min(a, b);
  return (lighter + 0.05) / (darker + 0.05);
}

// Mínimo exigido entre `foreground` e `background` de uma paleta personalizada — WCAG AA texto
// normal. Presets de catálogo não passam por aqui (partem de valores já testados no theme.css).
export const MIN_CUSTOM_PALETTE_CONTRAST = 4.5;
