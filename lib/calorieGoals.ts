// lib/calorieGoals.ts
type Sex = "male" | "female";
type Activity = "sedentary" | "light" | "moderate" | "heavy" | "athlete";
type Goal = "lose" | "maintain" | "gain";

const ACTIVITY_MULTIPLIERS: Record<Activity, number> = {
  sedentary: 1.2, light: 1.375, moderate: 1.55, heavy: 1.725, athlete: 1.9,
};

export function calculateGoals(
  weightKg: number, heightCm: number, age: number, sex: Sex, activity: Activity, goal: Goal
) {
  const bmr = sex === "male"
    ? 10 * weightKg + 6.25 * heightCm - 5 * age + 5
    : 10 * weightKg + 6.25 * heightCm - 5 * age - 161;

  let calories = bmr * ACTIVITY_MULTIPLIERS[activity];
  if (goal === "lose") calories -= 500;
  if (goal === "gain") calories += 300;

  // 30% protein / 40% carbs / 30% fat, converted from calories to grams
  return {
    dailyCalorieGoal: Math.round(calories),
    dailyProteinGoal: Math.round((calories * 0.3) / 4),
    dailyCarbsGoal: Math.round((calories * 0.4) / 4),
    dailyFatGoal: Math.round((calories * 0.3) / 9),
  };
}