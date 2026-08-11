import Link from "next/link";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { getDashboardStats } from "@/lib/dashboard/stats";
import { getUserAchievements } from "@/lib/challenges/achievements";
import { getResumeCta } from "@/lib/exam/resume";
import { SlothMascot } from "@/components/ui/SlothMascot";
import {
  FlameIcon,
  TargetIcon,
  AwardIcon,
  PlayIcon,
  CpuIcon,
} from "@/components/ui/icons/SlothIcons";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/auth/login");

  const userId = session.user.id!;
  const [stats, achievements, resumeCta, ruoeParts] = await Promise.all([
    getDashboardStats(userId),
    getUserAchievements(userId),
    getResumeCta(userId),
    // E-C-2 / P-T-3: part count and CTA fallback derive from seed, no literals.
    prisma.examPart.findMany({
      where: { paper: "R&UoE" },
      orderBy: { sortOrder: "asc" },
      select: { id: true, questionCount: true },
    }),
  ]);

  const totalRuoeQuestions = ruoeParts.reduce((sum, p) => sum + p.questionCount, 0);
  const firstPartId = ruoeParts[0]?.id;
  const defaultPracticeHref = firstPartId ? `/exams/practice/${firstPartId}` : "/exams";

  const name = session.user.name ?? "Estudiante";
  const streakDays = stats.streak.currentStreak;
  const overallAccuracy = stats.overallAccuracy !== null ? Math.round(stats.overallAccuracy) : null;

  return (
    <div className="min-h-screen bg-background text-[#2B1E19] font-sans p-6 md:p-10 space-y-8">
      {/* Top Header / Racha */}
      <header className="flex flex-col md:flex-row items-center justify-between gap-6 bg-white border-2 border-[#F0E8DD] rounded-3xl p-6 shadow-[0_4px_0_#F0E8DD]">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#FFB703] shadow-[0_3px_0_#D49200]">
            <SlothMascot size={56} pose="happy" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-[#2B1E19]">
              ¡Hola de nuevo, {name}!
            </h1>
            <p className="text-sm font-bold text-[#6B5E57]">
              Hoy es un gran día para avanzar hacia tu certificado B2 First.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3 bg-[#FFE8D6] px-5 py-3 rounded-2xl border border-[#FFD6BA]">
            <FlameIcon className="w-7 h-7" color="#E85D04" />
            <div>
              <p className="text-xs font-black uppercase text-[#E85D04]">Tu Racha</p>
              <p className="text-xl font-black text-[#2B1E19]">
                {streakDays} {streakDays === 1 ? "Día" : "Días"} Seguidos
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-[#E6F4F1] px-5 py-3 rounded-2xl border border-[#C1E5DF]">
            <AwardIcon className="w-7 h-7" color="#2A9D8F" />
            <div>
              <p className="text-xs font-black uppercase text-[#2A9D8F]">Puntuación Promedio</p>
              <p className="text-xl font-black text-[#2B1E19]">
                {overallAccuracy !== null ? `${overallAccuracy}%` : "Sin intentos"}
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Banner del Dashboard (Sloth motivador) */}
      <div className="relative overflow-hidden rounded-3xl bg-[#FFF8F0] border-3 border-[#FFE4D6] p-8 md:p-10 flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="space-y-4 max-w-xl">
          <span className="inline-block bg-[#FFB703] text-[#2B1E19] text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider">
            Recomendación del día
          </span>
          <h2 className="text-3xl md:text-4xl font-black text-[#2B1E19]">
            {resumeCta ? resumeCta.title : "Completa 1 parte de Use of English (solo 10 min)"}
          </h2>
          <p className="text-base text-[#6B5E57] font-medium">
            {resumeCta
              ? resumeCta.subtitle
              : "Mantendrás tu racha activa y reforzarás las transformaciones de frases clave del examen de Cambridge."}
          </p>
          <Link
            href={resumeCta ? resumeCta.resumeHref : defaultPracticeHref}
            className="inline-flex items-center gap-3 rounded-2xl bg-primary px-7 py-4 text-lg font-black text-white shadow-[0_5px_0_#C74D23] transition-all hover:translate-y-0.5 hover:shadow-[0_2px_0_#C74D23] active:translate-y-1 active:shadow-none"
          >
            <PlayIcon className="w-5 h-5" color="#FFFFFF" />
            <span>{resumeCta ? "Reanudar Práctica" : "Empezar Práctica Rápida"}</span>
          </Link>
        </div>

        <div className="flex justify-center">
          <SlothMascot size={180} pose="studying" />
        </div>
      </div>

      {/* Módulos de Preparación */}
      <div className="space-y-4">
        <h3 className="text-2xl font-black text-[#2B1E19]">Partes del Examen B2 First</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Card 1 */}
          <div className="bg-white border-2 border-[#F0E8DD] rounded-3xl p-6 space-y-4 shadow-[0_4px_0_#F0E8DD] hover:-translate-y-1 transition-transform">
            <div className="flex items-center justify-between">
              <div className="p-3 bg-[#FFE8D6] rounded-2xl">
                <TargetIcon className="w-6 h-6" color="#E85D04" />
              </div>
              <span className="text-xs font-extrabold text-[#2A9D8F] bg-[#E6F4F1] px-3 py-1 rounded-full">
                Reading & Use of English
              </span>
            </div>
            <h4 className="text-xl font-extrabold text-[#2B1E19]">Use of English</h4>
            <p className="text-xs font-bold text-[#8C7A70]">{ruoeParts.length} Partes oficiales • {totalRuoeQuestions} Preguntas</p>
            <Link
              href="/exams"
              className="block w-full text-center rounded-xl bg-background py-3 text-sm font-black text-[#2B1E19] border border-[#F0E8DD] hover:bg-[#FFE8D6] hover:text-[#E85D04] transition-colors"
            >
              Practicar Parte
            </Link>
          </div>

          {/* Card 2 */}
          <div className="bg-white border-2 border-[#F0E8DD] rounded-3xl p-6 space-y-4 shadow-[0_4px_0_#F0E8DD] hover:-translate-y-1 transition-transform">
            <div className="flex items-center justify-between">
              <div className="p-3 bg-[#E6F4F1] rounded-2xl">
                <AwardIcon className="w-6 h-6" color="#2A9D8F" />
              </div>
              <span className="text-xs font-extrabold text-[#E85D04] bg-[#FFE8D6] px-3 py-1 rounded-full">
                Writing
              </span>
            </div>
            <h4 className="text-xl font-extrabold text-[#2B1E19]">Writing B2</h4>
            <p className="text-xs font-bold text-[#8C7A70]">Ensayos, cartas e informes con IA</p>
            <Link
              href="/exams"
              className="block w-full text-center rounded-xl bg-background py-3 text-sm font-black text-[#2B1E19] border border-[#F0E8DD] hover:bg-[#E6F4F1] hover:text-[#2A9D8F] transition-colors"
            >
              Escribir Redacción
            </Link>
          </div>

          {/* Card 3 */}
          <div className="bg-white border-2 border-[#F0E8DD] rounded-3xl p-6 space-y-4 shadow-[0_4px_0_#F0E8DD] hover:-translate-y-1 transition-transform">
            <div className="flex items-center justify-between">
              <div className="p-3 bg-[#FFF3D6] rounded-2xl">
                <FlameIcon className="w-6 h-6" color="#D49200" />
              </div>
              <span className="text-xs font-extrabold text-[#D49200] bg-[#FFF8E6] px-3 py-1 rounded-full">
                Listening
              </span>
            </div>
            <h4 className="text-xl font-extrabold text-[#2B1E19]">Comprensión Auditiva</h4>
            <p className="text-xs font-bold text-[#8C7A70]">Audio generado por NotebookLM</p>
            <Link
              href="/exams"
              className="block w-full text-center rounded-xl bg-background py-3 text-sm font-black text-[#2B1E19] border border-[#F0E8DD] hover:bg-[#FFF3D6] hover:text-[#D49200] transition-colors"
            >
              Escuchar Audios
            </Link>
          </div>

          {/* Card 4 */}
          <div className="bg-white border-2 border-[#F0E8DD] rounded-3xl p-6 space-y-4 shadow-[0_4px_0_#F0E8DD] hover:-translate-y-1 transition-transform">
            <div className="flex items-center justify-between">
              <div className="p-3 bg-[#F0E6FF] rounded-2xl">
                <CpuIcon className="w-6 h-6" color="#7B2CBF" />
              </div>
              <span className="text-xs font-extrabold text-[#7B2CBF] bg-[#F8F0FF] px-3 py-1 rounded-full">
                Vocabulario
              </span>
            </div>
            <h4 className="text-xl font-extrabold text-[#2B1E19]">Flashcards & Phrasals</h4>
            <p className="text-xs font-bold text-[#8C7A70]">Repetición espaciada inteligente</p>
            <Link
              href="/flashcards"
              className="block w-full text-center rounded-xl bg-background py-3 text-sm font-black text-[#2B1E19] border border-[#F0E8DD] hover:bg-[#F0E6FF] hover:text-[#7B2CBF] transition-colors"
            >
              Repasar Tarjetas
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
