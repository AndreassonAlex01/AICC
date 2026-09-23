// app/(auth)/forgot-password.tsx
// Supabase's reset email has to land somewhere with a real http(s) URL to
// process the recovery token — a custom app:// scheme deep link would need
// native intent-filter handling that can't be verified without a real
// device/build. Simpler and more robust: send the user to the web app's
// /reset-password page (see app/reset-password/page.tsx there) to actually
// set the new password, then they come back and sign in here.
import { useState } from "react";
import { Pressable, Text, View } from "react-native";
import { router } from "expo-router";
import { Card } from "@/components/Card";
import { PrimaryButton } from "@/components/PrimaryButton";
import { Screen } from "@/components/Screen";
import { TextField } from "@/components/TextField";
import { API_BASE_URL } from "@/lib/api";
import { supabase } from "@/lib/supabase";
import { useTheme } from "@/theme/tokens";

export default function ForgotPasswordScreen() {
  const { colors } = useTheme();
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit() {
    setError(null);
    setLoading(true);
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${API_BASE_URL}/reset-password`,
    });
    setLoading(false);
    if (resetError) {
      setError(resetError.message);
      return;
    }
    setSent(true);
  }

  return (
    <Screen>
      <View style={{ marginTop: 40, alignItems: "center", gap: 6 }}>
        <View
          style={{
            width: 56,
            height: 56,
            borderRadius: 18,
            backgroundColor: colors.primary,
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 8,
          }}
        >
          <Text style={{ fontSize: 24 }}>🔑</Text>
        </View>
        <Text style={{ fontSize: 26, fontWeight: "700", color: colors.foreground }}>Reset your password</Text>
        <Text style={{ fontSize: 14, color: colors.mutedForeground, textAlign: "center" }}>
          We'll email you a link to set a new one
        </Text>
      </View>

      {sent ? (
        <Card level={2} style={{ gap: 8, marginTop: 12 }}>
          <Text style={{ fontSize: 15, fontWeight: "600", color: colors.foreground }}>Check your email</Text>
          <Text style={{ fontSize: 13, color: colors.mutedForeground, lineHeight: 19 }}>
            If an account exists for {email}, a password reset link is on its way. Open it on this phone or any
            device, set a new password, then come back here and sign in.
          </Text>
        </Card>
      ) : (
        <Card level={2} style={{ gap: 14, marginTop: 12 }}>
          <TextField
            label="Email"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            placeholder="you@example.com"
          />
          {error && <Text style={{ color: colors.danger, fontSize: 13 }}>{error}</Text>}
          <PrimaryButton title="Send reset link" onPress={handleSubmit} loading={loading} disabled={!email} />
        </Card>
      )}

      <Pressable onPress={() => router.back()} style={{ alignItems: "center" }}>
        <Text style={{ fontSize: 13, color: colors.mutedForeground, textDecorationLine: "underline" }}>
          Back to sign in
        </Text>
      </Pressable>
    </Screen>
  );
}
