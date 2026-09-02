// @venore/plugin-sdk/testing — helpers de seed pros testes de INTEGRAÇÃO de plugin.
// seedUser/deleteUser tocam auth.users direto (não há API pública pra criar usuário); um plugin
// não conseguiria fazer isso respeitando o boundary. Cada plugin traz o resto dos próprios
// helpers de seed no seu repo. Ver docs/plugins-repos-separados-plano.md.
export { seedUser, deleteUser } from "@/test-support/integration/user-seed";
