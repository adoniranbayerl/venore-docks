import type { OperationResult } from "@/shared/types";

export type RegisterWithPasswordInput = {
  email: string;
  name: string;
  password: string;
};

// Identidade do usuário recém-criado — o ponto de composição
// (src/platform/registration/handle-user-registered.ts) usa isso pra decidir superadmin inicial
// vs. pending, exatamente como o evento `createUser` do Auth.js faz pro fluxo OAuth.
export type RegisteredUser = { id: string; email: string; name: string | null };

export type RegisterWithPasswordResult = OperationResult<RegisteredUser>;
