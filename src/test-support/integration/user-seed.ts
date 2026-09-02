// Seed genérico de usuário pros testes de integração do core. Fica fora de src/contexts/* e
// src/plugins/* de propósito: eslint-plugin-boundaries só classifica elementos por esses dois
// padrões de pasta, e este módulo precisa tocar o schema de auth diretamente — não existe API
// pública pra criar um usuário (só nasce via evento do DrizzleAdapter, exceção já documentada no
// AGENTS.md), então o insert em auth.users é o único acesso cru necessário.
import { randomUUID } from "node:crypto";
import { db } from "@/infrastructure/database/client";
import { users } from "@/contexts/auth/database/schema";

export async function seedUser(
  overrides: Partial<{ email: string; name: string }> = {},
): Promise<{ id: string; email: string }> {
  const [row] = await db
    .insert(users)
    .values({
      email: overrides.email ?? `${randomUUID()}@integration.test`,
      name: overrides.name ?? "Integration Test User",
    })
    .returning({ id: users.id, email: users.email });
  return row;
}
