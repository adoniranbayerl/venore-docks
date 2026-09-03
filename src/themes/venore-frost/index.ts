export { venoreFrostManifest } from "./manifest";
// Mesma Shell do Venore Pulse, sem alterar uma linha de JSX — pedido explícito desta sessão:
// "quero uma versão com as mesmas shells, mas com cores diferentes". A única coisa que muda é
// theme.css (paleta "dark and ice" em vez do verde-lima sóbrio do Pulse); Header/Sidebar/Content/
// Footer/Breadcrumbs/AdminNavSwitch continuam sendo os componentes do Pulse, 100% orientados a
// token, então a reskin é inteira via CSS (mesmo raciocínio já usado quando o Nightcity reaproveitou
// a Shell do Slime antes de ganhar arranjo próprio — aqui o reaproveitamento é a decisão final,
// não um placeholder).
export { Shell } from "../venore-pulse/components/Shell";
export { VENORE_FROST_COLOR_PALETTES } from "./color-palettes";
