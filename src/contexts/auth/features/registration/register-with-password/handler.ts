// Sem authorizeActor: registro é ação anônima (visitante sem sessão), não há ator pra autorizar.
// A porta de entrada é o Server Action em src/app/(auth)/actions.ts, que só a expõe quando o
// provider de senha está habilitado. O controle de acesso ao sistema é o status "pending" +
// aprovação do superadmin (src/platform/registration/handle-user-registered.ts), aplicado pelo
// chamador logo após este handler.
import { registerWithPassword } from "./service";
import type { RegisterWithPasswordInput, RegisterWithPasswordResult } from "./types";

export async function registerWithPasswordHandler(
  input: RegisterWithPasswordInput,
): Promise<RegisterWithPasswordResult> {
  return registerWithPassword(input);
}
