// lib/meals.ts
import { createClient } from "@/lib/supabase/client";
import type { FoodItem } from "@/lib/types";

export async function saveMeal(items: FoodItem[]) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not signed in");

  const { data: meal, error: mealError } = await supabase
    .from("meals")
    .insert({ user_id: user.id })
    .select()
    .single();
  if (mealError) throw mealError;

  const { error: itemsError } = await supabase.from("meal_items").insert(
    items.map((item) => ({
      meal_id: meal.id,
      name: item.name,
      portion_grams: item.portionGrams,
      calories: item.calories,
      protein_grams: item.proteinGrams,
      carbs_grams: item.carbsGrams,
      fat_grams: item.fatGrams,
      confidence: item.confidence,
    }))
  );
  if (itemsError) throw itemsError;
}

export async function getTodayTotals(userId: string) {
  const supabase = createClient();
  const today = new Date().toISOString().split("T")[0];
  const { data } = await supabase
    .from("meals")
    .select("logged_at, meal_items(calories, protein_grams, carbs_grams, fat_grams)")
    .eq("user_id", userId)
    .gte("logged_at", `${today}T00:00:00`)
    .lte("logged_at", `${today}T23:59:59`);

  const allItems = (data ?? []).flatMap((m) => m.meal_items);
  return {
    calories: allItems.reduce((sum, i) => sum + i.calories, 0),
    protein: allItems.reduce((sum, i) => sum + i.protein_grams, 0),
    carbs: allItems.reduce((sum, i) => sum + i.carbs_grams, 0),
    fat: allItems.reduce((sum, i) => sum + i.fat_grams, 0),
  };
}

export async function getLoggedDates(userId: string): Promise<string[]> {
  const supabase = createClient();
  const { data } = await supabase.from("meals").select("logged_at").eq("user_id", userId);
  return (data ?? []).map((m) => m.logged_at.split("T")[0]);
}

// add to lib/meals.ts
export async function getHistoricalTotals(userId: string, days: number) {
  const supabase = createClient();
  const since = new Date();
  since.setDate(since.getDate() - days);

  const { data } = await supabase
    .from("meals")
    .select("logged_at, meal_items(calories, protein_grams)")
    .eq("user_id", userId)
    .gte("logged_at", since.toISOString());

  const byDate = new Map<string, { calories: number; protein: number }>();
  for (const meal of data ?? []) {
    const date = meal.logged_at.split("T")[0];
    const existing = byDate.get(date) ?? { calories: 0, protein: 0 };
    for (const item of meal.meal_items) {
      existing.calories += item.calories;
      existing.protein += item.protein_grams;
    }
    byDate.set(date, existing);
  }

  return [...byDate.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, totals]) => ({ date, ...totals }));
}