import { randomUUID } from "node:crypto";
import { sql } from "drizzle-orm";
import { afterEach, describe, expect, it } from "vitest";
import { db } from "@/infrastructure/database/client";
import { invalidateCache } from "@/infrastructure/cache/memory-cache";
import { seedUser } from "@/test-support/integration/user-seed";
import { previewPluginUninstall } from "./preview-plugin-uninstall";
import { performPluginUninstall } from "./uninstall-plugin";
import { runPluginMigrations } from "./run-plugin-migrations";

// Alvo: company-metrics (schema `company_metrics`, tracking próprio, permissions
// `company-metrics.*`). Prova o "modo B" ponta a ponta: dropar schema + limpar
// settings/rbac/extension_state numa transação, sem tocar o core. Restaura o schema no afterAll
// (o globalSetup não roda de novo entre arquivos) — mesmo padrão de
// run-plugin-migrations.integration.test.ts.
const PLUGIN_KEY = "company-metrics";
const DATA_SCHEMA = "company_metrics";
const TRACKING_SCHEMA = "company_metrics_migrations";
const NAMESPACE = `${PLUGIN_KEY}.%`;

const PLUGIN_TABLES = [
  "metric_definitions",
  "metric_values",
  "sector_groups",
  "sector_members",
  "sectors",
  "target_inputs",
  "targets",
  "tv_boards",
  "tv_screens",
];

async function scalar(query: ReturnType<typeof sql>): Promise<number> {
  const result = await db.execute(query);
  return Number((result.rows[0] as { value: string | number }).value);
}

async function markInstalled(actorId: string): Promise<void> {
  await db.execute(sql`
    insert into extensions.extension_state (kind, key, enabled, installed_at, updated_by_user_id)
    values ('plugin', ${PLUGIN_KEY}, true, now(), ${actorId})
    on conflict (kind, key) do update set installed_at = now(), enabled = true, updated_by_user_id = ${actorId}
  `);
  // performPluginUninstall lê listExtensionStates (cacheado) pra decidir se está instalado.
  invalidateCache("extensions:list:plugin");
  invalidateCache(`extensions:plugin:${PLUGIN_KEY}`);
}

describe("performPluginUninstall (integração) — modo B: limpar banco", () => {
  let testRoleId: string | null = null;

  afterEach(async () => {
    await db.execute(sql`delete from extensions.extension_state where kind = 'plugin' and key = ${PLUGIN_KEY}`);
    await db.execute(sql`delete from settings.settings where key like ${NAMESPACE}`);
    if (testRoleId) {
      await db.execute(sql`delete from rbac.roles where id = ${testRoleId}`);
      testRoleId = null;
    }
    invalidateCache("extensions:list:plugin");
    invalidateCache(`extensions:plugin:${PLUGIN_KEY}`);

    // O primeiro teste dropa o schema do plugin (modo B). Recompõe já no afterEach — não só no
    // afterAll — porque o teste seguinte ("bloqueia... não instalado") verifica que o schema
    // segue de pé, e roda ANTES do afterAll. runPluginMigrations é idempotente.
    await runPluginMigrations(PLUGIN_KEY);
  });

  it("dropa os schemas, apaga settings e permissions do namespace, marca não-instalado e não toca o core", async () => {
    const actor = await seedUser();
    await markInstalled(actor.id);

    // Footprint do plugin: 1 linha de dado, 1 setting no namespace, 1 concessão de permission.
    await db.execute(sql`
      insert into ${sql.raw(`"${DATA_SCHEMA}"."sectors"`)} (id, key, name, position)
      values (${randomUUID()}, ${`sec-${randomUUID()}`}, 'Setor Teste', 0)
    `);
    await db.execute(sql`
      insert into settings.settings (key, value) values (${`${PLUGIN_KEY}.timezone`}, to_jsonb(${"UTC"}::text))
    `);
    testRoleId = randomUUID();
    await db.execute(sql`
      insert into rbac.roles (id, key, name) values (${testRoleId}, ${`role-${randomUUID()}`}, 'Papel de Teste')
    `);
    await db.execute(sql`
      insert into rbac.role_permissions (role_id, permission_key)
      values (${testRoleId}, ${`${PLUGIN_KEY}.read`}), (${testRoleId}, ${`${PLUGIN_KEY}.manage`})
    `);

    // Baseline do core.
    const usersBefore = await scalar(sql`select count(*)::int as value from auth.users`);
    const coreMigrationsBefore = await scalar(
      sql`select count(*)::int as value from drizzle.__drizzle_migrations`,
    );

    // Preview reporta o que vai sumir.
    const preview = await previewPluginUninstall(PLUGIN_KEY);
    expect(preview.dataSchema).toBe(DATA_SCHEMA);
    expect(preview.migrationsSchema).toBe(TRACKING_SCHEMA);
    expect(preview.tables.map((table) => table.name).sort()).toEqual(PLUGIN_TABLES);
    expect(preview.tables.find((table) => table.name === "sectors")?.rowCount).toBe(1);
    expect(preview.settingsCount).toBe(1);
    expect(preview.grantedPermissionCount).toBe(2);

    const result = await performPluginUninstall({ pluginKey: PLUGIN_KEY, actorId: actor.id });
    expect(result).toEqual({ success: true, data: undefined });

    // Schemas do plugin sumiram (dado + tracking).
    const schemasLeft = await scalar(sql`
      select count(*)::int as value from information_schema.schemata
      where schema_name in (${DATA_SCHEMA}, ${TRACKING_SCHEMA})
    `);
    expect(schemasLeft).toBe(0);

    // Settings e permissions do namespace sumiram.
    expect(await scalar(sql`select count(*)::int as value from settings.settings where key like ${NAMESPACE}`)).toBe(0);
    expect(
      await scalar(sql`select count(*)::int as value from rbac.role_permissions where permission_key like ${NAMESPACE}`),
    ).toBe(0);

    // extension_state voltou pra "disponível".
    const stateRow = await db.execute(sql`
      select installed_at, enabled from extensions.extension_state where kind = 'plugin' and key = ${PLUGIN_KEY}
    `);
    expect((stateRow.rows[0] as { installed_at: unknown }).installed_at).toBeNull();

    // Core intacto: usuários, papéis e o cursor de migration do core não foram tocados.
    expect(await scalar(sql`select count(*)::int as value from auth.users`)).toBe(usersBefore);
    expect(await scalar(sql`select count(*)::int as value from drizzle.__drizzle_migrations`)).toBe(
      coreMigrationsBefore,
    );
    expect(await scalar(sql`select count(*)::int as value from rbac.roles where id = ${testRoleId}`)).toBe(1);
  });

  it("bloqueia a desinstalação de um plugin que não está instalado", async () => {
    const actor = await seedUser();
    // sem markInstalled
    invalidateCache("extensions:list:plugin");

    const result = await performPluginUninstall({ pluginKey: PLUGIN_KEY, actorId: actor.id });
    expect(result).toMatchObject({ success: false, error: { code: "plugin-engine.uninstall.not_installed" } });

    // Schema segue intacto.
    const schemaStillThere = await scalar(sql`
      select count(*)::int as value from information_schema.schemata where schema_name = ${DATA_SCHEMA}
    `);
    expect(schemaStillThere).toBe(1);
  });
});
