// OpenSloth — Spanish-only UI sweep guard (B-L-2): no English fragments in
// user-visible copy; neutral/professional Spanish replacements.
// Task 3.3. File-content checks following the WritingEditor copy-test precedent.
// Exam-content terms (part labels, DRAFT status, CSV identifiers) stay English.

import { describe, it, expect } from "vitest";
import { readFileSync } from "fs";

const file = (rel: string) =>
  readFileSync(new URL(rel, import.meta.url), "utf-8");

describe("Spanish-only UI copy (B-L-2)", () => {
  it("error boundaries use Spanish copy", () => {
    const error = file("../app/error.tsx");
    expect(error).toContain("Algo salió mal");
    expect(error).toContain("Intentar de nuevo");
    expect(error).not.toContain("Something went wrong");

    const globalError = file("../app/global-error.tsx");
    expect(globalError).toContain("Error crítico");
    expect(globalError).toContain("Intentar de nuevo");
    expect(globalError).not.toContain("Critical Error");

    const notFound = file("../app/not-found.tsx");
    expect(notFound).toContain("Página no encontrada");
    expect(notFound).toContain("Ir al inicio");
    expect(notFound).not.toContain("Page not found");

    const adminError = file("(app)/admin/error.tsx");
    expect(adminError).toContain("Algo salió mal en el panel de administración");
    expect(adminError).not.toContain("Something went wrong in admin");

    const examsError = file("(app)/exams/error.tsx");
    expect(examsError).toContain("Algo salió mal con los exámenes");
    expect(examsError).not.toContain("Something went wrong with exams");
  });

  it("auth pages have no English loading/fallback copy", () => {
    const reset = file("./auth/reset-password/page.tsx");
    expect(reset).toContain("Cargando...");
    expect(reset).not.toContain("Loading...");
  });

  it("practice UI is Spanish-only", () => {
    const client = file("(app)/exams/practice/[partId]/practice-client.tsx");
    expect(client).toContain("No se encontraron preguntas");
    expect(client).toContain("Todavía no hay preguntas disponibles para esta sección.");
    expect(client).toContain("Volver a la selección de exámenes");
    expect(client).not.toContain("No Questions Found");
    expect(client).not.toContain("Back to Exams Selection");

    const partPage = file("(app)/exams/practice/[partId]/page.tsx");
    expect(partPage).toContain("Partes del examen");
    expect(partPage).not.toContain("Exam Parts");
  });

  it("mock start/flow copy is Spanish (Simulacro convention)", () => {
    const mockNew = file("(app)/exams/mock/new/page.tsx");
    expect(mockNew).toContain("Tiempo límite");
    expect(mockNew).toContain("Antes de empezar:");
    expect(mockNew).toContain("El temporizador comienza en cuanto haces clic en");
    expect(mockNew).toContain("Iniciar simulacro");
    expect(mockNew).not.toContain("Start Exam");
    expect(mockNew).not.toContain("Before you start");
    expect(mockNew).not.toContain("Time Limit");

    const mockClient = file("(app)/exams/mock/[attemptId]/mock-client.tsx");
    expect(mockClient).toContain("¿Terminar el examen?");
    expect(mockClient).toContain("Las preguntas sin responder se marcarán como incorrectas.");
    expect(mockClient).toContain("— Simulacro");
    expect(mockClient).toContain("Siguiente →");
    expect(mockClient).not.toContain("Finish the exam?");
    expect(mockClient).not.toContain("Next →");
  });

  it("results surface is Spanish-only", () => {
    const results = file("(app)/exams/results/[attemptId]/page.tsx");
    expect(results).toContain("Examen en curso");
    expect(results).toContain("Termina el examen para ver tus resultados.");
    expect(results).toContain("Reanudar examen");
    expect(results).toContain("Resultados del examen");
    expect(results).toContain("Desglose por partes");
    expect(results).toContain("Evaluación de la redacción");
    expect(results).toContain("Volver al centro de exámenes");
    expect(results).toContain("Practicar de nuevo");
    expect(results).not.toContain("Exam in Progress");
    expect(results).not.toContain("Review Answers");

    const summary = file("(app)/exams/results/[attemptId]/results-summary.tsx");
    expect(summary).toContain("Intento incompleto");
    expect(summary).toContain("Completa todas las partes para ver tu puntuación.");
    expect(summary).toContain("Escala de Cambridge");
    expect(summary).toContain("Nota");
    expect(summary).toContain("Por debajo del aprobado");
    expect(summary).not.toContain("Incomplete Attempt");
    expect(summary).not.toContain("Cambridge Scale\n        </p>");

    const breakdown = file("(app)/exams/results/[attemptId]/score-breakdown.tsx");
    expect(breakdown).toContain("Parte</th>");
    expect(breakdown).toContain("Correctas</th>");
    expect(breakdown).not.toContain("Part</th>");
    expect(breakdown).not.toContain("Bar</th>");
  });

  it("writing feedback is Spanish-only", () => {
    const feedback = file("(app)/exams/results/[attemptId]/writing-feedback.tsx");
    expect(feedback).toContain("Tarea");
    expect(feedback).toContain("Recuento de palabras:");
    expect(feedback).toContain("Por debajo del mínimo de palabras");
    expect(feedback).toContain("Superas el límite de palabras");
    expect(feedback).toContain("Evaluación por rúbrica");
    expect(feedback).toContain("Puntuación total de redacción");
    expect(feedback).toContain("La evaluación de la redacción aparecerá cuando sea revisada.");
    expect(feedback).not.toContain("Under word limit");
    expect(feedback).not.toContain("Writing evaluation will appear once reviewed.");
  });

  it("answer review surface is Spanish-only", () => {
    const review = file("(app)/exams/review/[attemptId]/page.tsx");
    expect(review).toContain("Revisión de respuestas");
    expect(review).toContain("Tiempo agotado");
    expect(review).toContain("Respuestas de redacción");
    expect(review).toContain("No hay respuestas para revisar en este intento.");
    expect(review).toContain("No se envió respuesta");
    expect(review).not.toContain("Answer Review");
    expect(review).not.toContain("Timed out");
    expect(review).not.toContain("No response submitted");

    const qr = file("(app)/exams/review/[attemptId]/question-review.tsx");
    expect(qr).toContain("Mostrar pasaje");
    expect(qr).not.toContain("Show passage");
  });

  it("admin surfaces are Spanish-only", () => {
    const admin = file("(app)/admin/page.tsx");
    expect(admin).toContain("Acciones rápidas");
    expect(admin).toContain("Actividad reciente");
    expect(admin).toContain("Sin actividad reciente.");
    expect(admin).not.toContain("Quick Actions");
    expect(admin).not.toContain("No recent activity.");

    const users = file("(app)/admin/users/page.tsx");
    expect(users).toContain("Gestión de usuarios");
    expect(users).toContain("Gestiona usuarios y asigna roles.");
    expect(users).not.toContain("User Management");

    expect(file("(app)/admin/parts/page.tsx")).toContain("Partes del examen");
    expect(file("(app)/admin/questions/page.tsx")).toContain("Banco de preguntas");
    expect(file("(app)/admin/review/page.tsx")).toContain("Cola de revisión");
    expect(file("(app)/admin/generate/page.tsx")).toContain("Generar contenido de aprendizaje");

    const qId = file("(app)/admin/questions/[id]/page.tsx");
    expect(qId).toContain("Pregunta no encontrada");
    expect(qId).toContain("Historial de ediciones");
    expect(qId).toContain("Aún no hay ediciones registradas.");
    expect(qId).not.toContain("Question not found");

    const editForm = file("(app)/admin/questions/[id]/edit-form.tsx");
    expect(editForm).toContain("Editar pregunta");
    expect(editForm).toContain("Dificultad");
    expect(editForm).toContain("Respuesta correcta (JSON)");
    expect(editForm).toContain("Habilidades evaluadas (separadas por comas)");
    expect(editForm).not.toContain("Correct Answer (JSON)");
    expect(editForm).not.toContain("A — Easy");
  });

  it("question generation/import/filter surfaces are Spanish-only (tokens kept)", () => {
    const genB2 = file("(app)/admin/questions/generate-b2/page.tsx");
    expect(genB2).toContain("Generar preguntas B2 con IA");
    expect(genB2).toContain("Cobertura");
    expect(genB2).toContain("Cómo funciona");
    expect(genB2).toContain("~34 preguntas en todas las partes");
    expect(genB2).not.toContain("Generate B2 Questions with AI");
    expect(genB2).not.toContain("How it works");

    const imp = file("(app)/admin/questions/import/page.tsx");
    expect(imp).toContain("Importar preguntas desde CSV");
    expect(imp).toContain("Formato CSV");
    expect(imp).toContain("Fila de ejemplo");
    expect(imp).toContain("La importación es atómica");
    expect(imp).not.toContain("Import Questions from CSV");
    expect(imp).not.toContain("CSV Format");

    const filter = file("(app)/admin/questions/questions-filter-bar.tsx");
    expect(filter).toContain("Todas las partes");
    expect(filter).toContain("Todos los tipos");
    expect(filter).toContain("Todas las dificultades");
    expect(filter).toContain("Todos los estados");
    expect(filter).toContain("Todas las habilidades");
    expect(filter).not.toContain("All Parts");
    expect(filter).not.toContain("All Skills");

    const table = file("(app)/admin/questions/questions-table.tsx");
    expect(table).toContain("No se encontraron preguntas");
    expect(table).not.toContain("No questions found");
  });

  it("admin client components use Spanish copy", () => {
    const genContent = file("../components/admin/GenerateContentForm.tsx");
    expect(genContent).toContain("Generando contenido... Esto puede llevar un momento.");
    expect(genContent).toContain("La generación falló sin mensaje de error.");
    expect(genContent).not.toContain("Generation failed with no error message.");

    const browser = file("../components/admin/NotebookBrowser.tsx");
    expect(browser).toContain("Cargando libretas...");
    expect(browser).toContain("No se encontraron libretas. Crea una libreta en NotebookLM primero.");
    expect(browser).not.toContain("Loading notebooks...");

    const queue = file("../components/admin/ReviewQueue.tsx");
    expect(queue).toContain("Cargando cola de revisión...");
    expect(queue).not.toContain("Loading review queue...");
  });

  it("flashcard loading states are Spanish (sr-only included)", () => {
    const deckList = file("../components/flashcards/FlashcardDeckList.tsx");
    expect(deckList).toContain("Cargando mazos de vocabulario...");
    expect(deckList).not.toContain("Loading flashcard decks...");

    const skeleton = file("../components/flashcards/FlashcardViewerSkeleton.tsx");
    expect(skeleton).toContain("Cargando mazo de vocabulario...");
    expect(skeleton).not.toContain("Loading flashcard deck...");
  });

  it("goals surfaces are Spanish-only", () => {
    const goals = file("(app)/dashboard/goals/page.tsx");
    expect(goals).toContain("Metas personales");
    expect(goals).not.toContain(">Personal Goals<");

    const goalsClient = file("(app)/dashboard/goals/goals-client.tsx");
    expect(goalsClient).toContain("Metas logradas");
    expect(goalsClient).toContain("Meta activa");
    expect(goalsClient).toContain("Tipo de meta");
    expect(goalsClient).toContain("Sin meta activa");
    expect(goalsClient).toContain("Establecer nueva meta");
    expect(goalsClient).not.toContain(">Achieved Goals<");
    expect(goalsClient).not.toContain("Set a Goal");
  });

  it("score disclaimer is Spanish", () => {
    const scale = file("../lib/scoring/cambridge-scale.ts");
    expect(scale).toContain("Esta es una puntuación estimada. No es un resultado oficial");
    expect(scale).not.toContain("This is an estimated score");
  });
});