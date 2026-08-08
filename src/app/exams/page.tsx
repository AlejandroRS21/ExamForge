// ExamForge — Exam Selection Page
// Warm Sloth theme with part category tabs, skill badges, and 3D tactile buttons

import Link from "next/link";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { SlothMascot } from "@/components/ui/SlothMascot";

export default async function ExamsPage() {
  const session = await auth();

  const parts = await prisma.examPart.findMany({
    orderBy: { sortOrder: "asc" },
    select: {
      id: true,
      label: true,
      paper: true,
      partNumber: true,
      description: true,
      timeMinutes: true,
      questionCount: true,
    },
  });

  const ruoeParts = parts.filter((p) => p.paper === "R&UoE");
  const writingParts = parts.filter((p) => p.paper === "Writing");

  return (
    <div className="min-h-screen bg-[#FAF6F0]">
      <div className="container mx-auto px-4 py-10 max-w-5xl">
        {/* Header Hero */}
        <div className="mb-10 bg-white p-8 rounded-3xl border-2 border-amber-200/80 shadow-[0_6px_0_0_#FDE68A] flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100/70 border border-amber-300/60 text-amber-900 text-xs font-bold uppercase tracking-wide">
              <span>🎓</span> Examen Cambridge B2 First
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-amber-950">
              Centro de Exámenes
            </h1>
            <p className="text-amber-800/80 max-w-xl font-medium text-sm md:text-base">
              Elige tu modalidad de estudio: practica partes individuales sin prisa o pon a prueba tu nivel en un simulacro completo cronometrado.
            </p>
          </div>
          <SlothMascot pose="studying" size={150} className="shrink-0" />
        </div>

        {/* Modalidad de Práctica */}
        <section className="mb-12">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-2xl font-extrabold text-amber-950 flex items-center gap-2">
                <span>🎯</span> Modos de Práctica Individual
              </h2>
              <p className="text-sm font-medium text-amber-800/80 mt-0.5">
                Sin límite de tiempo rígido, con pistas opcionales y pausables.
              </p>
            </div>
            <span className="inline-flex items-center rounded-full bg-emerald-100 border border-emerald-300 px-3.5 py-1 text-xs font-bold text-emerald-800">
              Paso a paso
            </span>
          </div>

          {/* R&UoE Parts */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-[#FF6B35]" />
              <h3 className="text-sm font-bold text-amber-900 uppercase tracking-wider">
                Reading & Use of English (Partes 1 - 7)
              </h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {ruoeParts.map((part) => (
                <Link
                  key={part.id}
                  href={`/exams/practice/${part.id}`}
                  className="group rounded-2xl border-2 border-amber-200/90 bg-white p-5 hover:border-amber-300 shadow-[0_4px_0_0_#FDE68A] hover:shadow-[0_6px_0_0_#FDE68A] transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="font-bold text-base text-amber-950 group-hover:text-[#FF6B35] transition-colors">
                        {part.label}
                      </span>
                      <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 text-xs font-bold shrink-0">
                        B2
                      </span>
                    </div>
                    <p className="text-xs font-medium text-amber-800/70 line-clamp-2 leading-relaxed">
                      {part.description}
                    </p>
                  </div>
                  <div className="flex items-center justify-between pt-4 mt-2 border-t border-amber-100 text-xs font-semibold text-amber-900">
                    <span>{part.questionCount} preguntas</span>
                    <span>{part.timeMinutes} min recomendados</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {writingParts.length > 0 && (
            <div className="space-y-4 mt-8">
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-[#FFB703]" />
                <h3 className="text-sm font-bold text-amber-900 uppercase tracking-wider">
                  Writing (Redacción)
                </h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {writingParts.map((part) => (
                  <Link
                    key={part.id}
                    href={`/exams/practice/${part.id}`}
                    className="group rounded-2xl border-2 border-amber-200/90 bg-white p-5 hover:border-amber-300 shadow-[0_4px_0_0_#FDE68A] hover:shadow-[0_6px_0_0_#FDE68A] transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className="font-bold text-base text-amber-950 group-hover:text-[#FF6B35] transition-colors">
                          {part.label}
                        </span>
                        <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 text-xs font-bold">
                          Writing
                        </span>
                      </div>
                      <p className="text-xs font-medium text-amber-800/70 line-clamp-2 leading-relaxed">
                        {part.description}
                      </p>
                    </div>
                    <div className="flex items-center justify-between pt-4 mt-2 border-t border-amber-100 text-xs font-semibold text-amber-900">
                      <span>{part.questionCount} ejercicios</span>
                      <span>{part.timeMinutes} min</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </section>

        {/* Modalidad Simulacro Completo */}
        <section className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-extrabold text-amber-950 flex items-center gap-2">
                <span>⏱️</span> Simulacro de Examen Oficial
              </h2>
              <p className="text-sm font-medium text-amber-800/80 mt-0.5">
                Experiencia real cronometrada sin pausas con las condiciones del Cambridge B2 First.
              </p>
            </div>
            <span className="inline-flex items-center rounded-full bg-orange-100 border border-orange-300 px-3.5 py-1 text-xs font-bold text-orange-800">
              Cronometrado
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Full Mock CTA */}
            <Link
              href="/exams/mock/new"
              className="rounded-3xl border-2 border-orange-300 bg-gradient-to-br from-orange-500 to-[#FF6B35] p-6 text-white shadow-[0_6px_0_0_#C84B1B] hover:brightness-105 active:translate-y-1 active:shadow-none transition-all flex flex-col justify-between"
            >
              <div>
                <div className="inline-block px-2.5 py-1 rounded-lg bg-white/20 text-xs font-extrabold uppercase tracking-wide mb-3">
                  Examen Completo R&UoE
                </div>
                <h3 className="font-extrabold text-xl text-white">
                  Simulacro Completo B2 (Partes 1 a 7)
                </h3>
                <p className="text-sm font-medium text-orange-50 mt-2 leading-relaxed">
                  52 preguntas oficiales, 1 hora y 15 minutos en tiempo real.
                </p>
              </div>
              <div className="flex items-center justify-between mt-6 pt-4 border-t border-white/20 text-xs font-bold text-white">
                <span>52 Preguntas Totales</span>
                <span className="bg-white/20 px-3 py-1 rounded-xl">75 Minutos</span>
              </div>
            </Link>

            {/* Individual Mocks */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {ruoeParts.slice(0, 4).map((part) => (
                <Link
                  key={part.id}
                  href={`/exams/mock/new?partId=${part.id}`}
                  className="rounded-2xl border-2 border-amber-200/90 bg-white p-4 hover:border-amber-300 shadow-[0_4px_0_0_#FDE68A] transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="font-bold text-sm text-amber-950">{part.label}</div>
                    <div className="text-xs font-medium text-amber-800/70 mt-1 line-clamp-1">{part.description}</div>
                  </div>
                  <div className="flex items-center justify-between mt-3 text-xs font-bold text-amber-900">
                    <span>{part.timeMinutes} min</span>
                    <span className="text-orange-600">Simulacro</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Back Link */}
        {session?.user && (
          <div className="mt-10 pt-6 border-t border-amber-200/60 flex justify-center">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 rounded-2xl border-2 border-amber-200 bg-white px-5 py-2.5 text-sm font-bold text-amber-950 shadow-[0_3px_0_0_#FDE68A] hover:bg-amber-50 active:translate-y-0.5 active:shadow-none transition-all"
            >
              ← Volver al Panel Principal
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
