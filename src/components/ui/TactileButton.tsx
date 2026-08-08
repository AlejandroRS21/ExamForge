// ExamForge — 3D Tactile Button (server-safe)
// Reuses the warm Sloth design tokens from globals.css inline (no globals.css
// edits): brand orange uses --btn-shadow-primary; amber/soft use the existing
// honey + cream shadow palette already spread across the app.

import type { HTMLAttributes, ReactNode } from "react";

export type TactileButtonVariant = "primary" | "amber" | "soft";

interface TactileButtonProps
  extends Omit<HTMLAttributes<HTMLElement>, "children" | "className" | "disabled"> {
  children?: ReactNode;
  className?: string;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
  variant?: TactileButtonVariant; // default "amber"
  as?: "button" | "a";
  href?: string;
}

const BASE_CLASSES =
  "inline-flex items-center justify-center gap-2 rounded-2xl px-5 py-2.5 text-sm font-bold transition-all active:translate-y-1 active:shadow-none disabled:opacity-40 disabled:pointer-events-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6B35]";

const VARIANT_CLASSES: Record<TactileButtonVariant, string> = {
  primary:
    "bg-[#FF6B35] text-white shadow-[0_4px_0_0_var(--btn-shadow-primary)] hover:brightness-105",
  amber:
    "border-2 border-amber-200 bg-white text-amber-950 shadow-[0_4px_0_0_#FDE68A] hover:bg-amber-50",
  soft: "border-2 border-[#E5D9CC] bg-[#FAF6F0] text-amber-950 shadow-[0_3px_0_0_#E5D9CC] hover:bg-[#FFE8D6]",
};

export function TactileButton({
  variant = "amber",
  as = "button",
  href,
  className = "",
  disabled,
  children,
  ...rest
}: TactileButtonProps) {
  const classes = `${BASE_CLASSES} ${VARIANT_CLASSES[variant]} ${className}`.trim();

  if (as === "a" && href) {
    return (
      <a href={href} className={classes} {...rest}>
        {children}
      </a>
    );
  }

  return (
    <button type="button" disabled={disabled} className={classes} {...rest}>
      {children}
    </button>
  );
}