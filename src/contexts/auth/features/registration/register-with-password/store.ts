import { sql } from "drizzle-orm";
import { db } from "@/infrastructure/database/client";
import { users } from "../../../database/schema";
import type { RegisteredUser } from "./types";

// Escrita direta em auth.users — mesma exceção já documentada do DrizzleAdapter do Auth.js
// (docs/venore-docks.md — "DrizzleAdapter escreve direto em users/accounts/sessions sem passar
// por store.ts"): não existe API pública de "criar usuário". O adapter cobre o fluxo OAuth; este
// store é o equivalente pro provider Credentials, que não tem adapter.

// Comparação de email case-insensitive: o registro normaliza pra lowercase antes de gravar, mas
// um usuário criado por OAuth pode ter vindo com caixa diferente do provider.
export async function findUserIdByEmail(email: string): Promise<string | null> {
  const [row] = await db
    .select({ id: users.id })
    .from(users)
    .where(sql`lower(${users.email}) = ${email.toLowerCase()}`)
    .limit(1);
  return row?.id ?? null;
}

export async function insertUserWithPassword(input: {
  email: string;
  name: string;
  passwordHash: string;
}): Promise<RegisteredUser> {
  const [row] = await db
    .insert(users)
    .values({ email: input.email, name: input.name, passwordHash: input.passwordHash })
    .returning({ id: users.id, email: users.email, name: users.name });
  return row;
}

// Backstop de corrida entre o pré-check de email e o insert — na prática improvável (registro
// anônimo, sem retry automático), mas a unique constraint de auth.users.email é quem garante a
// integridade de verdade. Exportado só pra o service traduzir a violação num OperationResult.
export function isUniqueViolation(error: unknown): boolean {
  return typeof error === "object" && error !== null && "code" in error && (error as { code?: string }).code === "23505";
}
