// lib/types.ts — mirrors the web app's lib/types.ts FoodItem shape
export interface FoodItem {
  name: string;
  portionGrams: number;
  calories: number;
  proteinGrams: number;
  carbsGrams: number;
  fatGrams: number;
  confidence: "low" | "medium" | "high";
}
