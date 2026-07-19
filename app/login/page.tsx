// app/login/page.tsx
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"signUp" | "signIn">("signUp");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const supabase = createClient();
    const { error } =
      mode === "signUp"
        ? await supabase.auth.signUp({ email, password })
        : await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    router.push("/onboarding"); // Step 4's page — new users set their goals right after this
  }

  return (
    <div className="animate-page-in flex flex-col gap-4">
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
        <button type="submit" disabled={loading} className="rounded-lg bg-primary px-4 py-2 text-primary-foreground">
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