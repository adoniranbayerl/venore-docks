# Plano — plugins em repositórios separados (opção 3)

Objetivo: tirar `src/plugins/<key>/**` do monorepo do core. Cada plugin vira um repo próprio; uma
instância traz **só os plugins que quer**; `git pull` no core não arrasta plugin nenhum, e
atualização de core é O(1) por instância (sem branch de deploy, sem merge recorrente).

Custo resumido: **2–4 semanas** de trabalho focado. Fases 0–2 são o grosso (definir o SDK,
migrar os imports dos 6 plugins, tirar o hard-code de plugin do `platform/`, codegen dos
registries). Fases 3–4 são mecânicas (~0.5–1 dia/plugin). Depois: um contrato versionado a manter
(SDK), N+1 repos pra lançar, e setup de dev com `npm link`/workspace.

Regra durante todo o plano: **o monorepo continua shippável em cada fase** (strangler-fig). Nada
quebra o build do core até o caminho novo estar provado.

---

## Decisões de arquitetura

### Mecanismo de distribuição — **script de sync** (recomendado), npm como evolução

- **Sync-script (recomendado agora):** o deploy define `VENORE_PLUGINS=broadcast,academy` (env) ou
  um `venore.plugins.json`. `scripts/sync-plugins.ts` faz `git clone`/`fetch` de cada
  `venore-plugin-<key>` num ref compatível pra `src/plugins/<key>/` (que passa a ser **gitignored**),
  e roda o codegen. `git pull` no core + `npm run sync-plugins` no deploy. **Sem registry, sem
  publish.** Estado por-instância = só a env var, zero arquivo rastreado → nunca dá conflito de merge.
- **npm packages (evolução):** cada plugin publicado como `@venore/plugin-<key>` num registry
  privado (GitHub Packages / npm org / Verdaccio). `npm ci` traz só o que está em `dependencies`.
  Mais "correto" e versionado, mas exige infra de registry + CI de publish. Migrar do sync-script
  pra isto depois é incremental (o codegen passa a varrer `node_modules/@venore/plugin-*` em vez de
  pastas).

### O contrato core → plugin — pacote **`@venore/plugin-sdk`**

Hoje plugin importa `@/contexts/*` (barrels), `@/platform/*` (helpers), `@/shared/*` (tipos),
`@/infrastructure/database/client` (`db`), `@/observability`, o schema de manifesto, os tipos de
route-table (`PluginRouteTable`, `asPluginPage`, `asPluginApiHandler`), `isPluginActive`, etc.

`@venore/plugin-sdk` = **exatamente essa superfície**, re-exportada e versionada (semver). É o
artefato mais importante do plano — é o contrato. Tudo o mais no core vira privado. A superfície
inicial sai do que o `AGENTS.md` já diz que plugin pode usar (barrel + `contracts/` + um punhado de
helpers de `platform/` + `db`/`observability`/`OperationResult`/`authorizeActor`/`beginOperation`).

Mora **dentro do repo do core** como workspace; publicado (ou consumido pelo sync-script) a partir
da Fase 3.

### `@venore/eslint-config`

As regras de `boundaries/dependencies` do `eslint.config.mjs` (plugin→plugin, plugin→context-internal)
viram um pacote compartilhado que o core e cada repo de plugin estendem. As fixtures
`src/plugins/_fixture-cross-*` viram teste desse pacote.

### Registries gerados + modelo de contribuição

Hoje `platform/` hard-coda cada plugin: `notification-registry.ts` faz `import ... from
"@/plugins/academy"`, idem `user-nav/registry.ts`, block-registry, e `registry.ts`/`route-registry.ts`
importam cada manifesto por caminho fixo.

Vira:
- O **manifesto** (ou um export `plugin.contributions`) declara o que o plugin contribui:
  notification-alert resolver, item de user-nav, blocos, etc.
- `platform/` **itera `PLUGIN_REGISTRY`** usando essas contribuições — nunca importa `@/plugins/<x>`.
- `scripts/gen-plugin-registry.ts` (roda em `predev`/`prebuild`) varre os plugins presentes, lê cada
  manifesto e **gera** `src/plugins/registry.generated.ts` + `route-registry.generated.ts`.

### Migrations

Já são desacopladas (schema próprio, tracking próprio, drizzle.config próprio). Mudanças:
- `db:migrate:<plugin>` no `package.json` → um `db:migrate:plugins` que itera os plugins presentes.
- `run-plugin-migrations.ts` (já lê `PLUGIN_REGISTRY` + `manifest.migrationsPath`) → resolver o path
  a partir da raiz do pacote/pasta do plugin.
- `install-fresh.ts` → enumeração dinâmica.
- Nova migration neutralizando o `INSERT` hard-coded da `0034_backfill_extension_install_state.sql`
  (num core sem os pacotes de plugin, essas linhas ficam órfãs; melhor torná-las inertes de vez).

### Testes

- `*.test.ts` de plugin vão pro repo do plugin, rodam no CI dele contra `@venore/plugin-sdk`
  (mín. suportado + latest).
- Core mantém os testes dele, larga os de plugin.
- **Novo: suíte de integração/conformance** (`venore-integration`): matriz core × conjunto de
  plugins; sobe o app, roda as migrations de cada plugin contra um Postgres real, bate nas rotas de
  smoke. É o que substitui o "um `npm test` cobre tudo".

### Dev local

- Mexer num plugin: `npm link` / dependência `file:` / overlay de workspace. Helper
  `scripts/link-plugin.ts <path>`.
- Mexer em core + plugin juntos: workspace apontando pros checkouts locais.

---

## Fases

| Fase | O quê | Depende de |
|---|---|---|
| 0 | Decisões + esqueleto: `@venore/plugin-sdk` e `@venore/eslint-config` como workspaces no core | — |
| 1 | Codegen dos registries + modelo de contribuição no manifesto; `platform/` fica plugin-agnóstico | 0 |
| 2 | Import audit: os 6 plugins passam a importar SÓ do SDK (ainda no monorepo); congela SDK 1.0.0 | 0, 1 |
| 3 | Extrai o **broadcast** pra repo próprio; `sync-plugins.ts`; prova o modelo ponta a ponta | 1, 2 |
| 4 | Extrai os demais (academy, helpdesk, company-metrics, birthdays, donations) — 1 sessão/plugin | 3 |
| 5 | Suíte de integração/conformance + CI multi-repo | 3 |
| 6 | Runbook de deploy + limpeza + neutralizar a `0034` + atualizar AGENTS.md/venore-docks | 4, 5 |

---

## Prompts de sessão

### Fase 0 — Decisões + esqueleto do SDK

```
Contexto: monorepo Venore (Next.js). Vamos tirar src/plugins/<key>/** pra repos separados (plano em
docs/plugins-repos-separados-plano.md). Esta fase NÃO extrai nada — só cria o contrato.

Tarefa:
- Decidir e registrar no doc: mecanismo de distribuição (sync-script recomendado), scope do SDK
  (@venore/plugin-sdk), onde vive a suíte de integração.
- Criar o pacote workspace @venore/plugin-sdk DENTRO do repo do core (packages/plugin-sdk/ +
  entrada em npm workspaces / tsconfig paths). Ele RE-EXPORTA a superfície que plugin pode usar:
  * barrels de context: @/contexts/{cms,rbac,media,settings,auth,themes} e seus contracts/
  * helpers de platform que plugin usa hoje (levantar via grep nos imports dos 6 plugins):
    isPluginActive, os tipos de plugin-routing (PluginRouteTable, asPluginPage, asPluginApiHandler),
    PluginManifest / manifest-schema, brand (getBrandConfig), etc.
  * infra: db (@/infrastructure/database/client), @/observability (beginOperation/endOperation),
    @/shared/types (OperationResult), authorizeActor/AuthorizeActorResult (@/contexts/rbac).
- Criar @venore/eslint-config (packages/eslint-config/) com as regras boundaries/dependencies de
  plugin que hoje vivem em eslint.config.mjs.
- Provar: apontar UM plugin ainda in-tree (broadcast) pra importar só via @venore/plugin-sdk num
  arquivo piloto; typecheck passa.

Definition of Done: os dois pacotes existem como workspaces; `npm run typecheck` verde; o doc
registra as decisões e a lista COMPLETA de imports `@/...` que os 6 plugins fazem hoje (é o mapa da
Fase 2).
```

### Fase 1 — Codegen dos registries + contribuições no manifesto

```
Contexto: plano docs/plugins-repos-separados-plano.md, Fase 1. Ainda monorepo, todos os plugins
in-tree. Objetivo: NENHUM arquivo de platform/ pode importar @/plugins/<x> por caminho fixo.

Tarefa:
- Estender manifest-schema (PluginManifest): campo `contributions` cobrindo o que hoje é hard-coded
  por plugin em platform/ — notification-alert resolver (platform/notifications/notification-registry.ts),
  item de user-nav (platform/user-nav/registry.ts), blocos (se aplicável), e o que mais um grep por
  `@/plugins/` dentro de src/platform e src/app revelar.
- Refatorar esses registries pra ITERAR PLUGIN_REGISTRY lendo `manifest.contributions` — em vez de
  `import { getMessageNavLink } from "@/plugins/academy"`, o manifesto do academy declara o
  provider e a plataforma chama pelo registro.
- scripts/gen-plugin-registry.ts: varre src/plugins/*/manifest.* (modelo sync-script) ou
  node_modules/@venore/plugin-* (modelo npm), gera src/plugins/registry.generated.ts +
  route-registry.generated.ts. Wire em `predev` e `prebuild`. registry.ts/route-registry.ts atuais
  viram re-export do generated (ou são substituídos).
- Provar plugin-agnosticismo: remover TEMPORARIAMENTE uma pasta de plugin local -> `npm run build`
  passa, aquele plugin só fica ausente (nada em platform/ quebra).

Definition of Done: `grep -rn "@/plugins/" src/platform src/app` não retorna import de plugin
específico (só os 3 dispatchers genéricos [plugin]); lint/typecheck/test verdes; build passa com
uma pasta de plugin removida.
```

### Fase 2 — Import audit: os 6 plugins importam só o SDK

```
Contexto: plano docs/plugins-repos-separados-plano.md, Fase 2. Ainda monorepo. Um plugin por vez,
nesta ordem: broadcast, academy, helpdesk, company-metrics, birthdays, donations.

Para cada plugin:
- Trocar todo `import ... from "@/..."` por `import ... from "@venore/plugin-sdk"` (ou subpath do
  SDK). Import relativo DENTRO do próprio plugin continua.
- Cada import que o SDK não expõe: decidir — (a) é superfície pública legítima -> adicionar ao SDK;
  (b) o plugin está alcançando um internal -> refatorar o plugin pra não precisar. Registrar cada
  decisão no doc.
- Rodar os testes daquele plugin + typecheck + lint.

No fim da fase:
- Congelar a superfície do @venore/plugin-sdk e marcar 1.0.0.
- `grep -rn "from \"@/" src/plugins` só retorna imports relativos (`./`, `../`) — zero `@/contexts`,
  `@/platform`, `@/infrastructure`, `@/shared` nos plugins.

Definition of Done: os 6 plugins compilam e passam nos testes importando só do SDK, ainda no
monorepo (um CI só valida tudo); SDK 1.0.0 congelado e documentado.
```

### Fase 3 — Extrair o broadcast + sync-plugins (prova do modelo)

```
Contexto: plano docs/plugins-repos-separados-plano.md, Fase 3. SDK 1.0.0 pronto, platform
plugin-agnóstico. Agora o primeiro plugin sai do monorepo.

Tarefa:
- git filter-repo (ou subtree split) de src/plugins/broadcast + docs/broadcast-* + testes ->
  novo repo venore-plugin-broadcast, preservando histórico.
- No repo novo: package.json (dep @venore/plugin-sdk ^1, @venore/eslint-config), tsconfig, eslint,
  drizzle.config.ts (migrationsPath relativo à raiz do pacote), CI (typecheck + lint + test +
  db:migrate contra PG efêmero). manifest.compatibility.coreVersion alinhado ao SDK.
- Publicar @venore/plugin-sdk + @venore/eslint-config (registry privado) OU deixá-los consumíveis
  pelo sync-script (tarball/git ref).
- No core: scripts/sync-plugins.ts — lê VENORE_PLUGINS (env) ou venore.plugins.json, faz fetch de
  cada venore-plugin-<key> no ref compatível pra src/plugins/<key>/ (gitignored), roda
  gen-plugin-registry. Script db:migrate:plugins que itera os plugins sincronizados.
- No core: git rm -r src/plugins/broadcast; adicionar src/plugins/* ao .gitignore (menos um
  .gitkeep); CI do core roda sync-plugins com um conjunto pinado antes dos testes.
- Provar ponta a ponta: num checkout limpo do core, `VENORE_PLUGINS=broadcast npm run sync-plugins
  && npm run build` -> só o broadcast presente e ativo; `git pull` no core não traz plugin.

Definition of Done: venore-plugin-broadcast é um repo com CI verde; core sem a pasta broadcast;
deploy com VENORE_PLUGINS=broadcast funciona (rotas, migrations, view de saída); doc atualizado com
o runbook.
```

### Fase 4 — Extrair os demais plugins

```
Contexto: plano docs/plugins-repos-separados-plano.md, Fase 4. Modelo provado com o broadcast.
Repetir a receita da Fase 3 para UM plugin (informar qual): academy | helpdesk | company-metrics |
birthdays | donations.

Tarefa (idêntica à Fase 3, trocando o nome):
- git filter-repo -> venore-plugin-<key> com histórico.
- package.json / tsconfig / eslint / drizzle.config / CI próprios; dep @venore/plugin-sdk ^1.
- git rm no core; conjunto pinado do CI do core atualizado.
- Provar: deploy com VENORE_PLUGINS incluindo esse plugin traz e ativa; sem ele, ausente e inerte.
- Casos especiais: donations não tem schema (sem db:migrate); academy tem bundle de curso
  (docs/cursos) — mover junto; helpdesk/company-metrics têm mais superfície de admin — conferir
  que todas as contribuições estão no manifesto (Fase 1).

Definition of Done: o plugin é um repo com CI verde; core sem a pasta dele; um deploy de teste
seleciona-o via VENORE_PLUGINS e funciona.
```

### Fase 5 — Suíte de integração + CI multi-repo

```
Contexto: plano docs/plugins-repos-separados-plano.md, Fase 5. Plugins extraídos. Precisa do
equivalente ao "um npm test cobre tudo".

Tarefa:
- Repo/job venore-integration: matriz (core ref) x (conjunto de plugins + versões). Para cada
  combinação: sync-plugins, npm ci, sobe o app (next start), roda db:migrate core + db:migrate:plugins
  contra um Postgres real, bate nas rotas de smoke de cada plugin (health + 1-2 rotas chave).
- CI de cada repo de plugin: testar contra @venore/plugin-sdk mín. suportado E latest.
- CI do core: qualquer mudança na superfície de packages/plugin-sdk dispara o job de integração
  (e é uma decisão de semver — documentar o processo).
- Documentar a política de versão do SDK (o que é major/minor/patch) no doc e no README do pacote.

Definition of Done: o job de integração roda e passa para o conjunto atual de plugins; um PR que
quebra a superfície do SDK falha no job de integração (provar com um PR de teste).
```

### Fase 6 — Runbook de deploy + limpeza

```
Contexto: plano docs/plugins-repos-separados-plano.md, Fase 6. Última fase.

Tarefa:
- docs/: runbook por instância — VENORE_PLUGINS, `git pull` core, `npm run sync-plugins`,
  `npm run db:migrate` (core) + `npm run db:migrate:plugins`. Um exemplo pro servidor LAN do
  broadcast (VENORE_PLUGINS=broadcast) e um pra uma instância cloud multi-plugin.
- Nova migration de core: neutralizar o INSERT hard-coded de plugins da
  0034_backfill_extension_install_state.sql — num core sem os pacotes, essas linhas de
  extensions.extension_state ficam órfãs e enganam o registry; torná-las inertes (ou deletar as que
  não têm updated_by_user_id e cujo plugin não está presente).
- install-fresh.ts: enumeração dinâmica de plugins; deixar de assumir o conjunto fixo.
- Limpar: db:migrate:<plugin> mortos do package.json, fixtures _fixture-cross-* migradas pro
  eslint-config, regras de boundary de plugin removidas do eslint.config.mjs do core.
- Atualizar AGENTS.md e docs/venore-docks.md: a seção "Sistema de plugins" passa a descrever repos
  separados + SDK + sync-plugins, não mais "import estático em registry.ts".

Definition of Done: lint/typecheck/test do core verdes; um `db:install:fresh` num banco vazio +
VENORE_PLUGINS=broadcast leva a um app funcional só com broadcast; AGENTS.md/venore-docks refletem
o modelo novo.
```

---

## Comparação final com a opção 2

| | Opção 2 (branches de deploy) | Opção 3 (este plano) |
|---|---|---|
| Atualizar core em N instâncias | `git merge main` por branch, conflito recorrente no `registry.ts` (+ delete/modify das pastas apagadas). Manual, N vezes por release. | `git pull` no core + `npm run sync-plugins`. Sem merge, sem conflito. O(1) por instância. |
| Estado por-instância | Um branch long-lived por instância, com um "trim commit" a manter. | Uma env var (`VENORE_PLUGINS`). Zero arquivo rastreado. |
| Código morto no bundle | Sim, a menos que apague pastas (e aí paga conflito). | Não — só o que foi sincronizado está no disco. |
| Custo de setup | ~0 de código; disciplina de branch pra sempre. | 2–4 semanas (SDK + audit + codegen + extração). |
| Custo recorrente | Imposto de merge ilimitado e manual, cresce com (branches × releases). | Contrato SDK versionado + job de integração + N+1 releases. Bounded e centralizável. |
| Quando escolher | ≤ 3–4 instâncias, releases espaçados. | Muitas instâncias / releases frequentes / muitas combinações de plugin. |

---

## Estado da implementação

### Fase 0 — auditoria de imports `@/…` dos 6 plugins (2026-09-02)

`grep -rhoE 'from "@/[^"]+"' src/plugins` (fora de `@/plugins/`), por frequência:

**Domínio / infra (superfície "server" do SDK):**
| import | usos | vira |
|---|---|---|
| `@/shared/types` (`OperationResult`) | 225 | `@venore/plugin-sdk` |
| `@/infrastructure/database/client` (`db`) | 201 | `@venore/plugin-sdk` |
| `@/observability` | 115 | `@venore/plugin-sdk` |
| `@/contexts/rbac` | 113 | `@venore/plugin-sdk` |
| `@/contexts/auth` | 59 | `@venore/plugin-sdk` |
| `@/contexts/cms` | 31 | `@venore/plugin-sdk` |
| `@/contexts/media` | 25 | `@venore/plugin-sdk` |
| `@/contexts/settings` | 11 | `@venore/plugin-sdk` |
| `@/contexts/import-export` | 6 | `@venore/plugin-sdk` |
| `@/contexts/web-push` | 1 | `@venore/plugin-sdk` |
| `@/platform/plugin-engine/is-plugin-active` | 43 | `@venore/plugin-sdk` |
| `@/platform/plugin-routing/types` | 7 | `@venore/plugin-sdk` |
| `@/platform/plugin-engine/manifest-schema` | 7 | `@venore/plugin-sdk` |
| `@/platform/plugin-engine/plugin-seed-registry` | 4 | `@venore/plugin-sdk` |
| `@/platform/breadcrumbs/{types,define-segment}` | 6 | `@venore/plugin-sdk` |
| `@/platform/brand/get-brand-config` | 2 | `@venore/plugin-sdk` |
| `@/platform/page-builder/rich-text/render` | 2 | `@venore/plugin-sdk` |
| `@/platform/media-usage/types`, `@/platform/media-lifecycle/delete-media-safely` | 2 | `@venore/plugin-sdk` |
| `@/platform/theme-rendering/resolve-brand-aesthetics` | 1 | `@venore/plugin-sdk` |
| `@/infrastructure/cache/memory-cache` | 2 | `@venore/plugin-sdk` |

**UI / client (surpresa — é um kit inteiro → `@venore/plugin-sdk/ui`):**
`@/components/ui/*` — button (97), input (35), badge (32), textarea (23), dialog (22), select (19),
card (11), progress (6), tabs (4), table (3), chart (3), alert-dialog (3), switch (2),
dropdown-menu (2), slider (1). Mais `@/components/{empty-state, admin-access-denied,
admin-page-header, media-picker-field(+.actions), admin-stat-tile, interactive-notation,
page-builder/block-renderer, pwa/push-toggle, pwa/offline-course-toggle}`,
`@/hooks/{use-action-toast (61), use-pitch-listener}`, `@/lib/{utils (cn, 17), pitch-class}`,
`@/platform/page-builder/{block-renderers (17), block-field-panels}`.

**Testes → `@venore/plugin-sdk/testing`:** `@/test-support/integration/{academy,helpdesk,birthdays}-seed`.

**Acoplamento a resolver na Fase 1 (core conhece nome de plugin):**
`@/platform/admin-shell/get-<plugin>-page-data` — um arquivo por plugin em `platform/admin-shell/`
(`academy`, `birthdays`, `helpdesk`, `donations`, `company-metrics`, `broadcast`). Idem
`@/platform/academy-student/*` (5). Precisa virar um loader de gate genérico que o plugin compõe,
não um arquivo por plugin no core.

### Decisões refinadas da Fase 0

- **`src/sdk/` com alias de tsconfig agora**, não `packages/` + workspaces. O SDK vive em
  `src/sdk/{index,ui,testing}.ts` re-exportando a superfície; `tsconfig.paths` mapeia
  `@venore/plugin-sdk` → `src/sdk/index.ts`, `@venore/plugin-sdk/ui` → `src/sdk/ui.ts`,
  `@venore/plugin-sdk/testing` → `src/sdk/testing.ts`. Vira pacote publicável de verdade só na
  extração (Fase 3), com bundle (tsup) reescrevendo os `@/…` internos.
- **Três entrypoints** por causa do split server/client (um plugin client não pode value-importar
  a superfície server — arrasta `pg`): `@venore/plugin-sdk` (server/domínio),
  `@venore/plugin-sdk/ui` (React client), `@venore/plugin-sdk/testing`.
- **`@venore/eslint-config`**: adiado pra Fase 3 (só é necessário quando os plugins são repos
  separados de fato). Enquanto in-tree, o `eslint.config.mjs` do core cobre.
- **Suíte de integração (Fase 5)**: começa como job no CI do core (matriz), não repo separado.
- **Enforcement da Fase 2**: `no-restricted-imports` proibindo `@/*` em `src/plugins/**` (só
  `@venore/plugin-sdk*` e relativo) — adicionado no fim da Fase 2, previne regressão.

### Fase 1 — progresso (2026-09-02)

Commits `a7df484` (parte 1) → `cd6a1e6` (parte 5). Cada parte com lint + typecheck + `npm run test`
verdes.

- **parte 1 — codegen.** `scripts/gen-plugin-registry.ts` varre `src/plugins/*/` presentes e gera
  `registry.generated.ts` / `route-registry.generated.ts` (gitignored, rodado nos `pre*` hooks do
  npm). `src/plugins/{registry,route-registry}.ts` viram reexport fino. Plugin ausente = não entra,
  sem import fixo pra quebrar o build.
- **parte 2 — modelo de contribuição.** `PluginContributions` (`platform/plugin-engine/
  plugin-contributions.ts`): breadcrumbs, `notificationAlert`, `mediaUsageResolver`, `userNavItems`,
  `seeds`. Cada plugin declara em `src/plugins/<key>/contributions.ts`; codegen agrega em
  `contributions.generated.ts`. 5 registries de `platform/` (breadcrumbs, notifications,
  media-usage, user-nav, seed-registry) deixam de `import "@/plugins/<x>"` e iteram
  `PLUGIN_CONTRIBUTIONS`. Handlers que puxam next-auth ficam atrás de `import()` preguiçoso.
- **parte 3 — blocos.** `blockDefinitions` (dado) entra em `contributions.ts`; `blockRenderers`
  vira loader preguiçoso (`() => import("./blocks/renderers")`) porque puxa a cadeia de auth.
  `blockFieldPanels` é client-reachable (builder do CMS) → tipo `PluginClientContributions` +
  `contributions.client.ts` + `contributions.client.generated.ts`, agregado à parte que **nunca**
  passa por `@/plugins/contributions` (server) nem por barrel de plugin. `block-registry.ts` /
  `block-renderers.tsx` / `block-field-panels.ts` iteram os agregados. `resolveBlockRenderer` /
  `listBlockRendererKeys` viraram async (memoizam o load preguiçoso).
- **parte 4 — academy-student.** `src/platform/academy-student/` (consumido só pelas rotas do
  próprio academy, importava `@/plugins/academy`) movido pra `src/plugins/academy/student/`.
- **parte 5 — gate admin de seção.** `get-<plugin>-page-data.ts` (6 arquivos quase idênticos em
  `platform/admin-shell/`) → `getPluginAdminPageData(pluginKey)`. As permissions da seção saem do
  manifesto (união dos `requiredPermission` da `navigation`). 13 call sites atualizados.

- **parte 6a — rotas standalone + slot via registro** (commit `8fbde16`). Os 5 shims físicos de
  reexport (`export { default } from "@/plugins/<x>/..."`) viravam import quebrado sem o plugin.
  Trocados por dispatchers genéricos que resolvem pela route-table em runtime (opção "registro em
  runtime", não codegen). `PluginRouteTable` ganha 2 áreas: `standalone` (páginas fora da shell
  `(platform)`, caminho completo) e `sidebarContextual` (slot paralelo). Resolvers novos
  (`resolve-standalone-route.ts`, `resolve-sidebar-contextual-route.ts`).
  `src/app/{broadcast,chamados,company-metrics}/[...slug]/page.tsx` = 1 dispatcher por prefixo de
  URL (só o prefixo é físico); `src/app/(platform)/@sidebarContextual/[...slug]/page.tsx` =
  dispatcher único do slot (catch-all **obrigatório** — `[[...slug]]` colide com a page `/` do
  route group no `next build`).
- **parte 6b — páginas de conteúdo via contribuição** (commit `cabf7f5`). `PluginContributions`
  ganha `adminDashboardPanel` e `publicHomeShowcase` (thunks preguiçosos com gate/fetch próprio →
  JSX ou null; a página do core usa o primeiro não-nulo). JSX movido do core pro plugin em
  `src/plugins/academy/content-slots/`. `admin/page.tsx` e `(platform)/page.tsx` deixam de
  importar `@/plugins/academy`.

**Fase 1 concluída.** `grep -rn "@/plugins/<nome>" src/platform src/app` = 0 (só os agregados
genéricos `registry`/`route-registry`/`contributions`/`contributions.client`, que são o próprio
sistema de plugin, não plugin específico). `npm run build` passa; passa também com
`src/plugins/broadcast/` removido (dispatcher genérico → `notFound()`).

**Achado pra Fase 2:** `academy` importava `@/plugins/donations` (barrel) em 4 rotas —
dependência cross-plugin OPCIONAL. Resolver na Fase 2 (SDK): `import()` preguiçoso ou barrel de
donations sempre resolvível.

### Core esvaziado dos plugins (2026-09-02, commits `03ac7bd`..`40a5af1`)

Decisão do dono: o repo venore-docks NÃO deve conter código nem domínio de plugin. Os 6 plugins
foram feitos backup e **removidos**; serão reconstruídos como repos próprios contra o contrato
limpo (SDK + registries gerados + dispatchers genéricos).

- `03ac7bd` — remove `src/plugins/{academy,birthdays,broadcast,company-metrics,donations,helpdesk}/`
  (~125k linhas), os `*-seed.ts` de plugin (`seedUser` genérico → `test-support/integration/
  user-seed.ts`), `src/sdk/testing.ts`, os `db:*:<plugin>` do package.json, scripts e docs de
  plugin. Codegen já degrada pra registries vazios; testes de block-registry/-renderers passam a
  usar fixtures locais.
- `6939c0b` — `src/app/{broadcast,chamados,company-metrics}/` (prefixo nomeado) → **um** prefixo
  genérico: `src/app/ext/[...slug]/page.tsx`. Toda rota shell-less de plugin vira
  `/ext/<caminho-que-o-plugin-declara>` (área `standalone` da route-table). Escolha do dono:
  "prefixo genérico único" (URLs dos plugins mudam — ok, vão ser reconstruídos).
  `has-sidebar-contextual-content.ts` deriva os padrões de `PLUGIN_ROUTE_TABLES`.
- `40a5af1` — varre nome/domínio de plugin de `contexts/` e do resto: `contexts/media` perde os 2
  uploads de categoria reservada de plugin (activity-submission/ticket-attachment) + constantes;
  `observability/origin-registry.ts` deriva nomes de plugin do `PLUGIN_REGISTRY`; primitivos de
  música (`interactive-notation`, `use-pitch-listener`, `pitch-class`) e `offline-course-toggle`
  removidos de `src/components|hooks|lib` + `sdk/ui.ts`; `public/sw.js` perde o cache de aulas;
  `app/manifest.ts` neutro; `package.json` perde `abcjs`/`pitchy`/`qrcode`/`papaparse`.

Estado: `npm run lint` + `typecheck` + `test` (177 arq/767) + `build` verdes com `src/plugins/`
só com `.gitkeep` + os 4 arquivos de reexport (`registry`/`route-registry`/`contributions`/
`contributions.client`) + os fixtures `_fixture-cross-*` do teste de boundary.

**Pendências deixadas explícitas:**
- `src/app/(platform)/page.tsx` redireciona usuário logado não-admin pra `/academy` — decisão de
  produto (o que a home faz sem o plugin de área do aluno?), não mexido.
- `docs/venore-docks.md` + `AGENTS.md` ainda descrevem os 6 plugins como se estivessem no repo —
  passada de docs pendente.
- `contexts/media`: quando o 1º plugin voltar, avaliar um handler genérico
  `uploadReservedCategoryAsset(categoryKey, name, ...)` no core em vez de um por plugin.
- `src/components/ui/chart` (recharts) fica — é primitivo shadcn do kit, não código de plugin.

### Mecanismo de sync + contrato do SDK validado (2026-09-02, NÃO commitado)

- **`.gitignore`**: `/src/plugins/*/` ignorado (com `!` pros `_fixture-cross-*`); `venore.plugins.json`
  ignorado. Só os 4 reexports diretos ficam versionados.
- **`scripts/sync-plugins.ts`** (`npm run sync:plugins`): lê `venore.plugins.json` (`{plugins:[{key,repo,ref}]}`)
  ou `VENORE_PLUGINS` + `VENORE_PLUGIN_REPO_BASE`. Clona/atualiza cada `venore-plugin-<key>` em
  `src/plugins/<key>/` (shallow, `git checkout --force FETCH_HEAD` + `git clean` na atualização),
  remove os que saíram da config (só os que têm `.git` — não toca no que foi posto à mão), e roda
  o codegen. Sem config = no-op. `.env.example` + `venore.plugins.example.json` incluídos.
- **Validado end-to-end** com um plugin mínimo externo (`venore-plugin-hello`, repo git local):
  `sync:plugins` clonou → `git status` limpo (gitignored) → codegen achou → `typecheck`/`lint`/
  `build` verdes com o plugin de fora importando só `@venore/plugin-sdk`.
- **Gap do SDK achado e corrigido**: `PluginContributions`/`PluginSeedFn` não eram exportados de
  `@venore/plugin-sdk` (só de `@/platform/...`); `PluginClientContributions` faltava em
  `@venore/plugin-sdk/ui`. Adicionados. (Esperado achar mais buracos ao reconstruir um plugin de
  verdade — Fase 2.)
- **Ainda falta pra Fase 2**: `no-restricted-imports` proibindo `@/*` em `src/plugins/**` (depende
  de decidir como lintar pasta sincronizada/gitignored); reconstruir os 6 plugins de verdade
  contra o contrato; `vercel-build`/deploy chamando `sync:plugins` antes do build.
