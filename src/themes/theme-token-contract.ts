// Contrato de tokens de tema — build/test-time only (não importado por código de runtime; usa
// só parsing de string, sem fs). O `theme.css` de cada tema declara o vocabulário de design que
// `src/app/globals.css` consome via `var(--x)` (AGENTS.md §3). Não havia lista canônica desse
// vocabulário nem prova de que todo tema o declara por inteiro — este módulo + o
// `theme-token-contract.test.ts` fecham isso.
//
// A fonte da verdade é o `venore-slime` (o tema de referência, AGENTS.md §3): o conjunto de
// tokens que ele declara no bloco base É o contrato. Assim, adicionar um token novo ao slime
// automaticamente passa a exigi-lo de todo outro tema — sem uma segunda lista pra manter em sync.

// Tokens que são identidade EXCLUSIVA do Venore Slime (header/sidebar/app-bg do Shell dele) —
// `globals.css` não os referencia (comentário no `@theme inline`), e temas com Shell próprio
// não precisam declará-los. Ficam de fora do contrato comum. Ver src/themes/venore-slime/theme.css.
export const SLIME_IDENTITY_TOKENS: readonly string[] = [
  "--header-bg",
  "--header-chip-bg",
  "--header-avatar-bg",
  "--header-avatar-fg",
  "--header-border-subtle",
  "--header-border-strong",
  "--app-background",
  "--app-bg-start",
  "--app-bg-mid",
  "--app-bg-end",
  "--sidebar-bg",
  "--sidebar-bg-start",
  "--sidebar-bg-end",
  "--sidebar-bg-admin",
  "--sidebar-bg-admin-start",
  "--sidebar-bg-admin-end",
  "--sidebar-width",
  "--sidebar-width-expanded",
  "--sidebar-width-collapsed",
];

// Extrai o corpo `{ ... }` de uma regra CSS pelo seletor exato (casamento de chaves balanceado —
// aguenta `calc()`, `color-mix()` aninhados). `selector` sem o `{` (ex: `[data-theme="x"]` ou
// `[data-theme="x"].dark`). Retorna null se o seletor não existe no arquivo.
export function extractRuleBody(css: string, selector: string): string | null {
  const marker = `${selector} {`;
  const start = css.indexOf(marker);
  if (start < 0) return null;

  let depth = 1;
  let i = start + marker.length;
  for (; i < css.length && depth > 0; i++) {
    if (css[i] === "{") depth++;
    else if (css[i] === "}") depth--;
  }
  return css.slice(start + marker.length, i - 1);
}

// Nomes de custom properties declaradas no corpo (`--x: valor;`), só no nível deste bloco.
export function declaredTokenNames(ruleBody: string): string[] {
  return [...ruleBody.matchAll(/(^|\s)(--[a-z0-9-]+)\s*:/gim)].map((m) => m[2]);
}

export function tokenValue(ruleBody: string, name: string): string | null {
  const match = ruleBody.match(new RegExp(`(?:^|\\s)${name}\\s*:\\s*([^;]+);`, "i"));
  return match ? match[1].trim() : null;
}

export function isColorValue(value: string): boolean {
  return /oklch\(|rgba?\(|hsla?\(|#[0-9a-f]{3,8}\b|color-mix\(/i.test(value);
}
