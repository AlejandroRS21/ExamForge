/**
 * @vitest-environment jsdom
 */
import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { WeeklyLeagueCard, RankingItem } from "./WeeklyLeagueCard";

const sampleRankings: RankingItem[] = [
  { userId: "u1", name: "Alice", weeklyXp: 1200, rank: 1 },
  { userId: "u2", name: "Bob", weeklyXp: 850, rank: 2 },
  { userId: "u3", name: "Charlie", weeklyXp: 400, rank: 3 },
  { userId: "u4", name: "David", weeklyXp: 150, rank: 4 },
];

describe("WeeklyLeagueCard", () => {
  it("renders league name and user rank", () => {
    render(
      <WeeklyLeagueCard
        league="Gold"
        userRank={2}
        weeklyXp={850}
        rankings={sampleRankings}
      />
    );

    expect(screen.getByTestId("league-title")).toHaveTextContent("Liga Gold");
    expect(screen.getByTestId("user-rank")).toHaveTextContent("#2");
    expect(screen.getByTestId("user-xp")).toHaveTextContent("850 XP");
  });

  it("renders ranking items with top 3 medals", () => {
    render(
      <WeeklyLeagueCard
        league="Diamond"
        userRank={1}
        weeklyXp={1200}
        rankings={sampleRankings}
      />
    );

    expect(screen.getByTestId("ranking-item-1")).toHaveTextContent("Alice");
    expect(screen.getByTestId("ranking-item-1")).toHaveTextContent("🥇");
    expect(screen.getByTestId("ranking-item-2")).toHaveTextContent("🥈");
    expect(screen.getByTestId("ranking-item-3")).toHaveTextContent("🥉");
    expect(screen.getByTestId("ranking-item-4")).toHaveTextContent("#4");
  });
});
