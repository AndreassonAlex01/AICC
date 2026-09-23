// components/Screen.tsx
import type { ReactNode } from "react";
import { ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "@/theme/tokens";

export function Screen({ children, scroll = true }: { children: ReactNode; scroll?: boolean }) {
  const { colors } = useTheme();
  return (
    <SafeAreaView edges={["top"]} style={{ flex: 1, backgroundColor: colors.background }}>
      {scroll ? (
        <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40, gap: 16 }}>
          {children}
        </ScrollView>
      ) : (
        <View style={{ flex: 1, padding: 20, gap: 16 }}>{children}</View>
      )}
    </SafeAreaView>
  );
}
