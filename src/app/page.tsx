import Link from "next/link";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { SlothMascot } from "@/components/ui/SlothMascot";
import {
  TargetIcon,
  FlameIcon,
  CpuIcon,
  AwardIcon,
  StarIcon,
  ArrowRightIcon,
  PlayIcon,
} from "@/components/ui/icons/SlothIcons";

export default async function LandingPage() {
  const session = await auth();

  if (session?.user) {
    redirect("/dashboard");
  }

  // P-T-3: CTA part id resolved from seed (first R&UoE part), no stale literal.
  const firstPart = await prisma.examPart.findFirst({
    where: { paper: "R&UoE" },
    orderBy: { sortOrder: "asc" },
    select: { id: true },
  });
  const practiceHref = firstPart ? `/exams/practice/${firstPart.id}` : "/exams";

  return (
    <div className="flex flex-col min-h-screen bg-background text-[#2B1E19] font-sans selection:bg-[#FFB703] selection:text-[#2B1E19]">
      {/* Header / Navegación */}
      <header className="sticky top-0 z-50 w-full border-b-2 border-[#F0E8DD] bg-[#FFFDF9]/90 backdrop-blur-md">
        <div className="container mx-auto flex h-20 items-center justify-between px-6 max-w-7xl">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#FFB703] shadow-[0_3px_0_#D49200]">
              <SlothMascot size={40} pose="happy" />
            </div>
            <span className="text-2xl font-black tracking-tight font-serif text-[#2B1E19]">
              OpenSloth
            </span>
          </div>

          <nav className="flex items-center gap-6">
            <Link
              href="/auth/login"
              className="text-base font-bold text-[#E85D04] hover:text-primary transition-colors"
            >
              Iniciar sesión
            </Link>
            <Link
              href="/auth/register"
              className="inline-flex items-center justify-center rounded-2xl bg-primary px-6 py-3 text-base font-extrabold text-white shadow-[0_4px_0_#C74D23] transition-all hover:translate-y-0.5 hover:shadow-[0_2px_0_#C74D23] active:translate-y-1 active:shadow-none"
            >
              Empieza Gratis
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Principal */}
      <main className="flex-1">
        <section className="container mx-auto px-6 py-16 md:py-24 max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Mensaje Principal (Hero Left) */}
            <div className="lg:col-span-7 space-y-8">
              <div className="inline-flex items-center gap-2 rounded-full bg-[#FFE8D6] px-4 py-2 text-sm font-extrabold text-[#E85D04] border border-[#FFD6BA]">
                <AwardIcon className="w-5 h-5" color="#E85D04" />
                <span>Especializado en Cambridge B2 First en España</span>
              </div>

              <h1 className="text-5xl font-black tracking-tight sm:text-6xl md:text-7xl leading-[1.08] text-[#2B1E19]">
                Consigue tus certificados{" "}
                <span className="text-primary underline decoration-[#FFB703] underline-offset-8">
                  a tu ritmo
                </span>{" "}
                y sin estrés.
              </h1>

              <p className="text-xl text-[#6B5E57] max-w-2xl font-medium leading-relaxed">
                Aprende sin agobios con nuestro perezoso interactivo. Simuladores de examen reales, corrección inmediata con IA y hábitos adictivos que te aseguran el aprobado.
              </p>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2">
                <Link
                  href="/auth/register"
                  className="inline-flex items-center justify-center gap-3 rounded-3xl bg-primary px-8 py-5 text-xl font-black text-white shadow-[0_6px_0_#C74D23] transition-all hover:translate-y-0.5 hover:shadow-[0_3px_0_#C74D23] active:translate-y-1.5 active:shadow-none"
                >
                  <span>¡Quiero mi Aprobado!</span>
                  <ArrowRightIcon className="w-6 h-6" color="#FFFFFF" />
                </Link>

<Link
                  href={practiceHref}
                  className="inline-flex items-center justify-center gap-3 rounded-3xl bg-card border-2 border-[#F0E8DD] px-7 py-5 text-lg font-bold text-[#2B1E19] shadow-[0_4px_0_#E2D6C5] transition-all hover:translate-y-0.5 hover:shadow-[0_2px_0_#E2D6C5] active:translate-y-1 active:shadow-none"
                >
                  <PlayIcon className="w-5 h-5" color="#E85D04" />
                  <span>Probar Simulador B2</span>
                </Link>
              </div>

              {/* Prueba Social */}
              <div className="flex items-center gap-4 pt-4 border-t border-[#F0E8DD]">
                <div className="flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <StarIcon key={i} className="w-5 h-5" color="#FFB703" />
                  ))}
                </div>
                <span className="text-sm font-bold text-[#8C7A70]">
                  +14.000 estudiantes ya han aprobado su examen de inglés
                </span>
              </div>
            </div>

            {/* Ilustración Mascot (Hero Right) */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="relative w-full max-w-md rounded-3xl bg-[#FFF8F0] border-4 border-[#FFE4D6] p-8 text-center shadow-xl space-y-6">
                <div className="flex justify-center pt-2">
                  <SlothMascot size={220} pose="cheering" />
                </div>

                <div className="inline-block rounded-2xl bg-white border-2 border-[#F0E8DD] p-4 text-left shadow-md">
                  <div className="flex items-center gap-3">
                    <FlameIcon className="w-7 h-7" color="#FFB703" />
                    <p className="text-base font-extrabold text-[#2B1E19]">
                      «¡Hoy solo 5 minutos para mantener tu racha!»
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div className="rounded-2xl bg-white p-4 border-2 border-[#F0E8DD] text-center">
                    <p className="text-2xl font-black text-[#2A9D8F]">98,4%</p>
                    <p className="text-xs font-bold text-[#8C7A70]">Tasa de Aprobados</p>
                  </div>
                  <div className="rounded-2xl bg-white p-4 border-2 border-[#F0E8DD] text-center">
                    <p className="text-2xl font-black text-[#E85D04]">15 min/día</p>
                    <p className="text-xs font-bold text-[#8C7A70]">Sin Sobrecarga</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Sección de Características Adictivas */}
        <section className="bg-[#FFFDF9] border-t-2 border-[#F0E8DD] py-20">
          <div className="container mx-auto px-6 max-w-7xl space-y-16">
            <div className="text-center space-y-4 max-w-3xl mx-auto">
              <span className="text-sm font-black uppercase tracking-widest text-[#E85D04]">
                ¿POR QUÉ OPENSLOTH ES ADICTIVO?
              </span>
              <h2 className="text-4xl sm:text-5xl font-black text-[#2B1E19]">
                Diseñado para aprender con una sonrisa y sin estrés
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Tarjeta 1 */}
              <div className="rounded-3xl bg-white border-2 border-[#F0E8DD] p-8 space-y-6 shadow-[0_6px_0_#F0E8DD] transition-transform hover:-translate-y-1">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#FFE8D6]">
                  <TargetIcon className="w-8 h-8" color="#E85D04" />
                </div>
                <h3 className="text-2xl font-extrabold text-[#2B1E19]">
                  Exámenes B2 Reales
                </h3>
                <p className="text-base text-[#6B5E57] font-medium leading-relaxed">
                  Practica con modelos idénticos a los oficiales de Cambridge (Reading, Use of English, Listening y Writing).
                </p>
              </div>

              {/* Tarjeta 2 */}
              <div className="rounded-3xl bg-white border-2 border-[#F0E8DD] p-8 space-y-6 shadow-[0_6px_0_#F0E8DD] transition-transform hover:-translate-y-1">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#FFF3D6]">
                  <FlameIcon className="w-8 h-8" color="#FFB703" />
                </div>
                <h3 className="text-2xl font-extrabold text-[#2B1E19]">
                  Rachas y Recompensas
                </h3>
                <p className="text-base text-[#6B5E57] font-medium leading-relaxed">
                  Gana medallas y mantén tu racha diaria sin sentir la presión de los exámenes tradicionales.
                </p>
              </div>

              {/* Tarjeta 3 */}
              <div className="rounded-3xl bg-white border-2 border-[#F0E8DD] p-8 space-y-6 shadow-[0_6px_0_#F0E8DD] transition-transform hover:-translate-y-1">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#E6F4F1]">
                  <CpuIcon className="w-8 h-8" color="#2A9D8F" />
                </div>
                <h3 className="text-2xl font-extrabold text-[#2B1E19]">
                  Corrección IA al Instante
                </h3>
                <p className="text-base text-[#6B5E57] font-medium leading-relaxed">
                  Recibe consejos detallados sobre tus redacciones y ejercicios al momento para saber exactamente qué mejorar.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t-2 border-[#F0E8DD] bg-background py-10 text-center text-sm font-bold text-[#8C7A70]">
        <div className="container mx-auto px-6">
          <p>© OpenSloth — Tu título de inglés B2 en España a tu propio ritmo.</p>
        </div>
      </footer>
    </div>
  );
}
