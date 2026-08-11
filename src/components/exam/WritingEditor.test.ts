// OpenSloth — WritingEditor UI copy tests
// B-L-2: visible UI copy is Spanish (neutral/professional). File-content check
// follows the create.test.ts precedent (no renderer installed).

import { describe, it, expect } from "vitest";
import { readFileSync } from "fs";

describe("WritingEditor copy (B-L-2 Spanish UI)", () => {
  const src = readFileSync(new URL("./WritingEditor.tsx", import.meta.url), "utf-8");

  it("uses Spanish UI copy", () => {
    expect(src).toContain("Tarea de redacción");
    expect(src).toContain("Escribe tu respuesta aquí");
    expect(src).toContain("palabras");
    expect(src).toContain("Guardando...");
    expect(src).toContain("Guardar");
  });

  it("removes the fake autosave claim and English UI strings", () => {
    expect(src).not.toContain("Auto-saved");
    expect(src).not.toContain("Write your response here...");
    expect(src).not.toContain("Saving...");
    expect(src).not.toContain("Unsaved changes");
    expect(src).not.toContain("Save failed");
  });
});
