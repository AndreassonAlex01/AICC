// app/page.tsx
"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { getTodayTotals, getLoggedDates } from "@/lib/meals";
import { calculateStreak } from "@/lib/streak";


export default function TodayPage() {
  const [totals, setTotals] = useState({ calories: 0, protein: 0, carbs: 0, fat: 0 });
  const [goal, setGoal] = useState<number | null>(null);
  const [streak, setStreak] = useState(0);
  const [weeklySummary, setWeeklySummary] = useState<string | null>(null);
  {weeklySummary && <p className="rounded-lg bg-muted p-3 text-sm italic">{weeklySummary}</p>}



  useEffect(() => {
  fetch("/api/weekly-summary")
    .then((res) => res.json())
    .then((data) => setWeeklySummary(data.summary));
}, []);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from("profiles")
        .select("daily_calorie_goal")
        .eq("id", user.id)
        .single();
      setGoal(profile?.daily_calorie_goal ?? null);

      setTotals(await getTodayTotals(user.id));
      setStreak(calculateStreak(await getLoggedDates(user.id)));
    }
    load();
  }, []);

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-xl font-semibold">Today</h2>
      {streak > 0 && <p className="text-sm text-muted-foreground">🔥 {streak}-day streak</p>}
      <div className="rounded-lg border p-4">
        <p className="text-2xl font-bold">{totals.calories} kcal</p>
        {goal !== null && <p className="text-sm text-muted-foreground">of {goal} kcal goal</p>}
      </div>
      {/* protein/carbs/fat progress bars go here, same pattern as calories */}
    </div>
  );
  
}
