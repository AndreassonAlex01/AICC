// app/(auth)/onboarding.tsx — mirrors the web app's onboarding form, plus a
// "name" field (bug #4: Profile never showed a name) stored in
// auth.user_metadata.full_name so no DB migration is needed.
import { useState } from "react";
import { Text, View } from "react-native";
import { router } from "expo-router";
import { Card } from "@/components/Card";
import { ChipSelect } from "@/components/ChipSelect";
import { PrimaryButton } from "@/components/PrimaryButton";
import { Screen } from "@/components/Screen";
import { TextField } from "@/components/TextField";
import { calculateGoals, type Activity, type Goal, type Sex } from "@/lib/calorieGoals";
import { supabase } from "@/lib/supabase";
import { useTheme } from "@/theme/tokens";

const SEX_OPTIONS: { value: Sex; label: string }[] = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
];

const ACTIVITY_OPTIONS: { value: Activity; label: string }[] = [
  { value: "sedentary", label: "Sedentary" },
  { value: "light", label: "Light exercise" },
  { value: "moderate", label: "Moderate exercise" },
  { value: "heavy", label: "Heavy exercise" },
  { value: "athlete", label: "Athlete" },
];

const GOAL_OPTIONS: { value: Goal; label: string }[] = [
  { value: "lose", label: "Lose weight" },
  { value: "maintain", label: "Maintain weight" },
  { value: "gain", label: "Gain weight" },
];

export default function OnboardingScreen() {
  const { colors } = useTheme();
  const [fullName, setFullName] = useState("");
  const [heightCm, setHeightCm] = useState("");
  const [weightKg, setWeightKg] = useState("");
  const [age, setAge] = useState("");
  const [sex, setSex] = useState<Sex>("male");
  const [activity, setActivity] = useState<Activity>("sedentary");
  const [goal, setGoal] = useState<Goal>("maintain");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSubmit = fullName.trim() && heightCm && weightKg && age;

  async function handleSubmit() {
    setError(null);
    setSaving(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setSaving(false);
      router.replace("/login");
      return;
    }

    const goals = calculateGoals(Number(weightKg), Number(heightCm), Number(age), sex, activity, goal);

    const [{ error: profileError }, { error: nameError }] = await Promise.all([
      supabase.from("profiles").upsert({
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
      }),
      supabase.auth.updateUser({ data: { full_name: fullName.trim() } }),
    ]);

    setSaving(false);
    if (profileError || nameError) {
      setError((profileError ?? nameError)?.message ?? "Something went wrong saving your profile.");
      return;
    }
    router.replace("/(tabs)");
  }

  return (
    <Screen>
      <View style={{ marginTop: 20 }}>
        <Text style={{ fontSize: 26, fontWeight: "700", color: colors.foreground }}>Tell us about yourself</Text>
        <Text style={{ fontSize: 14, color: colors.mutedForeground, marginTop: 4 }}>
          We'll use this to set your daily calorie and macro goals
        </Text>
      </View>

      <Card level={2} style={{ gap: 14 }}>
        <TextField label="Name" value={fullName} onChangeText={setFullName} placeholder="How should we greet you?" />
        <TextField label="Height (cm)" value={heightCm} onChangeText={setHeightCm} keyboardType="numeric" placeholder="175" />
        <TextField label="Weight (kg)" value={weightKg} onChangeText={setWeightKg} keyboardType="numeric" placeholder="70" />
        <TextField label="Age" value={age} onChangeText={setAge} keyboardType="numeric" placeholder="30" />
        <ChipSelect label="Sex" options={SEX_OPTIONS} value={sex} onChange={setSex} />
        <ChipSelect label="Activity level" options={ACTIVITY_OPTIONS} value={activity} onChange={setActivity} />
        <ChipSelect label="Goal" options={GOAL_OPTIONS} value={goal} onChange={setGoal} />
        {error && <Text style={{ color: colors.danger, fontSize: 13 }}>{error}</Text>}
        <PrimaryButton title="Continue" onPress={handleSubmit} loading={saving} disabled={!canSubmit} />
      </Card>
    </Screen>
  );
}
