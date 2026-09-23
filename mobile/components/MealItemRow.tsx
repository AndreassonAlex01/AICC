// components/MealItemRow.tsx
import { Pressable, Text, TextInput, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/theme/tokens";
import type { FoodItem } from "@/lib/types";

const CONFIDENCE_COLOR = { high: "#3D9A5C", medium: "#D9A441", low: "#C1443C" } as const;

export function MealItemRow({
  item,
  onChange,
  onRemove,
}: {
  item: FoodItem;
  onChange: (item: FoodItem) => void;
  onRemove?: () => void;
}) {
  const { colors } = useTheme();

  function handlePortionChange(text: string) {
    const newPortion = Number(text.replace(/[^0-9.]/g, ""));
    if (!newPortion || !item.portionGrams) {
      onChange({ ...item, portionGrams: newPortion });
      return;
    }
    const ratio = newPortion / item.portionGrams;
    onChange({
      ...item,
      portionGrams: newPortion,
      calories: Math.round(item.calories * ratio),
      proteinGrams: +(item.proteinGrams * ratio).toFixed(1),
      carbsGrams: +(item.carbsGrams * ratio).toFixed(1),
      fatGrams: +(item.fatGrams * ratio).toFixed(1),
    });
  }

  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        backgroundColor: colors.surfaceMuted,
        borderRadius: 14,
        padding: 10,
      }}
    >
      <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: CONFIDENCE_COLOR[item.confidence] }} />
      <TextInput
        value={item.name}
        onChangeText={(name) => onChange({ ...item, name })}
        style={{ flex: 1, fontSize: 14, fontWeight: "600", color: colors.foreground }}
      />
      <TextInput
        value={String(item.portionGrams)}
        onChangeText={handlePortionChange}
        keyboardType="numeric"
        style={{
          width: 48,
          fontSize: 13,
          color: colors.mutedForeground,
          textAlign: "right",
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
        }}
      />
      <Text style={{ fontSize: 11, color: colors.mutedForeground }}>g</Text>
      <Text style={{ fontSize: 13, color: colors.mutedForeground, minWidth: 56, textAlign: "right" }}>
        {item.calories} kcal
      </Text>
      {onRemove && (
        <Pressable onPress={onRemove} hitSlop={8}>
          <Ionicons name="close-circle" size={20} color={colors.mutedForeground} />
        </Pressable>
      )}
    </View>
  );
}
