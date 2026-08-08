// ExamForge — SlothPageHeader RSC render tests
// Node environment (repo choice): renderToStaticMarkup, no jsdom/RTL.

import { describe, it, expect } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import SlothPageHeader from "./SlothPageHeader";

function render(props: Parameters<typeof SlothPageHeader>[0]) {
  return renderToStaticMarkup(<SlothPageHeader {...props} />);
}

describe("SlothPageHeader", () => {
  it("renders title as h1", () => {
    const html = render({ title: "Centro de Exámenes" });
    expect(html).toContain("<h1");
    expect(html).toContain("Centro de Exámenes");
  });

  it("renders badge and subtitle when provided", () => {
    const html = render({
      badge: "Examen Cambridge B2 First",
      title: "Centro de Exámenes",
      subtitle: "Elige tu modalidad de estudio.",
    });
    expect(html).toContain("Examen Cambridge B2 First");
    expect(html).toContain("Elige tu modalidad de estudio.");
  });

  it("omits badge and subtitle markup when not provided", () => {
    const html = render({ title: "Solo Título" });
    expect(html).not.toContain("rounded-full");
    expect(html).not.toMatch(/<p\s/); // no <p> element (svg <path> is fine)
  });

  it("always renders the SlothMascot svg with the requested pose", () => {
    const html = render({ title: "X", pose: "studying" });
    expect(html).toContain('<svg');
    // studying pose draws the glasses bridge line (<100,83> to <109,83>)
    expect(html).toContain('x1="91" y1="83"');
  });

  it("renders an optional back link when backHref is set, none otherwise", () => {
    const withBack = render({ title: "X", backHref: "/exams", backLabel: "Volver a exámenes" });
    expect(withBack).toContain('<a href="/exams"');
    expect(withBack).toContain("Volver a exámenes");

    const withoutBack = render({ title: "X" });
    expect(withoutBack).not.toContain("<a ");
  });

  it("honors a custom mascot size", () => {
    const html = render({ title: "X", mascotSize: 64 });
    expect(html).toContain('width="64"');
    expect(html).toContain('height="64"');
  });

  it("stacked layout centers the block (auth screens)", () => {
    const html = render({ title: "X", layout: "stacked" });
    expect(html).not.toContain("md:flex-row");
    expect(html).toContain("flex flex-col items-center");
  });
});