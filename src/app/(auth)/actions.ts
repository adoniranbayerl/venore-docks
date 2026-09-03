"use server";

import { AuthError } from "next-auth";
import { redirect } from "next/navigation";
import { getCurrentUser, registerWithPassword, signIn, signOut } from "@/contexts/auth";
import { grantSuperadmin, superadminExists } from "@/contexts/rbac";
import { handleUserRegistered } from "@/platform/registration/handle-user-registered";

export async function signInWithProviderAction(formData: FormData) {
  const provider = String(formData.get("provider") ?? "");
  if (!provider) return;

  await signIn(provider, { redirectTo: "/post-login" });
}

export async function signInWithPasswordAction(formData: FormData) {
  const username = String(formData.get("username") ?? "");
  const password = String(formData.get("password") ?? "");

  try {
    await signIn("credentials", { username, password, redirect: false });
  } catch (error) {
    if (error instanceof AuthError) {
      redirect("/login?error=invalid-credentials");
    }
    throw error;
  }

  redirect("/post-login");
}

// Registro por senha (provider Credentials). Cria o usuário e roda a mesma composição que o
// evento `createUser` do Auth.js roda pro OAuth (handle-user-registered): primeiro usuário do
// sistema vira superadmin; os demais nascem "pending" e dependem de aprovação do superadmin —
// por isso não há confirmação por email aqui (pedido do dono: quem autoriza é o superadmin).
export async function signUpWithPasswordAction(formData: FormData) {
  const name = String(formData.get("name") ?? "");
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");

  const registered = await registerWithPassword({ name, email, password });
  if (!registered.success) {
    redirect(`/login?error=${encodeURIComponent(registered.error.message)}`);
  }

  const composed = await handleUserRegistered({
    id: registered.data.id,
    email: registered.data.email,
    name: registered.data.name,
  });
  if (!composed.success) {
    redirect(`/login?error=${encodeURIComponent(composed.error.message)}`);
  }

  // Entra já se o registro virou superadmin inicial (status "approved"); se ficou "pending", o
  // provider Credentials recusa (providers.ts) — cai no catch e mostra o aviso de aprovação.
  try {
    await signIn("credentials", { username: email, password, redirect: false });
  } catch (error) {
    if (error instanceof AuthError) {
      redirect("/login?notice=registration-pending");
    }
    throw error;
  }

  redirect("/post-login");
}

export async function signOutAction() {
  await signOut({ redirect: false });
  redirect("/login");
}

export async function bootstrapSuperadminAction() {
  // P1 — escalada de privilégio: o gate ficava só na página /setup. Sem re-checar aqui, um POST
  // direto nesta action concederia superadmin mesmo já existindo um. (grantSuperadmin também
  // recusa no handler; esta checagem evita a chamada e manda pra lugar sensato.)
  const existsResult = await superadminExists();
  if (existsResult.success && existsResult.data) {
    redirect("/post-login");
  }

  const currentUser = await getCurrentUser();
  if (!currentUser.success || !currentUser.data) {
    redirect("/login");
  }

  const result = await grantSuperadmin({ userId: currentUser.data.id });
  if (!result.success) {
    redirect("/setup");
  }
  redirect("/admin");
}
