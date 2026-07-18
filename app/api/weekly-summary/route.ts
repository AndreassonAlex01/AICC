// app/api/weekly-summary/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // A stable key for "this week", so the cache lookup below is consistent
  const startOfWeek = new Date();
  startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
  const weekKey = startOfWeek.toISOString().split("T")[0];

  const { data: cached } = await supabase
    .from("weekly_summaries")
    .select("summary")
    .eq("user_id", user.id)
    .eq("week_start", weekKey)
    .maybeSingle();
  if (cached) return NextResponse.json({ summary: cached.summary });

  // No cached summary yet — gather the last 7 days of totals ourselves
  const since = new Date();
  since.setDate(since.getDate() - 7);
  const { data: meals } = await supabase
    .from("meals")
    .select("logged_at, meal_items(calories, protein_grams)")
    .eq("user_id", user.id)
    .gte("logged_at", since.toISOString());

  const byDate = new Map<string, { calories: number; protein: number }>();
  for (const meal of meals ?? []) {
    const date = meal.logged_at.split("T")[0];
    const existing = byDate.get(date) ?? { calories: 0, protein: 0 };
    for (const item of meal.meal_items) {
      existing.calories += item.calories;
      existing.protein += item.protein_grams;
    }
    byDate.set(date, existing);
  }
  const weeklyTotals = [...byDate.entries()].map(([date, totals]) => ({ date, ...totals }));

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": process.env.ANTHROPIC_API_KEY!,
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-6",
      max_tokens: 150,
      messages: [{
        role: "user",
        content: `Here is a user's daily nutrition totals for the past 7 days: ${JSON.stringify(weeklyTotals)}.
Write one short, encouraging sentence noting a trend (e.g. protein intake, consistency, calorie balance). No preamble.`,
      }],
    }),
  });

  const data = await res.json();
  const textBlock = data.content.find((c: any) => c.type === "text");
  const summary = textBlock.text.trim();

  await supabase.from("weekly_summaries").insert({ user_id: user.id, week_start: weekKey, summary });

  return NextResponse.json({ summary });
}