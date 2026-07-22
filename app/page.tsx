// app/page.tsx
"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Camera, Target, Flame, Sparkles } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { getTodayTotals, getLoggedDates } from "@/lib/meals";
import { calculateStreak } from "@/lib/streak";
import { buttonVariants } from "@/components/ui/button";

const features = [
  {
    icon: Camera,
    title: "Snap & log in seconds",
    description: "Photograph your meal and let AI estimate calories and macros instantly.",
  },
  {
    icon: Target,
    title: "Goals built for you",
    description: "Get a personalized calorie and macro target based on your body and activity level.",
  },
  {
    icon: Flame,
    title: "Build your streak",
    description: "Stay consistent and watch your daily logging streak grow.",
  },
  {
    icon: Sparkles,
    title: "Weekly AI insights",
    description: "Get a smart summary of your eating patterns every week.",
  },
];

export default function TodayPage() {
  const [authChecked, setAuthChecked] = useState(false);
  const [isAuthed, setIsAuthed] = useState(false);
  const [totals, setTotals] = useState({ calories: 0, protein: 0, carbs: 0, fat: 0 });
  const [goal, setGoal] = useState<number | null>(null);
  const [streak, setStreak] = useState(0);
  const [weeklySummary, setWeeklySummary] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setIsAuthed(false);
        setAuthChecked(true);
        return;
      }
      setIsAuthed(true);

      const { data: profile } = await supabase
        .from("profiles")
        .select("daily_calorie_goal")
        .eq("id", user.id)
        .single();
      setGoal(profile?.daily_calorie_goal ?? null);

      setTotals(await getTodayTotals(user.id));
      setStreak(calculateStreak(await getLoggedDates(user.id)));
      setAuthChecked(true);
    }
    load();
  }, []);

  useEffect(() => {
    if (!isAuthed) return;
    fetch("/api/weekly-summary")
      .then(async (res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.summary) setWeeklySummary(data.summary);
      })
      .catch(() => {});
  }, [isAuthed]);

  if (!authChecked) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="size-6 animate-spin rounded-full border-2 border-muted-foreground/30 border-t-primary" />
      </div>
    );
  }

  if (!isAuthed) {
    return (
      <div className="animate-page-in flex flex-col gap-8 py-4">
        <div className="flex flex-col items-center gap-3 text-center">
          <span className="flex size-14 items-center justify-center rounded-2xl bg-primary text-2xl text-primary-foreground shadow-sm">
            🍽️
          </span>
          <h2 className="text-3xl font-semibold tracking-tight">Welcome to AICC</h2>
          <p className="max-w-xs text-muted-foreground">
            Your AI-powered macro tracker — snap a meal, get instant nutrition, and stay on target every day.
          </p>
        </div>

        <div className="flex flex-col gap-3">
          {features.map(({ icon: Icon, title, description }) => (
            <div key={title} className="flex items-start gap-3 rounded-2xl border bg-card p-4 shadow-sm">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-accent text-accent-foreground">
                <Icon size={18} />
              </span>
              <div>
                <p className="font-medium leading-tight">{title}</p>
                <p className="mt-0.5 text-sm text-muted-foreground">{description}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-2">
          <Link href="/login" className={buttonVariants({ size: "lg", className: "btn-press w-full justify-center" })}>
            Get started
          </Link>
          <Link
            href="/login?mode=signIn"
            className={buttonVariants({ variant: "outline", size: "lg", className: "btn-press w-full justify-center" })}
          >
            I already have an account
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-page-in flex flex-col gap-4">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Today</h2>
        {streak > 0 && (
          <p className="mt-0.5 text-sm text-muted-foreground">🔥 {streak}-day streak</p>
        )}
      </div>

      <div className="rounded-2xl border bg-card p-5 shadow-sm">
        <h3 className="text-sm font-medium text-muted-foreground">Daily Totals</h3>
        <div className="mt-1 flex items-baseline gap-2">
          <span className="text-5xl font-semibold tabular-nums tracking-tight">{totals.calories}</span>
          <span className="text-sm text-muted-foreground">
            {goal !== null ? `/ ${goal} kcal` : "kcal"}
          </span>
        </div>

        {goal !== null && (
          <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary transition-all"
              style={{ width: `${Math.min((totals.calories / goal) * 100, 100)}%` }}
            />
          </div>
        )}

        <div className="mt-5 grid grid-cols-3 gap-3">
          {[
            { label: "Protein", value: totals.protein, color: "var(--chart-1)" },
            { label: "Carbs", value: totals.carbs, color: "var(--chart-2)" },
            { label: "Fat", value: totals.fat, color: "var(--chart-3)" },
          ].map((macro) => (
            <div key={macro.label} className="rounded-xl bg-muted/60 p-3">
              <div className="flex items-center gap-1.5">
                <span className="size-2 rounded-full" style={{ backgroundColor: macro.color }} />
                <span className="text-xs text-muted-foreground">{macro.label}</span>
              </div>
              <p className="mt-1 text-lg font-semibold tabular-nums">
                {macro.value}
                <span className="ml-0.5 text-xs font-normal text-muted-foreground">g</span>
              </p>
            </div>
          ))}
        </div>
      </div>

      {weeklySummary && <p className="rounded-lg bg-muted p-3 text-sm italic">{weeklySummary}</p>}
    </div>
  );
}
