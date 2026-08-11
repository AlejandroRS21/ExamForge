// OpenSloth — Learn Shell Header (slim)
// A-SH-1: the global (app) shell already renders brand + nav, so this
// per-area header keeps ONLY the control the global shell does not provide:
// the moments MuteToggle. No duplicated brand/nav links.

import { MuteToggle } from "@/components/moments/MuteToggle";

export function LearnHeader() {
  return (
    <div className="flex items-center justify-end gap-3 border-b px-4 py-2">
      <MuteToggle />
    </div>
  );
}
