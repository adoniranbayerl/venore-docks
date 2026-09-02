// Registro dos plugins instalados. O conteúdo é GERADO por scripts/gen-plugin-registry.ts
// (postinstall / predev / prebuild) a partir das pastas presentes em src/plugins/*/manifest.ts —
// ver docs/plugins-repos-separados-plano.md. Este arquivo continua sendo o import estável pra todo
// o resto do core (`import { PLUGIN_REGISTRY } from "@/plugins/registry"`); só a lista deixou de
// ser escrita à mão.
export { PLUGIN_REGISTRY } from "./registry.generated";
