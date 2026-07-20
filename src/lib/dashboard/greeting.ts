// ExamForge — Time-of-day Greeting
// Neuroinclusive UI adoption: pure, testable helper for the Dashboard's
// greeting line ("Good morning/afternoon/evening, {name}").

export function getTimeOfDayGreeting(date: Date): "Good morning" | "Good afternoon" | "Good evening" {
  const hour = date.getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}
