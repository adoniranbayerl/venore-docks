import { getSetting, registerDefaultSetting } from "@/contexts/settings";

// T4 (docs/implementation-roadmap.md — Fase 5): comportamento do header configurável pelo admin,
// hoje só respeitado pelo HeaderSlot do Venore Slime (escopo confirmado com o usuário — outro
// tema pode ignorar esses dois campos). Mesmo padrão de platform/brand/get-brand-config.ts: dado
// simples em contexts/settings, sem precisar de handler/service/store próprio porque não há
// regra de negócio além de ler/escrever a chave (setSetting já cobre autorização/cache).
export type HeaderBehavior = {
  // header fixo no topo ao rolar (position: sticky) vs. estático, rolando junto com o conteúdo.
  sticky: boolean;
  // encolhe/inverte cor ao passar do limiar de scroll (docs/ui/shell-spec.md §2) — só tem efeito
  // visível quando `sticky` também está ligado (header estático nunca "passa" pelo topo).
  scrollShrink: boolean;
};

const KEYS = {
  sticky: "header.sticky",
  scrollShrink: "header.scrollShrink",
} as const;

const DEFAULTS: HeaderBehavior = {
  sticky: true,
  scrollShrink: true,
};

async function readBooleanSetting(key: string, defaultValue: boolean): Promise<boolean> {
  await registerDefaultSetting({ key, value: defaultValue });
  const result = await getSetting({ key });
  if (!result.success) return defaultValue;
  const record = result.data;
  if (!record || typeof record.value !== "boolean") return defaultValue;
  return record.value;
}

export async function getHeaderBehavior(): Promise<HeaderBehavior> {
  const [sticky, scrollShrink] = await Promise.all([
    readBooleanSetting(KEYS.sticky, DEFAULTS.sticky),
    readBooleanSetting(KEYS.scrollShrink, DEFAULTS.scrollShrink),
  ]);

  return { sticky, scrollShrink };
}

export { KEYS as HEADER_BEHAVIOR_SETTING_KEYS };

// Quais temas de fato respeitam stickyEnabled/scrollShrinkEnabled agora vem de
// manifest.capabilities.headerBehavior (contexts/themes) — /admin/themes deriva direto do
// manifesto do tema ativo, sem uma lista de theme keys aqui.
