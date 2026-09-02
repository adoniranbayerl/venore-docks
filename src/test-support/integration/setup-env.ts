import { sql } from "drizzle-orm";
import { beforeEach } from "vitest";
import { requireTestDatabaseUrl } from "./require-test-database-url";

// Precisa rodar ANTES de qualquer import estático de @/infrastructure/database/client (que abre
// o Pool no top-level do módulo, lendo DATABASE_URL na hora do import) — setupFiles do Vitest
// terminam de executar antes do arquivo de teste ser importado, então esta atribuição sempre
// vence a corrida. Ver AGENTS.md, seção "Testes de integração".
process.env.DATABASE_URL = requireTestDatabaseUrl();

// Tabelas do CORE tocadas pelos use cases sob teste. TRUNCATE ... CASCADE em vez de transação com
// rollback: vários stores abrem sua própria db.transaction() pegando uma conexão nova do pool de
// app — uma transação externa não commitada não seria visível pra essas conexões internas.
// TRUNCATE não tem esse problema e não exige nenhuma mudança em client.ts. Um plugin com testes
// de integração acrescenta as próprias tabelas a partir do seu domínio.
const INTEGRATION_TEST_TABLES = [
  "cms.entries",
  "cms.content_types",
  "cms.categories",
  "auth.users",
];
// rbac.user_roles / rbac.role_assignment_scopes não precisam entrar aqui: ambas têm FK
// (onDelete: cascade) para auth.users, então o TRUNCATE ... CASCADE de "auth.users" já as
// esvazia. rbac.roles / rbac.role_permissions ficam de fora de propósito — são semeados uma vez
// e o self-heal (ensureBaseRbacDataSeeded) é idempotente.

beforeEach(async () => {
  // Import dinâmico de propósito: um import estático seria hoisted e avaliado antes da
  // atribuição de DATABASE_URL acima, no mesmo módulo.
  const { db } = await import("@/infrastructure/database/client");
  await db.execute(sql.raw(`TRUNCATE TABLE ${INTEGRATION_TEST_TABLES.join(", ")} CASCADE`));
});
