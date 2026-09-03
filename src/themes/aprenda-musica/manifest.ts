import type { ThemeManifest } from "@/contexts/themes/contracts/types";

export const aprendaMusicaManifest: ThemeManifest = {
  key: "aprenda-musica",
  name: "Aprenda Música",
  version: "0.1.0",
  themeContractVersion: "6.0.0",
  // mode "text": pedido desta sessão — "não vou utilizar .svg, vamos utilizar aquele brand ali"
  // (o ícone + nome do preview). components/BrandMark.tsx é quem realmente desenha a marca (ícone
  // fixo no código + brand.name vindo de /admin/settings/brand); size/scrolledSize/position abaixo
  // não são lidos por ele (BrandMark não reescala nem centraliza) — ficam só porque BrandAesthetics
  // exige os quatro campos, valores herdados do default que já existia nos outros temas. color
  // acompanha o laranja de --primary deste tema (theme.css) em vez do teal herdado do Venore
  // Slime, porque é o tom que aparece no PDF de impressão (plugin birthdays) e no traço de acento
  // do footer (caso um outro tema volte a consumir esse campo).
  brandAesthetics: { mode: "text", size: 100, scrolledSize: 80, position: "left", color: "#d9662f" },
};
