// app/login/page.tsx
"use client";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [mode, setMode] = useState<"signUp" | "signIn">(
    searchParams.get("mode") === "signIn" ? "signIn" : "signUp"
  );
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
  e.preventDefault();
  setError(null);
  setLoading(true);
  const supabase = createClient();
  const { data: authData, error } =
    mode === "signUp"
      ? await supabase.auth.signUp({ email, password })
      : await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    setLoading(false);
    setError(error.message);
    return;
  }
  // test test hellooooo
  // A returning user already has a profile saved from a previous onboarding —
  // send them straight to the dashboard instead of making them retype everything.
  // Only someone with no profile row yet (a brand-new signup) goes to /onboarding.
  const userId = authData.user?.id;
  const { data: profile } = userId
    ? await supabase.from("profiles").select("id").eq("id", userId).maybeSingle()
    : { data: null };

  setLoading(false);
  router.push(profile ? "/" : "/onboarding");
}

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-xl font-semibold">{mode === "signUp" ? "Create account" : "Sign in"}</h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <input
          type="email" placeholder="Email" required
          value={email} onChange={(e) => setEmail(e.target.value)}
          className="rounded-lg border px-3 py-2"
        />
        <input
          type="password" placeholder="Password" required minLength={6}
          value={password} onChange={(e) => setPassword(e.target.value)}
          className="rounded-lg border px-3 py-2"
        />
        {error && <p className="text-sm text-red-500">{error}</p>}
        <button type="submit" disabled={loading} className="btn-press rounded-lg bg-primary px-4 py-2 text-primary-foreground">
  {loading ? "…" : mode === "signUp" ? "Sign up" : "Sign in"}
</button>
      </form>
      <button
        onClick={() => setMode(mode === "signUp" ? "signIn" : "signUp")}
        className="text-sm text-muted-foreground underline"
      >
        {mode === "signUp" ? "Already have an account? Sign in" : "Need an account? Sign up"}
      </button>
    </div>
  );
}