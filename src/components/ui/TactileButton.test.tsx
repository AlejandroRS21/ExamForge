// OpenSloth — TactileButton RSC render tests
// Node environment (repo choice): renderToStaticMarkup, no jsdom/RTL.

import { describe, it, expect } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { TactileButton } from "./TactileButton";

function render(props: React.ComponentProps<typeof TactileButton>) {
  return renderToStaticMarkup(<TactileButton {...props}>Confirmar</TactileButton>);
}

describe("TactileButton", () => {
  it("renders a button with tactile press classes by default", () => {
    const html = render({});
    expect(html).toContain("<button");
    expect(html).toContain("active:translate-y-1 active:shadow-none");
  });

  it("uses the warm amber variant and token shadow by default", () => {
    const html = render({});
    expect(html).toContain("shadow-[0_4px_0_0_#FDE68A]");
    expect(html).not.toContain("var(--btn-shadow-primary)");
  });

  it("primary variant uses the brand primary token + --btn-shadow-primary token", () => {
    const html = render({ variant: "primary" });
    expect(html).toContain("bg-primary");
    expect(html).toContain("var(--btn-shadow-primary)");
  });

  it("soft variant uses the warm neutral palette", () => {
    const html = render({ variant: "soft" });
    expect(html).toContain("border-[#E5D9CC]");
  });

  it("variant classes differ from each other", () => {
    const amber = render({ variant: "amber" });
    const primary = render({ variant: "primary" });
    const soft = render({ variant: "soft" });
    expect(amber).not.toBe(primary);
    expect(primary).not.toBe(soft);
    expect(amber).not.toBe(soft);
  });

  it("passes disabled down to the button", () => {
    const html = render({ disabled: true });
    expect(html).toContain("disabled");
  });

  it("carries aria-pressed through when provided", () => {
    const html = render({ "aria-pressed": true });
    expect(html).toContain('aria-pressed="true"');
  });

  it("renders an anchor with href when as is 'a'", () => {
    const html = render({ as: "a", href: "/exams" });
    expect(html).toContain('<a href="/exams"');
    expect(html).not.toContain("<button");
  });

  it("keeps the 3D press affordance on the anchor variant too", () => {
    const html = render({ as: "a", href: "/exams" });
    expect(html).toContain("active:translate-y-1 active:shadow-none");
  });
});