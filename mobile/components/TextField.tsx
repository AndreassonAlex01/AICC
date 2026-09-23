// components/TextField.tsx
import { Text, TextInput, View, type TextInputProps } from "react-native";
import { useTheme } from "@/theme/tokens";

export function TextField({
  label,
  ...props
}: TextInputProps & { label: string }) {
  const { colors } = useTheme();
  return (
    <View style={{ gap: 6 }}>
      <Text style={{ fontSize: 13, fontWeight: "600", color: colors.mutedForeground }}>{label}</Text>
      <TextInput
        placeholderTextColor={colors.mutedForeground}
        style={{
          borderWidth: 1,
          borderColor: colors.border,
          backgroundColor: colors.surfaceMuted,
          borderRadius: 12,
          paddingHorizontal: 14,
          paddingVertical: 12,
          fontSize: 15,
          color: colors.foreground,
        }}
        {...props}
      />
    </View>
  );
}
