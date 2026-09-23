// components/FoodSearch.tsx
import { useState } from "react";
import { Pressable, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { TextField } from "@/components/TextField";
import { FOOD_DATABASE, type FoodDatabaseEntry } from "@/lib/foodDatabase";
import type { FoodItem } from "@/lib/types";
import { useTheme } from "@/theme/tokens";

const DEFAULT_PORTION_GRAMS = 100;

export function FoodSearch({ onAdd }: { onAdd: (item: FoodItem) => void }) {
  const { colors } = useTheme();
  const [query, setQuery] = useState("");

  const results =
    query.trim().length > 0
      ? FOOD_DATABASE.filter((food) => food.name.toLowerCase().includes(query.trim().toLowerCase())).slice(0, 6)
      : [];

  function handleAdd(entry: FoodDatabaseEntry) {
    onAdd({
      name: entry.name,
      portionGrams: DEFAULT_PORTION_GRAMS,
      calories: Math.round(entry.caloriesPer100g),
      proteinGrams: entry.proteinPer100g,
      carbsGrams: entry.carbsPer100g,
      fatGrams: entry.fatPer100g,
      confidence: "high",
    });
    setQuery("");
  }

  return (
    <View style={{ gap: 8 }}>
      <TextField label="Missing something?" value={query} onChangeText={setQuery} placeholder="Search foods to add manually…" />
      {results.length > 0 && (
        <View style={{ borderRadius: 12, overflow: "hidden", borderWidth: 1, borderColor: colors.border }}>
          {results.map((entry, i) => (
            <Pressable
              key={entry.name}
              onPress={() => handleAdd(entry)}
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                paddingHorizontal: 12,
                paddingVertical: 10,
                backgroundColor: colors.surface,
                borderTopWidth: i === 0 ? 0 : 1,
                borderTopColor: colors.border,
              }}
            >
              <View>
                <Text style={{ fontSize: 14, fontWeight: "600", color: colors.foreground }}>{entry.name}</Text>
                <Text style={{ fontSize: 12, color: colors.mutedForeground }}>{entry.caloriesPer100g} kcal / 100g</Text>
              </View>
              <Ionicons name="add-circle" size={20} color={colors.primary} />
            </Pressable>
          ))}
        </View>
      )}
    </View>
  );
}
