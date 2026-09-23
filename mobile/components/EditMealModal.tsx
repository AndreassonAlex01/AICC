// components/EditMealModal.tsx
// The web app only ever supported deleting a logged meal item — this is the
// fix for "let me fine-tune and edit every meal in History": a full
// name/portion/macro edit, reusing the same MealItemRow the Log screen uses
// so the editing behavior (proportional macro recompute on portion change)
// is identical everywhere in the app.
import { useEffect, useState } from "react";
import { Modal, Text, View } from "react-native";
import { MealItemRow } from "@/components/MealItemRow";
import { PrimaryButton } from "@/components/PrimaryButton";
import type { LoggedMealItem } from "@/lib/meals";
import type { FoodItem } from "@/lib/types";
import { useTheme } from "@/theme/tokens";

export function EditMealModal({
  item,
  onClose,
  onSave,
  saving,
}: {
  item: LoggedMealItem | null;
  onClose: () => void;
  onSave: (item: FoodItem) => void;
  saving: boolean;
}) {
  const { colors } = useTheme();
  const [draft, setDraft] = useState<FoodItem | null>(null);

  useEffect(() => {
    if (item) {
      setDraft({
        name: item.name,
        portionGrams: item.portionGrams,
        calories: item.calories,
        proteinGrams: item.proteinGrams,
        carbsGrams: item.carbsGrams,
        fatGrams: item.fatGrams,
        confidence: item.confidence,
      });
    } else {
      setDraft(null);
    }
  }, [item]);

  return (
    <Modal visible={!!item} animationType="slide" transparent onRequestClose={onClose}>
      <View style={{ flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(0,0,0,0.4)" }}>
        <View style={{ backgroundColor: colors.background, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, gap: 16 }}>
          <Text style={{ fontSize: 20, fontWeight: "700", color: colors.foreground }}>Edit meal</Text>
          {draft && <MealItemRow item={draft} onChange={setDraft} />}
          {draft && (
            <View style={{ flexDirection: "row", gap: 8 }}>
              <View style={{ flex: 1 }}>
                <PrimaryButton title="Cancel" variant="outline" onPress={onClose} />
              </View>
              <View style={{ flex: 1 }}>
                <PrimaryButton title="Save" onPress={() => draft && onSave(draft)} loading={saving} />
              </View>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
}
