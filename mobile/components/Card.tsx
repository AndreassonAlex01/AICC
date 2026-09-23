// components/Card.tsx
// The web app's cards were a flat border with no shadow — this adds the
// layered elevation the "too flat" feedback was asking for.
import type { ReactNode } from "react";
import { View, type ViewStyle } from "react-native";
import { elevation, useTheme } from "@/theme/tokens";

export function Card({
  children,
  style,
  level = 1,
}: {
  children: ReactNode;
  style?: ViewStyle;
  level?: 1 | 2 | 3;
}) {
  const { colors } = useTheme();
  return (
    <View
      style={[
        {
          backgroundColor: colors.surface,
          borderRadius: 18,
          padding: 16,
          borderWidth: 1,
          borderColor: colors.border,
        },
        elevation(level, colors),
        style,
      ]}
    >
      {children}
    </View>
  );
}
