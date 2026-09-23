// lib/meals.ts — ported from the web app's lib/meals.ts, but using the one
// shared `supabase` singleton instead of calling createClient() per function
// (that per-call pattern was the root cause of the "inconsistent server
// connection / logins" bug — see theme/tokens.ts sibling note in lib/auth.tsx).
import { supabase } from "@/lib/supabase";
import type { FoodItem } from "@/lib/types";

export async function saveMeal(items: FoodItem[]) {
  const {
    data: { user },
  } = await supabase.auth.getUser();
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
  const { data } = await supabase.from("meals").select("logged_at").eq("user_id", userId);
  return (data ?? []).map((m) => m.logged_at.split("T")[0]);
}

export async function getHistoricalTotals(userId: string, days: number) {
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

export interface LoggedMealItem {
  id: string;
  name: string;
  portionGrams: number;
  calories: number;
  proteinGrams: number;
  carbsGrams: number;
  fatGrams: number;
  confidence: "low" | "medium" | "high";
}

export interface LoggedDay {
  date: string;
  items: LoggedMealItem[];
}

export async function getRecentMeals(userId: string, days: number): Promise<LoggedDay[]> {
  const since = new Date();
  since.setDate(since.getDate() - days);

  const { data } = await supabase
    .from("meals")
    .select("logged_at, meal_items(id, name, portion_grams, calories, protein_grams, carbs_grams, fat_grams, confidence)")
    .eq("user_id", userId)
    .gte("logged_at", since.toISOString())
    .order("logged_at", { ascending: false });

  const byDate = new Map<string, LoggedMealItem[]>();
  for (const meal of data ?? []) {
    const date = meal.logged_at.split("T")[0];
    const items = byDate.get(date) ?? [];
    for (const item of meal.meal_items) {
      items.push({
        id: item.id,
        name: item.name,
        portionGrams: item.portion_grams,
        calories: item.calories,
        proteinGrams: item.protein_grams,
        carbsGrams: item.carbs_grams,
        fatGrams: item.fat_grams,
        confidence: item.confidence,
      });
    }
    byDate.set(date, items);
  }

  return [...byDate.entries()]
    .filter(([, items]) => items.length > 0)
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([date, items]) => ({ date, items }));
}

export async function deleteMealItem(itemId: string) {
  const { data: item, error: fetchError } = await supabase
    .from("meal_items")
    .select("meal_id")
    .eq("id", itemId)
    .single();
  if (fetchError) throw fetchError;

  const { error } = await supabase.from("meal_items").delete().eq("id", itemId);
  if (error) throw error;

  // Deleting the last item in a meal leaves an empty `meals` row behind —
  // getLoggedDates()/calculateStreak() only look at meals.logged_at, not
  // whether it has items, so an orphan row silently inflates the streak.
  // Clean it up so a day with nothing actually logged doesn't count.
  const { count } = await supabase
    .from("meal_items")
    .select("id", { count: "exact", head: true })
    .eq("meal_id", item.meal_id);
  if (count === 0) {
    await supabase.from("meals").delete().eq("id", item.meal_id);
  }
}

export async function updateMealItem(itemId: string, item: FoodItem) {
  const { error } = await supabase
    .from("meal_items")
    .update({
      name: item.name,
      portion_grams: item.portionGrams,
      calories: item.calories,
      protein_grams: item.proteinGrams,
      carbs_grams: item.carbsGrams,
      fat_grams: item.fatGrams,
    })
    .eq("id", itemId);
  if (error) throw error;
}
