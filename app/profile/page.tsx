// app/profile/page.tsx
"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function ProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<{ daily_calorie_goal: number; daily_protein_goal: number } | null>(null);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }
      const { data } = await supabase
        .from("profiles")
        .select("daily_calorie_goal, daily_protein_goal")
        .eq("id", user.id)
        .single();
      setProfile(data);
      setLoading(false);
    }
    load();
  }, [router]);

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  }

  if (loading) return <p className="text-sm text-muted-foreground">Loading…</p>;

  return (
    <div className="animate-page-in flex flex-col gap-4">
      <h2 className="text-xl font-semibold">Profile</h2>
      {profile && (
        <div className="rounded-lg border p-4 text-sm">
          <p>Daily calorie goal: {profile.daily_calorie_goal} kcal</p>
          <p>Protein goal: {profile.daily_protein_goal} g</p>
        </div>
      )}
      <button onClick={handleSignOut} className="btn-press rounded-lg bg-primary px-4 py-2 text-primary-foreground">
        Sign out
      </button>
    </div>
  );
}