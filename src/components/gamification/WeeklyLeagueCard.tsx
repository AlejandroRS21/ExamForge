"use client";

import React from "react";

export interface RankingItem {
  userId: string;
  name: string;
  weeklyXp: number;
  rank: number;
}

export interface WeeklyLeagueCardProps {
  league: "Bronze" | "Silver" | "Gold" | "Diamond";
  userRank: number;
  weeklyXp: number;
  rankings: RankingItem[];
}

const LEAGUE_COLORS = {
  Bronze: "border-amber-700 text-amber-500 bg-amber-950/20",
  Silver: "border-slate-400 text-slate-300 bg-slate-900/40",
  Gold: "border-yellow-400 text-yellow-400 bg-yellow-950/20",
  Diamond: "border-cyan-400 text-cyan-300 bg-cyan-950/30",
};

const MEDALS = ["🥇", "🥈", "🥉"];

export function WeeklyLeagueCard({
  league,
  userRank,
  weeklyXp,
  rankings,
}: WeeklyLeagueCardProps) {
  return (
    <div
      data-testid="weekly-league-card"
      className={`rounded-2xl border-2 p-4 bg-slate-900/90 text-slate-100 ${LEAGUE_COLORS[league]}`}
    >
      <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
        <div>
          <h3 data-testid="league-title" className="text-lg font-bold">
            Liga {league}
          </h3>
          <p className="text-xs text-slate-400">
            Tu posición actual:{" "}
            <span data-testid="user-rank" className="font-bold text-slate-200">
              #{userRank}
            </span>
          </p>
        </div>
        <div className="text-right">
          <span data-testid="user-xp" className="text-sm font-bold text-amber-400">
            {weeklyXp} XP
          </span>
          <p className="text-[10px] text-slate-500 uppercase tracking-wider">esta semana</p>
        </div>
      </div>

      <div className="space-y-1.5 max-h-60 overflow-y-auto">
        {rankings.map((r) => (
          <div
            key={r.userId}
            data-testid={`ranking-item-${r.rank}`}
            className={`flex items-center justify-between px-3 py-1.5 rounded-lg text-sm transition-colors ${
              r.rank === userRank
                ? "bg-slate-800 border border-slate-700 font-bold"
                : "bg-slate-900/50 hover:bg-slate-800/40"
            }`}
          >
            <div className="flex items-center gap-2">
              <span className="w-6 text-center text-xs font-mono text-slate-400">
                {r.rank <= 3 ? MEDALS[r.rank - 1] : `#${r.rank}`}
              </span>
              <span className="truncate max-w-[140px] text-slate-200">{r.name}</span>
            </div>
            <span className="font-mono text-xs text-amber-400">{r.weeklyXp} XP</span>
          </div>
        ))}
      </div>
    </div>
  );
}
