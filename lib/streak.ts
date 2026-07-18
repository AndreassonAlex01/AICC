// lib/streak.ts
export function calculateStreak(loggedDates: string[]): number {
  const sorted = [...new Set(loggedDates)].sort().reverse();
  const today = new Date().toISOString().split("T")[0];
  if (sorted[0] !== today) return 0; // streak broken if nothing logged today

  let streak = 1;
  for (let i = 0; i < sorted.length - 1; i++) {
    const diffDays = (new Date(sorted[i]).getTime() - new Date(sorted[i + 1]).getTime()) / 86400000;
    if (diffDays === 1) streak++; else break;
  }
  return streak;
}