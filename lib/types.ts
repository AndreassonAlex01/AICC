// lib/types.ts
export interface FoodItem {
  name: string;
  portionGrams: number;
  calories: number;
  proteinGrams: number;
  carbsGrams: number;
  fatGrams: number;
  confidence: "low" | "medium" | "high";
}