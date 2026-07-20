// ExamForge — Dashboard Metric Card
// Neuroinclusive UI adoption: matches the approved Pencil MetricCard mockup
// (id XYoPs) — icon + label row, large value, optional success-colored delta.
// Uses emoji glyphs for icons (no lucide-react/icon library is installed in
// this project — see AGENTS-provided task notes; kept consistent with the
// existing emoji-icon convention in achievements.ts and empty-state UI).

interface MetricCardProps {
  icon: string;
  label: string;
  value: string;
  /** Real, honestly-derived trend text (e.g. "Personal best"). Omitted when no real delta exists. */
  delta?: string;
}

export function MetricCard({ icon, label, value, delta }: MetricCardProps) {
  return (
    <div className="flex flex-col gap-2 rounded-xl border bg-card p-generous">
      <div className="flex items-center gap-2">
        <span aria-hidden="true" className="text-[15px] leading-none text-muted-foreground">
          {icon}
        </span>
        <span className="text-[13px] font-medium text-muted-foreground">{label}</span>
      </div>
      <p className="text-[30px] font-semibold leading-none text-foreground">{value}</p>
      {delta && <p className="text-xs font-medium text-success">{delta}</p>}
    </div>
  );
}
