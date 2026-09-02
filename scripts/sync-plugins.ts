// Sincroniza os plugins escolhidos por esta instância para src/plugins/<key>/ (gitignored) e
// regenera os registries. Opção 3 do docs/plugins-repos-separados-plano.md: cada plugin é um repo
// próprio; o core não versiona nenhum. `git pull` no core + `npm run sync:plugins` no deploy.
//
// Fontes de config (a primeira que existir vence):
//   1. venore.plugins.json na raiz (gitignored):
//        { "plugins": [ { "key": "broadcast", "repo": "https://.../venore-plugin-broadcast.git", "ref": "main" } ] }
//   2. env VENORE_PLUGINS="broadcast,academy@v1.2.0"  (key ou key@ref, vírgula-separado)
//      + env VENORE_PLUGIN_REPO_BASE="https://github.com/adoniranbayerl/venore-plugin-"
//      (o repo de cada key vira `${BASE}${key}.git`)
//
// Sem nenhuma config: no-op (só roda o codegen, que gera registries vazios).

import { execFileSync, execSync } from "node:child_process";
import { existsSync, readFileSync, readdirSync, rmSync } from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const PLUGINS_DIR = path.join(ROOT, "src/plugins");
const CONFIG_FILE = path.join(ROOT, "venore.plugins.json");

type PluginSpec = { key: string; repo: string; ref: string };

function git(args: string[], cwd = ROOT): string {
  return execFileSync("git", args, { cwd, stdio: ["ignore", "pipe", "inherit"] }).toString().trim();
}

function readConfig(): PluginSpec[] {
  if (existsSync(CONFIG_FILE)) {
    const parsed = JSON.parse(readFileSync(CONFIG_FILE, "utf8")) as { plugins?: Partial<PluginSpec>[] };
    return (parsed.plugins ?? []).map((entry, index) => {
      if (!entry.key || !entry.repo) {
        throw new Error(`venore.plugins.json: entrada ${index} precisa de "key" e "repo".`);
      }
      return { key: entry.key, repo: entry.repo, ref: entry.ref ?? "main" };
    });
  }

  const list = (process.env.VENORE_PLUGINS ?? "").split(",").map((s) => s.trim()).filter(Boolean);
  if (list.length === 0) return [];

  const base = process.env.VENORE_PLUGIN_REPO_BASE;
  if (!base) {
    throw new Error("VENORE_PLUGINS definido mas falta VENORE_PLUGIN_REPO_BASE (ou use venore.plugins.json).");
  }
  return list.map((item) => {
    const [key, ref = "main"] = item.split("@");
    return { key, repo: `${base}${key}.git`, ref };
  });
}

function syncOne({ key, repo, ref }: PluginSpec): void {
  if (!/^[a-z0-9][a-z0-9-]*$/.test(key)) {
    throw new Error(`Chave de plugin inválida: "${key}" (só minúsculas, dígitos e hífen).`);
  }
  const target = path.join(PLUGINS_DIR, key);

  if (existsSync(path.join(target, ".git"))) {
    git(["fetch", "--depth", "1", "origin", ref], target);
    git(["checkout", "-q", "--force", "FETCH_HEAD"], target);
    git(["clean", "-qfdx"], target);
    console.log(`  ✓ ${key} — atualizado (${ref})`);
    return;
  }

  if (existsSync(target)) {
    throw new Error(`src/plugins/${key} existe mas não é um checkout do sync. Remova à mão antes.`);
  }
  git(["clone", "--depth", "1", "--branch", ref, repo, target]);
  console.log(`  ✓ ${key} — clonado (${ref})`);
}

// Remove um src/plugins/<key>/ que o sync criou (tem .git) e não está mais na config.
function pruneUnlisted(keep: Set<string>): void {
  if (!existsSync(PLUGINS_DIR)) return;
  for (const entry of readdirSync(PLUGINS_DIR, { withFileTypes: true })) {
    if (!entry.isDirectory() || entry.name.startsWith("_") || entry.name.startsWith(".")) continue;
    if (keep.has(entry.name)) continue;
    const dir = path.join(PLUGINS_DIR, entry.name);
    if (!existsSync(path.join(dir, ".git"))) continue; // não foi o sync que criou — não mexe
    rmSync(dir, { recursive: true, force: true });
    console.log(`  – ${entry.name} — removido (fora da config)`);
  }
}

function main(): void {
  const specs = readConfig();
  if (specs.length === 0) {
    console.log("sync-plugins: nenhum plugin configurado (venore.plugins.json / VENORE_PLUGINS). Nada a sincronizar.");
  } else {
    console.log(`sync-plugins: ${specs.length} plugin(s) — ${specs.map((s) => s.key).join(", ")}`);
    for (const spec of specs) syncOne(spec);
    pruneUnlisted(new Set(specs.map((s) => s.key)));
  }

  // Regenera registry.generated.ts / route-registry / contributions a partir do que está presente.
  // execSync (via shell) pra resolver `npx`/`npx.cmd` em qualquer plataforma.
  execSync("npx tsx scripts/gen-plugin-registry.ts", { cwd: ROOT, stdio: "inherit" });
}

try {
  main();
} catch (error) {
  console.error(`sync-plugins: ${(error as Error).message}`);
  process.exit(1);
}
