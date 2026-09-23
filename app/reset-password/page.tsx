// app/reset-password/page.tsx
// Landing page for the password-reset email link. Supabase's client SDK
// auto-detects the recovery token in the URL and fires a PASSWORD_RECOVERY
// auth event once it's established a session from it — this page waits for
// that, then lets the user actually set a new password. The mobile app
// (app/(auth)/forgot-password.tsx there) sends users here rather than trying
// to handle the recovery token via a custom app:// deep link.
"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function ResetPasswordPage() {
  const [ready, setReady] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") setReady(true);
    });
    // Covers the case where the event already fired before this mounted.
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setReady(true);
    });
    return () => subscription.unsubscribe();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords don't match.");
      return;
    }
    setLoading(true);
    const supabase = createClient();
    const { error: updateError } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (updateError) {
      setError(updateError.message);
      return;
    }
    setDone(true);
  }

  if (done) {
    return (
      <div className="flex flex-col gap-4">
        <h2 className="text-xl font-semibold">Password updated</h2>
        <p className="text-sm text-muted-foreground">
          Your password has been changed. Go back to the AICC app and sign in with your new password.
        </p>
      </div>
    );
  }

  if (!ready) {
    return (
      <div className="flex flex-col gap-4">
        <h2 className="text-xl font-semibold">Checking your reset link…</h2>
        <p className="text-sm text-muted-foreground">
          If nothing happens after a few seconds, this link may have expired — request a new one from the app.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-xl font-semibold">Set a new password</h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <input
          type="password" placeholder="New password" required minLength={6}
          value={password} onChange={(e) => setPassword(e.target.value)}
          className="rounded-lg border px-3 py-2"
        />
        <input
          type="password" placeholder="Confirm new password" required minLength={6}
          value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
          className="rounded-lg border px-3 py-2"
        />
        {error && <p className="text-sm text-red-500">{error}</p>}
        <button type="submit" disabled={loading} className="btn-press rounded-lg bg-primary px-4 py-2 text-primary-foreground">
          {loading ? "…" : "Update password"}
        </button>
      </form>
    </div>
  );
}
