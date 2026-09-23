// app/(tabs)/log.tsx
// Draft state (photo + items) lives in store/logDraft.ts, not local
// component state — that's the fix for "photo gets removed when switching
// tabs": this screen unmounts/remounts on tab switch same as any RN
// navigator, but the Zustand store it reads from does not.
import { useState } from "react";
import { ActivityIndicator, Image, Pressable, Text, View } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Card } from "@/components/Card";
import { FoodSearch } from "@/components/FoodSearch";
import { MealItemRow } from "@/components/MealItemRow";
import { PrimaryButton } from "@/components/PrimaryButton";
import { Screen } from "@/components/Screen";
import { authedFetch } from "@/lib/api";
import { saveMeal } from "@/lib/meals";
import { useLogDraft } from "@/store/logDraft";
import { elevation, useTheme } from "@/theme/tokens";

export default function LogScreen() {
  const { colors } = useTheme();
  const draft = useLogDraft();
  const [saving, setSaving] = useState(false);

  async function analyzePhoto(uri: string, base64: string | null | undefined) {
    draft.setPhoto(uri);
    draft.setAnalyzing(true);
    draft.setError(null);
    try {
      if (!base64) throw new Error("Couldn't read that photo — try again.");
      const res = await authedFetch("/api/analyze-meal", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ imageBase64: base64 }),
      });
      const data = await res.json();
      if (!res.ok || !data.items) {
        draft.setError(
          data.error === "Unauthorized" ? "Please sign in to log a meal." : (data.error ?? "Something went wrong analyzing that photo.")
        );
        return;
      }
      draft.setItems(data.items);
    } catch {
      draft.setError("Couldn't reach the server — check your connection and try again.");
    } finally {
      draft.setAnalyzing(false);
    }
  }

  async function handleTakePhoto() {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      draft.setError("Camera permission is needed to photograph a meal.");
      return;
    }
    const result = await ImagePicker.launchCameraAsync({ mediaTypes: ["images"], base64: true, quality: 0.6 });
    if (result.canceled) return;
    analyzePhoto(result.assets[0].uri, result.assets[0].base64);
  }

  async function handlePickFromLibrary() {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      draft.setError("Photo library permission is needed to pick a meal photo.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ["images"], base64: true, quality: 0.6 });
    if (result.canceled) return;
    analyzePhoto(result.assets[0].uri, result.assets[0].base64);
  }

  async function handleSave() {
    setSaving(true);
    try {
      await saveMeal(draft.items);
      draft.reset();
      router.replace("/(tabs)");
    } catch {
      draft.setError("Couldn't save that meal — try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Screen>
      <Text style={{ fontSize: 30, fontWeight: "700", color: colors.foreground, letterSpacing: -0.5 }}>
        Log a meal
      </Text>

      <View style={{ flexDirection: "row", gap: 10 }}>
        <CaptureButton icon="camera" label="Take photo" onPress={handleTakePhoto} disabled={draft.analyzing} />
        <CaptureButton icon="images" label="Choose photo" onPress={handlePickFromLibrary} disabled={draft.analyzing} />
      </View>

      {draft.photoUri && (
        <View style={[{ borderRadius: 18, overflow: "hidden" }, elevation(2, colors)]}>
          <Image source={{ uri: draft.photoUri }} style={{ width: "100%", height: 220, opacity: draft.analyzing ? 0.4 : 1 }} />
          {draft.analyzing && (
            <View
              style={{
                position: "absolute",
                inset: 0,
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
              }}
            >
              <ActivityIndicator size="large" color={colors.primary} />
              <View style={{ backgroundColor: colors.surface, borderRadius: 999, paddingHorizontal: 14, paddingVertical: 6 }}>
                <Text style={{ fontSize: 13, fontWeight: "600", color: colors.foreground }}>
                  AI is analyzing your photo…
                </Text>
              </View>
            </View>
          )}
        </View>
      )}

      {draft.error && <Text style={{ color: colors.danger, fontSize: 13 }}>{draft.error}</Text>}

      {draft.items.length > 0 && (
        <View style={{ gap: 8 }}>
          {draft.items.map((item, i) => (
            <MealItemRow
              key={i}
              item={item}
              onChange={(updated) => draft.updateItem(i, updated)}
              onRemove={() => draft.removeItem(i)}
            />
          ))}
        </View>
      )}

      <Card level={1}>
        <FoodSearch onAdd={draft.addItem} />
      </Card>

      {draft.items.length > 0 && (
        <PrimaryButton title="Add to today's log" onPress={handleSave} loading={saving} />
      )}
    </Screen>
  );
}

function CaptureButton({
  icon,
  label,
  onPress,
  disabled,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
  disabled?: boolean;
}) {
  const { colors } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        {
          flex: 1,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
          paddingVertical: 14,
          borderRadius: 14,
          backgroundColor: colors.accentTerracotta,
          opacity: disabled ? 0.5 : pressed ? 0.85 : 1,
        },
        elevation(1, colors),
      ]}
    >
      <Ionicons name={icon} size={18} color="#fff" />
      <Text style={{ color: "#fff", fontWeight: "700", fontSize: 14 }}>{label}</Text>
    </Pressable>
  );
}
