// components/PrimaryButton.tsx
import { ActivityIndicator, Pressable, Text } from "react-native";
import { elevation, useTheme } from "@/theme/tokens";

export function PrimaryButton({
  title,
  onPress,
  loading,
  disabled,
  variant = "primary",
}: {
  title: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  variant?: "primary" | "outline" | "danger";
}) {
  const { colors } = useTheme();
  const filled = variant !== "outline";
  const backgroundColor = variant === "primary" ? colors.primary : variant === "danger" ? colors.danger : "transparent";
  const textColor = variant === "primary" ? colors.onPrimary : variant === "danger" ? "#FFFFFF" : colors.foreground;
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        {
          borderRadius: 14,
          paddingVertical: 14,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor,
          borderWidth: filled ? 0 : 1,
          borderColor: colors.border,
          opacity: disabled || loading ? 0.6 : pressed ? 0.85 : 1,
          transform: [{ scale: pressed ? 0.98 : 1 }],
        },
        filled ? elevation(2, colors) : null,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={textColor} />
      ) : (
        <Text style={{ fontSize: 15, fontWeight: "700", color: textColor }}>{title}</Text>
      )}
    </Pressable>
  );
}
