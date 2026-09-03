import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { HeaderSlot } from "./HeaderSlot";
import type { HeaderSlotProps } from "@/contexts/themes/contracts/types";

// HeaderSlot é um server component puro (sem I/O) — dá pra renderizar com renderToStaticMarkup
// sem jsdom/testing-library (nenhum dos dois está instalado; vitest.config.ts roda em
// `environment: "node"`). O header reativo ao scroll (docs/ui/shell-spec.md §2) não guarda mais
// `isScrolled` como prop/estado React: os dois estados ("top"/"scrolled") coexistem sempre no
// mesmo markup, um só alterna via `data-scrolled` no <header> (escrito em runtime por
// HeaderScrollSentinel) e seletores CSS `data-[scrolled=true]:`/`group-data-[scrolled=true]/
// header:`. Por isso "cobrir os dois estados" aqui significa: um único render prova que as classes
// de AMBOS os estados estão presentes (senão o segundo estado nunca apareceria em tela nenhuma).
const baseProps: HeaderSlotProps = {
  brand: {
    name: "Venore Docks",
    mode: "svg",
    size: 100,
    scrolledSize: 80,
    position: "left",
    logoUrl: "/brand/brand-logo.svg",
    scrolledLogoUrl: "/brand/brand-logo-scrolled.png",
  },
  userbarEnabled: true,
  stickyEnabled: true,
  scrollShrinkEnabled: true,
  headerNavItems: [{ key: "home", label: "Home", href: "/" }],
  user: null,
  canAccessAdmin: false,
  onSignOut: async () => {},
};

describe("HeaderSlot — máquina de estados de scroll", () => {
  it("monta o <header> no estado 'top' por padrão, antes de qualquer detecção de scroll", () => {
    const html = renderToStaticMarkup(<HeaderSlot {...baseProps} />);

    expect(html).toContain('id="site-header"');
    expect(html).toContain('data-scrolled="false"');
  });

  it("carrega no markup as classes do estado 'top' (bg/border/altura neutros)", () => {
    const html = renderToStaticMarkup(<HeaderSlot {...baseProps} />);

    expect(html).toContain("bg-card");
    expect(html).toContain("border-header-border-subtle");
    expect(html).toContain("md:h-24");
    expect(html).toContain("lg:h-28");
  });

  it("carrega no mesmo markup as classes do estado 'scrolled' (inversão pra bg-primary), prontas pra ativar via CSS quando data-scrolled virar true", () => {
    const html = renderToStaticMarkup(<HeaderSlot {...baseProps} />);

    expect(html).toContain("data-[scrolled=true]:bg-primary");
    expect(html).toContain("data-[scrolled=true]:text-primary-foreground");
    expect(html).toContain("data-[scrolled=true]:border-primary");
    expect(html).toContain("data-[scrolled=true]:shadow-header");
    expect(html).toContain("data-[scrolled=true]:h-16");
  });

  it("renderiza a sentinela de scroll (HeaderScrollSentinel) sem reservar espaço no fluxo (zero layout shift)", () => {
    const html = renderToStaticMarkup(<HeaderSlot {...baseProps} />);

    expect(html).toContain("aria-hidden");
    expect(html).toContain("h-0");
  });

  it("nav e login link carregam as duas variantes de cor (padrão + group-data scrolled)", () => {
    const html = renderToStaticMarkup(<HeaderSlot {...baseProps} />);

    expect(html).toContain("text-muted-foreground");
    expect(html).toContain("group-data-[scrolled=true]/header:text-primary-foreground");
    expect(html).toContain("Entrar");
  });

  it("com usuário logado, troca login link por UserMenu (também reage via group-data, sem prop isScrolled)", () => {
    const html = renderToStaticMarkup(
      <HeaderSlot
        {...baseProps}
        user={{ displayName: "Ada Lovelace", email: "ada@example.com", imageUrl: null }}
      />,
    );

    expect(html).not.toContain("Entrar");
    expect(html).toContain("Ada Lovelace");
    expect(html).toContain("group-data-[scrolled=true]/header:hover:bg-primary-foreground/10");
  });

  it("T4: com stickyEnabled=false, não aplica sticky/top-0", () => {
    const html = renderToStaticMarkup(<HeaderSlot {...baseProps} stickyEnabled={false} />);

    expect(html).not.toContain("sticky");
  });

  it("T4: com scrollShrinkEnabled=false, não monta HeaderScrollSentinel nem carrega as classes data-[scrolled=true]", () => {
    const html = renderToStaticMarkup(<HeaderSlot {...baseProps} scrollShrinkEnabled={false} />);

    expect(html).not.toContain("data-[scrolled=true]:bg-primary");
    expect(html).not.toContain("h-0 w-0 overflow-visible");
  });
});
