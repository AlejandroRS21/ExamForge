// OpenSloth — Time-of-day Greeting Tests
// Neuroinclusive UI adoption: Dashboard greeting is time-of-day aware
// ("Good morning/afternoon/evening, {name}").

import { describe, it, expect } from "vitest";
import { getTimeOfDayGreeting } from "./greeting";

describe("getTimeOfDayGreeting", () => {
  it("returns 'Good morning' before noon", () => {
    expect(getTimeOfDayGreeting(new Date("2026-07-20T06:00:00"))).toBe("Good morning");
    expect(getTimeOfDayGreeting(new Date("2026-07-20T11:59:59"))).toBe("Good morning");
  });

  it("returns 'Good afternoon' from noon up to 6pm", () => {
    expect(getTimeOfDayGreeting(new Date("2026-07-20T12:00:00"))).toBe("Good afternoon");
    expect(getTimeOfDayGreeting(new Date("2026-07-20T17:59:59"))).toBe("Good afternoon");
  });

  it("returns 'Good evening' from 6pm onward", () => {
    expect(getTimeOfDayGreeting(new Date("2026-07-20T18:00:00"))).toBe("Good evening");
    expect(getTimeOfDayGreeting(new Date("2026-07-20T23:59:59"))).toBe("Good evening");
  });

  it("returns 'Good morning' right at midnight", () => {
    expect(getTimeOfDayGreeting(new Date("2026-07-20T00:00:00"))).toBe("Good morning");
  });
});
