// OpenSloth — Achievements/Badges Display
// Shows badges grid with locked/unlocked state

"use client";

interface Badge {
  type: string;
  label: string;
  description: string;
  icon: string;
  unlockedAt: string | Date | null;
}

interface BadgesDisplayProps {
  badges: Badge[];
}

export function BadgesDisplay({ badges }: BadgesDisplayProps) {
  return (
    <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
      {badges.map((badge) => {
        const isUnlocked = !!badge.unlockedAt;
        return (
          <div
            key={badge.type}
            className={`relative rounded-xl border p-4 text-center transition-all ${
              isUnlocked
                ? "bg-card border-border shadow-sm"
                : "bg-muted/30 border-dashed opacity-50"
            }`}
            title={isUnlocked ? `Unlocked ${new Date(badge.unlockedAt as string).toLocaleDateString()}` : badge.description}
          >
            <div className="text-2xl mb-1">{badge.icon}</div>
            <p className="text-xs font-medium leading-tight">{badge.label}</p>
            {!isUnlocked && (
              <div className="absolute inset-0 rounded-xl flex items-center justify-center">
                <span className="text-lg">🔒</span>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
