import { listAvailableAuthProviders } from "@/contexts/auth";
import { superadminExists } from "@/contexts/rbac";
import { getBrandConfig } from "@/platform/brand/get-brand-config";
import { resolveBrandAesthetics } from "@/platform/theme-rendering/resolve-brand-aesthetics";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { signInWithPasswordAction, signInWithProviderAction, signUpWithPasswordAction } from "../actions";
import { PasswordInput } from "./password-input";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; notice?: string }>;
}) {
  const { error, notice } = await searchParams;
  const providers = listAvailableAuthProviders();
  const oauthProviders = providers.filter((provider) => provider.kind === "oauth" && provider.enabled);
  const passwordProvider = providers.find((provider) => provider.kind === "password" && provider.enabled);

  const superadminExistsResult = await superadminExists();
  const showBootstrapNotice = superadminExistsResult.success && !superadminExistsResult.data;

  const aesthetics = await resolveBrandAesthetics();
  const brand = await getBrandConfig(aesthetics.mode);

  // Mesagem de erro: o código PT já vem pronto do service (?error=<message>); "invalid-credentials"
  // é o único legado por código, mapeado aqui pra não quebrar o link do signInWithPasswordAction.
  const errorMessage = error === "invalid-credentials" ? "Usuário ou senha inválidos." : (error ?? null);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 bg-background px-4 text-foreground">
      <div className="w-full max-w-sm space-y-6 rounded-panel border border-border bg-card p-8 shadow-panel">
        <div className="space-y-3 text-center">
          {aesthetics.mode === "text" ? (
            <span className="block text-lg font-semibold text-foreground">{brand.siteName}</span>
          ) : aesthetics.mode === "png" ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={brand.logoUrl} alt={brand.siteName} className="mx-auto h-12 w-auto object-contain" />
          ) : (
            <span
              role="img"
              aria-label={brand.siteName}
              className="mx-auto block h-12 w-48 bg-foreground"
              style={{
                maskImage: `url('${brand.logoUrl}')`,
                WebkitMaskImage: `url('${brand.logoUrl}')`,
                maskRepeat: "no-repeat",
                WebkitMaskRepeat: "no-repeat",
                maskPosition: "center",
                WebkitMaskPosition: "center",
                maskSize: "contain",
                WebkitMaskSize: "contain",
              }}
            />
          )}
          <div className="space-y-1">
            <h1 className="text-lg font-semibold">Entrar</h1>
            <p className="text-sm text-muted-foreground">Acesse com uma das opções abaixo.</p>
          </div>
        </div>

        {showBootstrapNotice ? (
          <p className="rounded-control border border-border bg-accent/14 px-3 py-2 text-xs text-foreground">
            Nenhum superadmin foi configurado ainda. O próximo cadastro (ou login) se torna o superadmin inicial.
          </p>
        ) : null}

        {notice === "registration-pending" ? (
          <p className="rounded-control border border-border bg-accent/14 px-3 py-2 text-xs text-foreground">
            Conta criada. Um administrador precisa aprovar seu acesso antes do primeiro login.
          </p>
        ) : null}

        {errorMessage ? (
          <p className="rounded-control border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs text-destructive">
            {errorMessage}
          </p>
        ) : null}

        <div className="space-y-2">
          {oauthProviders.map((provider) => (
            <form key={provider.key} action={signInWithProviderAction}>
              <input type="hidden" name="provider" value={provider.key} />
              <Button type="submit" variant="outline" className="w-full gap-2">
                {provider.iconUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={provider.iconUrl} alt="" aria-hidden="true" className="h-4 w-4" />
                ) : null}
                Entrar com {provider.label}
              </Button>
            </form>
          ))}
        </div>

        {passwordProvider ? (
          <form action={signInWithPasswordAction} className="space-y-2">
            <div className="space-y-2">
              <Input name="username" placeholder="Email ou usuário" autoComplete="username" required />
              <PasswordInput name="password" placeholder="Senha" autoComplete="current-password" required />
            </div>
            <Button type="submit" className="w-full">
              Entrar com senha
            </Button>
          </form>
        ) : null}

        {passwordProvider ? (
          <details className="text-sm">
            <summary className="cursor-pointer text-muted-foreground">Criar conta</summary>
            <form action={signUpWithPasswordAction} className="mt-3 space-y-2">
              <Input name="name" placeholder="Nome" autoComplete="name" required />
              <Input name="email" type="email" placeholder="Email" autoComplete="email" required />
              <PasswordInput
                name="password"
                placeholder="Senha (mín. 8 caracteres)"
                autoComplete="new-password"
                required
                minLength={8}
              />
              <Button type="submit" variant="outline" className="w-full">
                Criar conta
              </Button>
              <p className="text-xs text-muted-foreground">
                O acesso fica pendente até um administrador aprovar.
              </p>
            </form>
          </details>
        ) : null}
      </div>
    </main>
  );
}
