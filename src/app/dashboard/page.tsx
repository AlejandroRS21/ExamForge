import Link from "next/link";
import { SlothMascot } from "@/components/ui/SlothMascot";
import {
  FlameIcon,
  TargetIcon,
  AwardIcon,
  PlayIcon,
  CpuIcon,
} from "@/components/ui/icons/SlothIcons";

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-[#FAF6F0] text-[#2B1E19] font-sans p-6 md:p-10 space-y-8">
      {/* Top Header / Racha */}
      <header className="flex flex-col md:flex-row items-center justify-between gap-6 bg-white border-2 border-[#F0E8DD] rounded-3xl p-6 shadow-[0_4px_0_#F0E8DD]">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#FFB703] shadow-[0_3px_0_#D49200]">
            <SlothMascot size={56} pose="happy" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-[#2B1E19]">
              ¡Hola de nuevo, Alejandro!
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
              <p className="text-xl font-black text-[#2B1E19]">12 Días Seguidos</p>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-[#E6F4F1] px-5 py-3 rounded-2xl border border-[#C1E5DF]">
            <AwardIcon className="w-7 h-7" color="#2A9D8F" />
            <div>
              <p className="text-xs font-black uppercase text-[#2A9D8F]">Puntuación Promedio</p>
              <p className="text-xl font-black text-[#2B1E19]">78% (B2 Aprobado)</p>
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
            Completa 1 parte de Use of English (solo 10 min)
          </h2>
          <p className="text-base text-[#6B5E57] font-medium">
            Mantendrás tu racha activa y reforzarás las transformaciones de frases clave del examen de Cambridge.
          </p>
          <Link
            href="/exams/practice/ruoe-part-1"
            className="inline-flex items-center gap-3 rounded-2xl bg-[#FF6B35] px-7 py-4 text-lg font-black text-white shadow-[0_5px_0_#C74D23] transition-all hover:translate-y-0.5 hover:shadow-[0_2px_0_#C74D23] active:translate-y-1 active:shadow-none"
          >
            <PlayIcon className="w-5 h-5" color="#FFFFFF" />
            <span>Empezar Práctica Rápida</span>
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
                85% Dominado
              </span>
            </div>
            <h4 className="text-xl font-extrabold text-[#2B1E19]">Reading & Use of English</h4>
            <p className="text-xs font-bold text-[#8C7A70]">7 Partes oficiales • 52 Preguntas</p>
            <Link
              href="/exams"
              className="block w-full text-center rounded-xl bg-[#FAF6F0] py-3 text-sm font-black text-[#2B1E19] border border-[#F0E8DD] hover:bg-[#FFE8D6] hover:text-[#E85D04] transition-colors"
            >
              Practicar Parte
            </Link>
          </div>

          {/* Card 2 */}
          <div className="bg-white border-2 border-[#F0E8DD] rounded-3xl p-6 space-y-4 shadow-[0_4px_0_#F0E8DD] hover:-translate-y-1 transition-transform">
            <div className="flex items-center justify-between">
              <div className="p-3 bg-[#FFF3D6] rounded-2xl">
                <CpuIcon className="w-6 h-6" color="#FFB703" />
              </div>
              <span className="text-xs font-extrabold text-[#E85D04] bg-[#FFE8D6] px-3 py-1 rounded-full">
                Revisión IA
              </span>
            </div>
            <h4 className="text-xl font-extrabold text-[#2B1E19]">Writing (Redacción)</h4>
            <p className="text-xs font-bold text-[#8C7A70]">Essays, Emails & Reports con Feedback</p>
            <Link
              href="/exams"
              className="block w-full text-center rounded-xl bg-[#FAF6F0] py-3 text-sm font-black text-[#2B1E19] border border-[#F0E8DD] hover:bg-[#FFF3D6] hover:text-[#D49200] transition-colors"
            >
              Escribir Redacción
            </Link>
          </div>

          {/* Card 3 */}
          <div className="bg-white border-2 border-[#F0E8DD] rounded-3xl p-6 space-y-4 shadow-[0_4px_0_#F0E8DD] hover:-translate-y-1 transition-transform">
            <div className="flex items-center justify-between">
              <div className="p-3 bg-[#E6F4F1] rounded-2xl">
                <AwardIcon className="w-6 h-6" color="#2A9D8F" />
              </div>
              <span className="text-xs font-extrabold text-[#2A9D8F] bg-[#E6F4F1] px-3 py-1 rounded-full">
                En Progreso
              </span>
            </div>
            <h4 className="text-xl font-extrabold text-[#2B1E19]">Listening Comprehension</h4>
            <p className="text-xs font-bold text-[#8C7A70]">Audios Oficiales Cambridge con Transcripción</p>
            <Link
              href="/exams"
              className="block w-full text-center rounded-xl bg-[#FAF6F0] py-3 text-sm font-black text-[#2B1E19] border border-[#F0E8DD] hover:bg-[#E6F4F1] hover:text-[#2A9D8F] transition-colors"
            >
              Escuchar Audio
            </Link>
          </div>

          {/* Card 4 */}
          <div className="bg-white border-2 border-[#F0E8DD] rounded-3xl p-6 space-y-4 shadow-[0_4px_0_#F0E8DD] hover:-translate-y-1 transition-transform">
            <div className="flex items-center justify-between">
              <div className="p-3 bg-[#FFE8D6] rounded-2xl">
                <FlameIcon className="w-6 h-6" color="#E85D04" />
              </div>
              <span className="text-xs font-extrabold text-[#E85D04] bg-[#FFE8D6] px-3 py-1 rounded-full">
                Simulacro Completo
              </span>
            </div>
            <h4 className="text-xl font-extrabold text-[#2B1E19]">Mock Exam Completo</h4>
            <p className="text-xs font-bold text-[#8C7A70]">Simula las 4 horas del examen oficial</p>
            <Link
              href="/exams/mock/new"
              className="block w-full text-center rounded-xl bg-[#FAF6F0] py-3 text-sm font-black text-[#2B1E19] border border-[#F0E8DD] hover:bg-[#FFE8D6] hover:text-[#E85D04] transition-colors"
            >
              Iniciar Simulacro
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
