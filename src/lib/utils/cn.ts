// OpenSloth — className utility (lightweight clsx + twMerge equivalent)
// Simple classname merging without external dependencies

export function cn(...classes: (string | boolean | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(" ");
}
