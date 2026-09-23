// app/(tabs)/history.tsx
import { useCallback, useState } from "react";
import { ActivityIndicator, Pressable, Text, View } from "react-native";
import { useFocusEffect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { LineChart } from "react-native-gifted-charts";
import { Card } from "@/components/Card";
import { EditMealModal } from "@/components/EditMealModal";
import { ErrorBanner } from "@/components/ErrorBanner";
import { Screen } from "@/components/Screen";
import { useAuth } from "@/lib/auth";
import {
  deleteMealItem,
  getHistoricalTotals,
  getRecentMeals,
  updateMealItem,
  type LoggedDay,
  type LoggedMealItem,
} from "@/lib/meals";
import type { FoodItem } from "@/lib/types";
import { useTheme } from "@/theme/tokens";

const RANGES = [
  { label: "Week", days: 7 },
  { label: "Month", days: 30 },
  { label: "3 Months", days: 90 },
];

function formatDateLabel(date: string) {
  return new Date(`${date}T00:00:00`).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export default function HistoryScreen() {
  const { colors } = useTheme();
  const { user } = useAuth();
  const [range, setRange] = useState(7);
  const [dailyTotals, setDailyTotals] = useState<{ date: string; calories: number; protein: number }[]>([]);
  const [loggedDays, setLoggedDays] = useState<LoggedDay[]>([]);
  const [editingItem, setEditingItem] = useState<LoggedMealItem | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!user) return;
    try {
      const [totals, meals] = await Promise.all([getHistoricalTotals(user.id, range), getRecentMeals(user.id, range)]);
      setDailyTotals(totals);
      setLoggedDays(meals);
      setError(null);
    } catch {
      setError("Couldn't load your history — check your connection.");
    } finally {
      setInitialLoading(false);
    }
  }, [user, range]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  async function handleDelete(itemId: string) {
    setBusyId(itemId);
    try {
      await deleteMealItem(itemId);
      await load();
    } catch {
      setError("Couldn't delete that meal — try again.");
    } finally {
      setBusyId(null);
    }
  }

  async function handleSaveEdit(item: FoodItem) {
    if (!editingItem) return;
    setBusyId(editingItem.id);
    try {
      await updateMealItem(editingItem.id, item);
      setEditingItem(null);
      await load();
    } catch {
      setError("Couldn't save that change — try again.");
    } finally {
      setBusyId(null);
    }
  }

  const totalDays = dailyTotals.length || 1;
  const avgCalories = Math.round(dailyTotals.reduce((sum, d) => sum + d.calories, 0) / totalDays);
  const avgProtein = Math.round(dailyTotals.reduce((sum, d) => sum + d.protein, 0) / totalDays);

  const chartData = dailyTotals.map((d) => ({ value: d.calories, label: formatDateLabel(d.date) }));
  const chartData2 = dailyTotals.map((d) => ({ value: d.protein }));

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
      <Text style={{ fontSize: 30, fontWeight: "700", color: colors.foreground, letterSpacing: -0.5 }}>History</Text>

      {error && <ErrorBanner message={error} onRetry={load} />}

      <View style={{ flexDirection: "row", gap: 8 }}>
        {RANGES.map((r) => {
          const active = range === r.days;
          return (
            <Pressable
              key={r.days}
              onPress={() => setRange(r.days)}
              style={{
                paddingHorizontal: 14,
                paddingVertical: 8,
                borderRadius: 999,
                backgroundColor: active ? colors.primary : colors.surfaceMuted,
              }}
            >
              <Text style={{ fontSize: 13, fontWeight: "600", color: active ? colors.onPrimary : colors.mutedForeground }}>
                {r.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <View style={{ flexDirection: "row", gap: 10 }}>
        <View style={{ flex: 1, backgroundColor: colors.surfaceMuted, borderRadius: 14, padding: 12 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
            <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: colors.primary }} />
            <Text style={{ fontSize: 12, color: colors.mutedForeground }}>Avg calories / day</Text>
          </View>
          <Text style={{ fontSize: 20, fontWeight: "700", color: colors.foreground, marginTop: 4 }}>{avgCalories || 0}</Text>
        </View>
        <View style={{ flex: 1, backgroundColor: colors.surfaceMuted, borderRadius: 14, padding: 12 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
            <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: colors.accentTerracotta }} />
            <Text style={{ fontSize: 12, color: colors.mutedForeground }}>Avg protein / day</Text>
          </View>
          <Text style={{ fontSize: 20, fontWeight: "700", color: colors.foreground, marginTop: 4 }}>{avgProtein || 0}g</Text>
        </View>
      </View>

      {chartData.length > 0 && (
        <Card level={2}>
          <LineChart
            data={chartData}
            data2={chartData2}
            height={160}
            color={colors.primary}
            color2={colors.accentTerracotta}
            thickness={2.5}
            curved
            areaChart
            areaChart2
            startFillColor={colors.primary}
            endFillColor={colors.primary}
            startOpacity={0.25}
            endOpacity={0}
            startFillColor2={colors.accentTerracotta}
            endFillColor2={colors.accentTerracotta}
            startOpacity2={0.2}
            endOpacity2={0}
            hideDataPoints
            hideRules
            yAxisColor={colors.border}
            xAxisColor={colors.border}
            yAxisTextStyle={{ color: colors.mutedForeground, fontSize: 10 }}
            xAxisLabelTextStyle={{ color: colors.mutedForeground, fontSize: 10 }}
            adjustToWidth
            initialSpacing={12}
            endSpacing={12}
          />
          <View style={{ flexDirection: "row", justifyContent: "center", gap: 16, marginTop: 8 }}>
            <Legend color={colors.primary} label="Calories" textColor={colors.mutedForeground} />
            <Legend color={colors.accentTerracotta} label="Protein" textColor={colors.mutedForeground} />
          </View>
        </Card>
      )}

      <View style={{ gap: 10 }}>
        <Text style={{ fontSize: 13, fontWeight: "600", color: colors.mutedForeground }}>Logged meals</Text>
        {loggedDays.length === 0 && (
          <View style={{ borderWidth: 1, borderStyle: "dashed", borderColor: colors.border, borderRadius: 14, padding: 20, alignItems: "center" }}>
            <Text style={{ fontSize: 13, color: colors.mutedForeground }}>No meals logged in this range yet.</Text>
          </View>
        )}
        {loggedDays.map((day) => (
          <View key={day.date} style={{ gap: 8 }}>
            <Text style={{ fontSize: 12, fontWeight: "600", color: colors.mutedForeground }}>{formatDateLabel(day.date)}</Text>
            {day.items.map((item) => (
              <Pressable
                key={item.id}
                onPress={() => setEditingItem(item)}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 10,
                  backgroundColor: colors.surfaceMuted,
                  borderRadius: 14,
                  padding: 12,
                }}
              >
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 14, fontWeight: "600", color: colors.foreground }}>{item.name}</Text>
                  <Text style={{ fontSize: 12, color: colors.mutedForeground, marginTop: 2 }}>
                    {item.portionGrams}g · {item.calories} kcal · P{item.proteinGrams} C{item.carbsGrams} F{item.fatGrams}
                  </Text>
                </View>
                <Pressable
                  onPress={() => handleDelete(item.id)}
                  disabled={busyId === item.id}
                  hitSlop={8}
                  style={{ opacity: busyId === item.id ? 0.4 : 1 }}
                >
                  <Ionicons name="trash-outline" size={18} color={colors.mutedForeground} />
                </Pressable>
              </Pressable>
            ))}
          </View>
        ))}
      </View>

      <EditMealModal
        item={editingItem}
        onClose={() => setEditingItem(null)}
        onSave={handleSaveEdit}
        saving={busyId === editingItem?.id}
      />
    </Screen>
  );
}

function Legend({ color, label, textColor }: { color: string; label: string; textColor: string }) {
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
      <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: color }} />
      <Text style={{ fontSize: 12, color: textColor }}>{label}</Text>
    </View>
  );
}
