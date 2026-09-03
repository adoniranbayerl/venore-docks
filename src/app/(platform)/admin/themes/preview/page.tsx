import Link from "next/link";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { getSettingsPageData } from "@/platform/admin-shell/get-settings-page-data";
import { listThemeStates } from "@/platform/theme-engine/list-theme-states";

// Kitchen-sink de tokens/primitivos sob um data-theme FORÇADO num wrapper — o seletor
// [data-theme="x"] casa em qualquer elemento e as custom properties cascateiam pro subtree, então
// dá pra revisar qualquer tema sem ativá-lo. Rota só-admin (gate settings.manage), pensada pra
// inspeção visual: pega token faltando/errado num tema novo antes de publicar.

const SWATCHES: { label: string; className: string }[] = [
  { label: "background", className: "bg-background" },
  { label: "foreground", className: "bg-foreground" },
  { label: "card", className: "bg-card" },
  { label: "popover", className: "bg-popover" },
  { label: "primary", className: "bg-primary" },
  { label: "primary-fg", className: "bg-primary-foreground" },
  { label: "secondary", className: "bg-secondary" },
  { label: "muted", className: "bg-muted" },
  { label: "muted-fg", className: "bg-muted-foreground" },
  { label: "accent", className: "bg-accent" },
  { label: "accent-fg", className: "bg-accent-foreground" },
  { label: "destructive", className: "bg-destructive" },
  { label: "border", className: "bg-border" },
  { label: "ring", className: "bg-ring" },
  { label: "warning", className: "bg-warning" },
  { label: "warning-soft", className: "bg-warning-soft" },
  { label: "overlay-fg", className: "bg-overlay-foreground" },
];

const RADII = ["rounded-sm", "rounded-md", "rounded-lg", "rounded-xl", "rounded-2xl", "rounded-3xl"] as const;
const SHADOWS = ["shadow-panel", "shadow-float", "shadow-header"] as const;

export default async function ThemePreviewPage({
  searchParams,
}: {
  searchParams: Promise<{ theme?: string; dark?: string }>;
}) {
  const gate = await getSettingsPageData();
  if (!gate.granted) {
    return (
      <div className="rounded-panel border border-border bg-card ui-panel-padding-roomy text-center">
        <h1 className="text-lg font-semibold text-foreground">Acesso negado</h1>
      </div>
    );
  }

  const themes = await listThemeStates();
  const { theme, dark: darkParam } = await searchParams;
  const selected = themes.find((t) => t.manifest.key === theme) ?? themes.find((t) => t.isActive) ?? themes[0];
  const themeKey = selected?.manifest.key ?? "venore-slime";
  const dark = darkParam === "1";

  const href = (key: string, isDark: boolean) => `/admin/themes/preview?theme=${key}${isDark ? "&dark=1" : ""}`;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Amostra dos temas</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Tokens e primitivos sob <code className="text-xs">data-theme=&quot;{themeKey}&quot;</code>
            {dark ? " .dark" : ""} — sem ativar o tema. <Link href="/admin/themes" className="text-primary underline">voltar</Link>
          </p>
        </div>
        <Link href={href(themeKey, !dark)} className="text-sm text-primary underline">
          {dark ? "ver modo claro" : "ver modo escuro"}
        </Link>
      </div>

      <div className="flex flex-wrap gap-2">
        {themes.map((t) => (
          <Link
            key={t.manifest.key}
            href={href(t.manifest.key, dark)}
            className={
              "rounded-md border px-3 py-1 text-xs ui-motion-base " +
              (t.manifest.key === themeKey
                ? "border-ring bg-accent/14 text-foreground"
                : "border-border text-muted-foreground hover:text-foreground")
            }
          >
            {t.manifest.name}
          </Link>
        ))}
      </div>

      {/* wrapper com o data-theme forçado — tudo abaixo herda os tokens desse tema */}
      <div
        data-theme={themeKey}
        className={(dark ? "dark " : "") + "space-y-8 rounded-panel border border-border bg-background p-6 text-foreground"}
      >
        <section className="space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-caps text-muted-foreground">Cores</h2>
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
            {SWATCHES.map((s) => (
              <div key={s.label} className="space-y-1">
                <div className={`h-12 w-full rounded-md border border-border ${s.className}`} />
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-caps text-muted-foreground">Botões</h2>
          <div className="flex flex-wrap items-center gap-3">
            <Button>Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="destructive">Destructive</Button>
            <Button variant="link">Link</Button>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Button size="sm">sm</Button>
            <Button>default</Button>
            <Button size="lg">lg</Button>
            <Button disabled>disabled</Button>
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-caps text-muted-foreground">Formulário</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <Input placeholder="Input de texto" />
            <Input placeholder="Desabilitado" disabled />
            <Textarea placeholder="Textarea" rows={2} />
            <div className="flex items-center gap-2">
              <Switch id="preview-switch" defaultChecked />
              <label htmlFor="preview-switch" className="text-sm text-muted-foreground">Switch</label>
            </div>
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-caps text-muted-foreground">Badges</h2>
          <div className="flex flex-wrap gap-2">
            <Badge>Default</Badge>
            <Badge variant="secondary">Secondary</Badge>
            <Badge variant="outline">Outline</Badge>
            <Badge variant="destructive">Destructive</Badge>
          </div>
        </section>

        <section className="grid gap-4 sm:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Card</CardTitle>
              <CardDescription>Título, descrição e corpo sobre bg-card.</CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Texto de corpo com <span className="text-foreground">ênfase</span> e{" "}
              <a href="#" className="text-primary underline">link</a>.
            </CardContent>
          </Card>
          <Alert>
            <AlertTitle>Alert</AlertTitle>
            <AlertDescription>Mensagem informativa no estilo do tema.</AlertDescription>
          </Alert>
        </section>

        <section className="space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-caps text-muted-foreground">Tipografia</h2>
          <p className="text-3xl font-bold tracking-display text-foreground">Display 3xl bold</p>
          <p className="text-xl font-semibold text-foreground">Título xl semibold</p>
          <p className="text-base text-foreground">Corpo base — the quick brown fox jumps over the lazy dog.</p>
          <p className="text-sm text-muted-foreground">Secundário sm muted-foreground.</p>
          <p className="text-xs uppercase tracking-caps text-muted-foreground">Overline xs caps</p>
        </section>

        <section className="space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-caps text-muted-foreground">Raio &amp; sombra</h2>
          <div className="flex flex-wrap gap-3">
            {RADII.map((r) => (
              <div key={r} className={`grid size-16 place-items-center border border-border bg-card text-xs text-muted-foreground ${r}`}>
                {r.replace("rounded-", "")}
              </div>
            ))}
          </div>
          <div className="flex flex-wrap gap-4 pt-2">
            {SHADOWS.map((s) => (
              <div key={s} className={`grid size-16 place-items-center rounded-lg bg-card text-xs text-muted-foreground ${s}`}>
                {s.replace("shadow-", "")}
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
