// app/(tabs)/index.tsx — Today dashboard
import { useCallback, useState } from "react";
import { ActivityIndicator, Text, View } from "react-native";
import { useFocusEffect } from "expo-router";
import { Card } from "@/components/Card";
import { ErrorBanner } from "@/components/ErrorBanner";
import { Screen } from "@/components/Screen";
import { authedFetch } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { getLoggedDates, getTodayTotals } from "@/lib/meals";
import { calculateStreak } from "@/lib/streak";
import { supabase } from "@/lib/supabase";
import { useTheme } from "@/theme/tokens";

interface Totals {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export default function TodayScreen() {
  const { colors } = useTheme();
  const { user } = useAuth();
  const [totals, setTotals] = useState<Totals>({ calories: 0, protein: 0, carbs: 0, fat: 0 });
  const [goal, setGoal] = useState<number | null>(null);
  const [streak, setStreak] = useState(0);
  const [weeklySummary, setWeeklySummary] = useState<string | null>(null);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  // Refetch every time the tab regains focus, so a meal saved from Log
  // shows up here immediately without needing a manual refresh. Only the
  // very first load shows a spinner — a failed background refetch reports
  // an error but keeps whatever data is already on screen.
  useFocusEffect(
    useCallback(() => {
      if (!user) return;
      let cancelled = false;

      async function load() {
        if (!user) return;
        try {
          const { data: profile, error: profileError } = await supabase
            .from("profiles")
            .select("daily_calorie_goal")
            .eq("id", user.id)
            .single();
          if (profileError) throw profileError;
          const [t, dates] = await Promise.all([getTodayTotals(user.id), getLoggedDates(user.id)]);
          if (cancelled) return;
          setGoal(profile?.daily_calorie_goal ?? null);
          setTotals(t);
          setStreak(calculateStreak(dates));
          setError(null);
        } catch {
          if (!cancelled) setError("Couldn't load your totals — check your connection.");
        } finally {
          if (!cancelled) setInitialLoading(false);
        }
      }
      load();

      return () => {
        cancelled = true;
      };
    }, [user, retryCount])
  );

  useFocusEffect(
    useCallback(() => {
      authedFetch("/api/weekly-summary")
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data?.summary) setWeeklySummary(data.summary);
        })
        .catch(() => {});
    }, [])
  );

  const progress = goal ? Math.min(totals.calories / goal, 1) : 0;

  if (initialLoading) {
    return (
      <Screen scroll={false}>
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </Screen>
    );
  }

  return (
    <Screen>
      <View>
        <Text style={{ fontSize: 30, fontWeight: "700", color: colors.foreground, letterSpacing: -0.5 }}>
          Today
        </Text>
        {streak > 0 && (
          <Text style={{ fontSize: 14, color: colors.mutedForeground, marginTop: 2 }}>🔥 {streak}-day streak</Text>
        )}
      </View>

      {error && <ErrorBanner message={error} onRetry={() => setRetryCount((c) => c + 1)} />}

      <Card level={2}>
        <Text style={{ fontSize: 13, fontWeight: "600", color: colors.mutedForeground }}>Daily Totals</Text>
        <View style={{ flexDirection: "row", alignItems: "baseline", gap: 6, marginTop: 4 }}>
          <Text style={{ fontSize: 42, fontWeight: "700", color: colors.foreground, letterSpacing: -1 }}>
            {totals.calories}
          </Text>
          <Text style={{ fontSize: 14, color: colors.mutedForeground }}>{goal ? `/ ${goal} kcal` : "kcal"}</Text>
        </View>

        {goal !== null && (
          <View style={{ height: 8, borderRadius: 999, backgroundColor: colors.surfaceMuted, marginTop: 12, overflow: "hidden" }}>
            <View
              style={{
                height: "100%",
                width: `${progress * 100}%`,
                borderRadius: 999,
                backgroundColor: colors.primary,
              }}
            />
          </View>
        )}

        <View style={{ flexDirection: "row", gap: 10, marginTop: 16 }}>
          <MacroTile label="Protein" value={totals.protein} color={colors.primary} colors={colors} />
          <MacroTile label="Carbs" value={totals.carbs} color={colors.accentTerracotta} colors={colors} />
          <MacroTile label="Fat" value={totals.fat} color={colors.accentGold} colors={colors} />
        </View>
      </Card>

      {weeklySummary && (
        <Card level={1} style={{ backgroundColor: colors.surfaceMuted, borderStyle: "dashed" }}>
          <Text style={{ fontSize: 13, color: colors.foreground, fontStyle: "italic", lineHeight: 19 }}>
            {weeklySummary}
          </Text>
        </Card>
      )}
    </Screen>
  );
}

function MacroTile({
  label,
  value,
  color,
  colors,
}: {
  label: string;
  value: number;
  color: string;
  colors: ReturnType<typeof useTheme>["colors"];
}) {
  return (
    <View style={{ flex: 1, backgroundColor: colors.surfaceMuted, borderRadius: 14, padding: 10 }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
        <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: color }} />
        <Text style={{ fontSize: 12, color: colors.mutedForeground }}>{label}</Text>
      </View>
      <Text style={{ fontSize: 17, fontWeight: "700", color: colors.foreground, marginTop: 4 }}>
        {value}
        <Text style={{ fontSize: 11, fontWeight: "400", color: colors.mutedForeground }}> g</Text>
      </Text>
    </View>
  );
}
