// app/(auth)/login.tsx — mirrors the web app's app/login/page.tsx logic
import { useState } from "react";
import { Pressable, Text, View } from "react-native";
import { router } from "expo-router";
import { Card } from "@/components/Card";
import { PrimaryButton } from "@/components/PrimaryButton";
import { Screen } from "@/components/Screen";
import { TextField } from "@/components/TextField";
import { supabase } from "@/lib/supabase";
import { useTheme } from "@/theme/tokens";

export default function LoginScreen() {
  const { colors } = useTheme();
  const [mode, setMode] = useState<"signUp" | "signIn">("signUp");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    setError(null);
    setLoading(true);

    const { data: authData, error: authError } =
      mode === "signUp"
        ? await supabase.auth.signUp({ email, password })
        : await supabase.auth.signInWithPassword({ email, password });

    if (authError) {
      setLoading(false);
      setError(authError.message);
      return;
    }

    const userId = authData.user?.id;
    const { data: profile } = userId
      ? await supabase.from("profiles").select("id").eq("id", userId).maybeSingle()
      : { data: null };

    setLoading(false);
    router.replace(profile ? "/(tabs)" : "/onboarding");
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
          <Text style={{ fontSize: 24 }}>🍽️</Text>
        </View>
        <Text style={{ fontSize: 26, fontWeight: "700", color: colors.foreground }}>
          {mode === "signUp" ? "Create your account" : "Welcome back"}
        </Text>
        <Text style={{ fontSize: 14, color: colors.mutedForeground, textAlign: "center" }}>
          AI-powered macro tracking for every meal
        </Text>
      </View>

      <Card level={2} style={{ gap: 14, marginTop: 12 }}>
        <TextField
          label="Email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          placeholder="you@example.com"
        />
        <TextField
          label="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          placeholder="At least 6 characters"
        />
        {error && <Text style={{ color: colors.danger, fontSize: 13 }}>{error}</Text>}
        <PrimaryButton
          title={mode === "signUp" ? "Sign up" : "Sign in"}
          onPress={handleSubmit}
          loading={loading}
          disabled={!email || password.length < 6}
        />
        {mode === "signIn" && (
          <Pressable onPress={() => router.push("/forgot-password")} style={{ alignItems: "center" }}>
            <Text style={{ fontSize: 13, color: colors.mutedForeground, textDecorationLine: "underline" }}>
              Forgot password?
            </Text>
          </Pressable>
        )}
      </Card>

      <Pressable onPress={() => setMode(mode === "signUp" ? "signIn" : "signUp")} style={{ alignItems: "center" }}>
        <Text style={{ fontSize: 13, color: colors.mutedForeground, textDecorationLine: "underline" }}>
          {mode === "signUp" ? "Already have an account? Sign in" : "Need an account? Sign up"}
        </Text>
      </Pressable>
    </Screen>
  );
}
