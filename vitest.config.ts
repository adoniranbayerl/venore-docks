import { fileURLToPath } from "node:url";
import { loadEnv } from "vite";
import { configDefaults, defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    // Espelha os `paths` do tsconfig. O SDK de plugin (`@venore/plugin-sdk`) é hoje um alias pra
    // src/sdk/* (ver docs/plugins-repos-separados-plano.md) — vira pacote de verdade na extração.
    alias: [
      { find: /^@venore\/plugin-sdk$/, replacement: fileURLToPath(new URL("./src/sdk/index.ts", import.meta.url)) },
      { find: /^@venore\/plugin-sdk\/(.*)$/, replacement: fileURLToPath(new URL("./src/sdk/", import.meta.url)) + "$1.ts" },
      { find: "@", replacement: fileURLToPath(new URL("./src", import.meta.url)) },
    ],
  },
  test: {
    environment: "node",
    include: ["src/**/*.{test,spec}.{ts,tsx}"],
    exclude: [...configDefaults.exclude, "src/**/*.integration.test.{ts,tsx}"],
    passWithNoTests: true,
    env: loadEnv("", process.cwd(), ""),
  },
});
