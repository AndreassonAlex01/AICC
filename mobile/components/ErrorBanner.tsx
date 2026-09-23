// components/ErrorBanner.tsx
import { Pressable, Text, View } from "react-native";
import { useTheme } from "@/theme/tokens";

export function ErrorBanner({ message, onRetry }: { message: string; onRetry: () => void }) {
  const { colors } = useTheme();
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 10,
        backgroundColor: colors.dangerSoft,
        borderRadius: 12,
        padding: 12,
      }}
    >
      <Text style={{ flex: 1, fontSize: 13, color: colors.danger }}>{message}</Text>
      <Pressable onPress={onRetry} hitSlop={8}>
        <Text style={{ fontSize: 13, fontWeight: "700", color: colors.danger }}>Retry</Text>
      </Pressable>
    </View>
  );
}
