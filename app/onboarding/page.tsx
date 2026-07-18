// app/onboarding/page.tsx
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { calculateGoals } from "@/lib/calorieGoals";

export default function OnboardingPage() {
  const router = useRouter();
  const [heightCm, setHeightCm] = useState("");
  const [weightKg, setWeightKg] = useState("");
  const [age, setAge] = useState("");
  const [sex, setSex] = useState<"male" | "female">("male");
  const [activity, setActivity] = useState<"sedentary" | "light" | "moderate" | "heavy" | "athlete">("sedentary");
  const [goal, setGoal] = useState<"lose" | "maintain" | "gain">("maintain");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push("/login");
      return;
    }

    const goals = calculateGoals(Number(weightKg), Number(heightCm), Number(age), sex, activity, goal);

    await supabase.from("profiles").upsert({
      id: user.id,
      height_cm: Number(heightCm),
      weight_kg: Number(weightKg),
      age: Number(age),
      sex,
      activity_level: activity,
      daily_calorie_goal: goals.dailyCalorieGoal,
      daily_protein_goal: goals.dailyProteinGoal,
      daily_carbs_goal: goals.dailyCarbsGoal,
      daily_fat_goal: goals.dailyFatGoal,
    });

    setSaving(false);
    router.push("/");
  }

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-xl font-semibold">Tell us about yourself</h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <input type="number" placeholder="Height (cm)" required value={heightCm} onChange={(e) => setHeightCm(e.target.value)} className="rounded-lg border px-3 py-2" />
        <input type="number" placeholder="Weight (kg)" required value={weightKg} onChange={(e) => setWeightKg(e.target.value)} className="rounded-lg border px-3 py-2" />
        <input type="number" placeholder="Age" required value={age} onChange={(e) => setAge(e.target.value)} className="rounded-lg border px-3 py-2" />
        <select value={sex} onChange={(e) => setSex(e.target.value as typeof sex)} className="rounded-lg border px-3 py-2">
          <option value="male">Male</option>
          <option value="female">Female</option>
        </select>
        <select value={activity} onChange={(e) => setActivity(e.target.value as typeof activity)} className="rounded-lg border px-3 py-2">
          <option value="sedentary">Sedentary</option>
          <option value="light">Light exercise</option>
          <option value="moderate">Moderate exercise</option>
          <option value="heavy">Heavy exercise</option>
          <option value="athlete">Athlete</option>
        </select>
        <select value={goal} onChange={(e) => setGoal(e.target.value as typeof goal)} className="rounded-lg border px-3 py-2">
          <option value="lose">Lose weight</option>
          <option value="maintain">Maintain weight</option>
          <option value="gain">Gain weight</option>
        </select>
        <button type="submit" disabled={saving} className="rounded-lg bg-primary px-4 py-2 text-primary-foreground">
          {saving ? "Saving…" : "Continue"}
        </button>
      </form>
    </div>
  );
}