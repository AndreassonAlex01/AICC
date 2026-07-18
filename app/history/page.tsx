// app/history/page.tsx
"use client";
import { useEffect, useState } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { createClient } from "@/lib/supabase/client";
import { getHistoricalTotals } from "@/lib/meals";

const RANGES = [
  { label: "Week", days: 7 },
  { label: "Month", days: 30 },
  { label: "3 Months", days: 90 },
];

export default function HistoryPage() {
  const [range, setRange] = useState(7);
  const [dailyTotals, setDailyTotals] = useState<{ date: string; calories: number; protein: number }[]>([]);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setDailyTotals(await getHistoricalTotals(user.id, range));
    }
    load();
  }, [range]);

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-xl font-semibold">History</h2>
      <div className="flex gap-2">
        {RANGES.map((r) => (
          <button
            key={r.days}
            onClick={() => setRange(r.days)}
            className={`rounded-full px-3 py-1 text-sm ${
              range === r.days ? "bg-primary text-primary-foreground" : "bg-muted"
            }`}
          >
            {r.label}
          </button>
        ))}
      </div>
      <ResponsiveContainer width="100%" height={250}>
        <LineChart data={dailyTotals}>
          <XAxis dataKey="date" />
          <YAxis />
          <Line type="monotone" dataKey="calories" stroke="#f97316" />
          <Line type="monotone" dataKey="protein" stroke="#22c55e" />
          <Tooltip />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}