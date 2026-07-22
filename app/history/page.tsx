// app/history/page.tsx
"use client";
import { useEffect, useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import { Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { getHistoricalTotals, getRecentMeals, deleteMealItem, type LoggedDay } from "@/lib/meals";

const RANGES = [
  { label: "Week", days: 7 },
  { label: "Month", days: 30 },
  { label: "3 Months", days: 90 },
];

function formatDateLabel(date: string) {
  return new Date(`${date}T00:00:00`).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border bg-popover px-3 py-2 text-sm shadow-md">
      <p className="mb-1 font-medium text-popover-foreground">{formatDateLabel(label)}</p>
      {payload.map((p: any) => (
        <p key={p.dataKey} className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <span className="size-2 rounded-full" style={{ backgroundColor: p.color }} />
          {p.name}: <span className="font-medium text-popover-foreground">{Math.round(p.value)}</span>
          {p.dataKey === "calories" ? " kcal" : "g"}
        </p>
      ))}
    </div>
  );
}

export default function HistoryPage() {
  const [range, setRange] = useState(7);
  const [dailyTotals, setDailyTotals] = useState<{ date: string; calories: number; protein: number }[]>([]);
  const [loggedDays, setLoggedDays] = useState<LoggedDay[]>([]);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function load() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const [totals, meals] = await Promise.all([
      getHistoricalTotals(user.id, range),
      getRecentMeals(user.id, range),
    ]);
    setDailyTotals(totals);
    setLoggedDays(meals);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [range]);

  async function handleDelete(itemId: string) {
    setDeletingId(itemId);
    try {
      await deleteMealItem(itemId);
      await load();
    } finally {
      setDeletingId(null);
    }
  }

  const totalDays = dailyTotals.length || 1;
  const avgCalories = Math.round(dailyTotals.reduce((sum, d) => sum + d.calories, 0) / totalDays);
  const avgProtein = Math.round(dailyTotals.reduce((sum, d) => sum + d.protein, 0) / totalDays);

  return (
    <div className="animate-page-in flex flex-col gap-4">
      <h2 className="text-xl font-semibold tracking-tight">History</h2>

      <div className="flex gap-2">
        {RANGES.map((r) => (
          <button
            key={r.days}
            onClick={() => setRange(r.days)}
            className={`rounded-full px-3 py-1 text-sm font-medium transition-colors ${
              range === r.days ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:text-foreground"
            }`}
          >
            {r.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl border bg-card p-3">
          <div className="flex items-center gap-1.5">
            <span className="size-2 rounded-full" style={{ backgroundColor: "var(--chart-1)" }} />
            <span className="text-xs text-muted-foreground">Avg calories / day</span>
          </div>
          <p className="mt-1 text-xl font-semibold tabular-nums">{avgCalories || 0}</p>
        </div>
        <div className="rounded-xl border bg-card p-3">
          <div className="flex items-center gap-1.5">
            <span className="size-2 rounded-full" style={{ backgroundColor: "var(--chart-2)" }} />
            <span className="text-xs text-muted-foreground">Avg protein / day</span>
          </div>
          <p className="mt-1 text-xl font-semibold tabular-nums">
            {avgProtein || 0}
            <span className="ml-0.5 text-xs font-normal text-muted-foreground">g</span>
          </p>
        </div>
      </div>

      <div className="rounded-2xl border bg-card p-4 shadow-sm">
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={dailyTotals} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
            <defs>
              <linearGradient id="fillCalories" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--chart-1)" stopOpacity={0.35} />
                <stop offset="95%" stopColor="var(--chart-1)" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="fillProtein" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--chart-2)" stopOpacity={0.35} />
                <stop offset="95%" stopColor="var(--chart-2)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
            <XAxis
              dataKey="date"
              tickFormatter={formatDateLabel}
              tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
              axisLine={{ stroke: "var(--border)" }}
              tickLine={false}
              minTickGap={24}
            />
            <YAxis tick={{ fill: "var(--muted-foreground)", fontSize: 11 }} axisLine={false} tickLine={false} width={36} />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="calories"
              name="Calories"
              stroke="var(--chart-1)"
              strokeWidth={2}
              fill="url(#fillCalories)"
              activeDot={{ r: 4, strokeWidth: 0 }}
            />
            <Area
              type="monotone"
              dataKey="protein"
              name="Protein"
              stroke="var(--chart-2)"
              strokeWidth={2}
              fill="url(#fillProtein)"
              activeDot={{ r: 4, strokeWidth: 0 }}
            />
          </AreaChart>
        </ResponsiveContainer>
        <div className="mt-2 flex justify-center gap-4">
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span className="size-2 rounded-full" style={{ backgroundColor: "var(--chart-1)" }} /> Calories
          </span>
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span className="size-2 rounded-full" style={{ backgroundColor: "var(--chart-2)" }} /> Protein
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <h3 className="text-sm font-medium text-muted-foreground">Logged meals</h3>
        {loggedDays.length === 0 && (
          <p className="rounded-lg border border-dashed p-4 text-center text-sm text-muted-foreground">
            No meals logged in this range yet.
          </p>
        )}
        {loggedDays.map((day) => (
          <div key={day.date} className="flex flex-col gap-2">
            <p className="text-xs font-medium text-muted-foreground">{formatDateLabel(day.date)}</p>
            <div className="flex flex-col gap-2">
              {day.items.map((item) => (
                <div key={item.id} className="flex items-center gap-3 rounded-xl bg-muted/60 p-3">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{item.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {item.portionGrams}g · {item.calories} kcal · P{item.proteinGrams} C{item.carbsGrams} F{item.fatGrams}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDelete(item.id)}
                    disabled={deletingId === item.id}
                    aria-label={`Remove ${item.name}`}
                    className="flex size-8 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive disabled:opacity-50"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
