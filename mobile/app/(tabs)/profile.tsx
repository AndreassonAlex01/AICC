// app/(tabs)/profile.tsx — shows the signed-in user's name + goals (bug #4)
import { useCallback, useEffect, useState } from "react";
import { Pressable, Text, View } from "react-native";
import { router } from "expo-router";
import { Card } from "@/components/Card";
import { ErrorBanner } from "@/components/ErrorBanner";
import { PrimaryButton } from "@/components/PrimaryButton";
import { Screen } from "@/components/Screen";
import { authedFetch } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import { useLogDraft } from "@/store/logDraft";
import { useTheme } from "@/theme/tokens";

interface Goals {
  daily_calorie_goal: number;
  daily_protein_goal: number;
  daily_carbs_goal: number;
  daily_fat_goal: number;
}

export default function ProfileScreen() {
  const { colors } = useTheme();
  const { user } = useAuth();
  const [goals, setGoals] = useState<Goals | null>(null);
  const [loading, setLoading] = useState(true);
  const [signingOut, setSigningOut] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Failures of button actions (sign out / delete) — unlike `error`, retrying
  // isn't "reload the goals", so these get no Retry button.
  const [actionError, setActionError] = useState<string | null>(null);

  const loadGoals = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const { data, error: fetchError } = await supabase
      .from("profiles")
      .select("daily_calorie_goal, daily_protein_goal, daily_carbs_goal, daily_fat_goal")
      .eq("id", user.id)
      .single();
    if (fetchError) {
      setError("Couldn't load your goals — check your connection.");
    } else {
      setGoals(data);
      setError(null);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    loadGoals();
  }, [loadGoals]);

  async function handleSignOut() {
    setSigningOut(true);
    setActionError(null);
    const { error: signOutError } = await supabase.auth.signOut();
    setSigningOut(false);
    if (signOutError) {
      setActionError("Couldn't sign out — try again.");
      return;
    }
    // The in-progress meal draft lives in memory for the whole app session —
    // clear it so the next account to sign in doesn't see this one's photo/items.
    useLogDraft.getState().reset();
    router.replace("/login");
  }

  // Google Play requires apps with in-app sign-up to offer in-app account
  // deletion. The server route removes the data and the auth user itself.
  async function handleDeleteAccount() {
    setDeleting(true);
    setActionError(null);
    try {
      const res = await authedFetch("/api/account", { method: "DELETE" });
      if (!res.ok) throw new Error("delete failed");
    } catch {
      setDeleting(false);
      setActionError("Couldn't delete your account — check your connection and try again.");
      return;
    }
    useLogDraft.getState().reset();
    await supabase.auth.signOut({ scope: "local" });
    setDeleting(false);
    router.replace("/login");
  }

  const displayName = (user?.user_metadata?.full_name as string | undefined)?.trim() || user?.email?.split("@")[0] || "there";

  return (
    <Screen>
      <View style={{ alignItems: "center", gap: 10, marginTop: 12 }}>
        <View
          style={{
            width: 72,
            height: 72,
            borderRadius: 36,
            backgroundColor: colors.primary,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text style={{ fontSize: 26, fontWeight: "700", color: colors.onPrimary }}>
            {displayName.charAt(0).toUpperCase()}
          </Text>
        </View>
        <View style={{ alignItems: "center" }}>
          <Text style={{ fontSize: 22, fontWeight: "700", color: colors.foreground }}>{displayName}</Text>
          <Text style={{ fontSize: 13, color: colors.mutedForeground }}>{user?.email}</Text>
        </View>
      </View>

      {error && <ErrorBanner message={error} onRetry={loadGoals} />}

      <Card level={2}>
        <Text style={{ fontSize: 13, fontWeight: "600", color: colors.mutedForeground, marginBottom: 10 }}>
          Daily goals
        </Text>
        {loading ? (
          <Text style={{ color: colors.mutedForeground, fontSize: 13 }}>Loading…</Text>
        ) : goals ? (
          <View style={{ gap: 8 }}>
            <GoalRow label="Calories" value={`${goals.daily_calorie_goal} kcal`} colors={colors} />
            <GoalRow label="Protein" value={`${goals.daily_protein_goal} g`} colors={colors} />
            <GoalRow label="Carbs" value={`${goals.daily_carbs_goal} g`} colors={colors} />
            <GoalRow label="Fat" value={`${goals.daily_fat_goal} g`} colors={colors} />
          </View>
        ) : (
          <Text style={{ color: colors.mutedForeground, fontSize: 13 }}>No goals set yet.</Text>
        )}
      </Card>

      <PrimaryButton title="Sign out" onPress={handleSignOut} loading={signingOut} variant="outline" />

      {actionError && (
        <Text style={{ color: colors.danger, fontSize: 13, textAlign: "center" }}>{actionError}</Text>
      )}

      {confirmingDelete ? (
        <Card level={1} style={{ gap: 12, borderColor: colors.danger }}>
          <Text style={{ fontSize: 15, fontWeight: "700", color: colors.foreground }}>Delete your account?</Text>
          <Text style={{ fontSize: 13, color: colors.mutedForeground, lineHeight: 19 }}>
            This permanently deletes your account, your profile, and every meal you've logged. This can't be undone.
          </Text>
          <PrimaryButton title="Yes, delete everything" variant="danger" onPress={handleDeleteAccount} loading={deleting} />
          <PrimaryButton
            title="Cancel"
            variant="outline"
            onPress={() => setConfirmingDelete(false)}
            disabled={deleting}
          />
        </Card>
      ) : (
        <Pressable onPress={() => setConfirmingDelete(true)} style={{ alignItems: "center", paddingVertical: 8 }}>
          <Text style={{ fontSize: 13, fontWeight: "600", color: colors.danger }}>Delete account</Text>
        </Pressable>
      )}
    </Screen>
  );
}

function GoalRow({ label, value, colors }: { label: string; value: string; colors: ReturnType<typeof useTheme>["colors"] }) {
  return (
    <View
      style={{
        flexDirection: "row",
        justifyContent: "space-between",
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
      }}
    >
      <Text style={{ fontSize: 14, color: colors.foreground }}>{label}</Text>
      <Text style={{ fontSize: 14, fontWeight: "600", color: colors.foreground }}>{value}</Text>
    </View>
  );
}
