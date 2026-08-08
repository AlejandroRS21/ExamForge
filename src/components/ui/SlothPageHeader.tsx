// ExamForge — Shared warm Sloth page header (RSC, default export)
// Wraps the recurring hero pattern used across exams / flashcards /
// challenges / practice / auth: pill badge + h1 + subtitle + SlothMascot.
//
// Pose mapping note: the proposal mentions `idle`/`thinking`, but the real
// SlothMascot type is "happy" | "cheering" | "calm" | "studying". Map
// idle -> calm (timer guard), thinking -> studying (in-flight pose),
// cheering -> cheering (achievements). Default pose here is "happy".

import Link from "next/link";
import { SlothMascot, type SlothPose } from "./SlothMascot";

interface SlothPageHeaderProps {
  /** Small pill label, e.g. "Examen Cambridge B2 First" */
  badge?: string;
  title: string;
  subtitle?: string;
  /** SlothMascot pose, default "happy" */
  pose?: SlothPose;
  /** SlothMascot size, default 150 */
  mascotSize?: number;
  /** Optional top-left back link (client-side navigation) */
  backHref?: string;
  /** Back link label, default "Volver" */
  backLabel?: string;
  /** "split" = mascot right (hero pages), "stacked" = centered (auth screens) */
  layout?: "split" | "stacked";
}

export default function SlothPageHeader({
  badge,
  title,
  subtitle,
  pose = "happy",
  mascotSize = 150,
  backHref,
  backLabel = "Volver",
  layout = "split",
}: SlothPageHeaderProps) {
  const stacked = layout === "stacked";
  return (
    <div
      className={`relative bg-white p-8 rounded-3xl border-2 border-amber-200/80 shadow-[0_6px_0_0_#FDE68A] flex flex-col items-center justify-between gap-6 ${
        stacked ? "" : "md:flex-row"
      }`}
    >
      {backHref && (
        <Link
          href={backHref}
          className="self-start md:self-auto inline-flex items-center gap-1.5 rounded-2xl border-2 border-amber-200 bg-[#FAF6F0] px-3.5 py-1.5 text-xs font-bold text-amber-950 shadow-[0_3px_0_0_#FDE68A] hover:bg-amber-50 active:translate-y-0.5 active:shadow-none transition-all"
        >
          ← {backLabel}
        </Link>
      )}
      <div className={`space-y-2 ${stacked ? "text-center" : "text-center md:text-left"}`}>
        {badge && (
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100/70 border border-amber-300/60 text-amber-900 text-xs font-bold uppercase tracking-wide">
            {badge}
          </div>
        )}
        <h1 className="text-3xl font-extrabold tracking-tight text-amber-950">{title}</h1>
        {subtitle && (
          <p className="text-amber-800/80 max-w-xl font-medium text-sm md:text-base">
            {subtitle}
          </p>
        )}
      </div>
      <SlothMascot pose={pose} size={mascotSize} className="shrink-0" />
    </div>
  );
}