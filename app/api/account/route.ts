// app/api/account/route.ts
// Permanently deletes the signed-in user's account and all of their data.
// Google Play requires in-app account deletion for any app with in-app
// sign-up. Deleting an auth user is an admin-only operation, hence the
// service-role client. Data rows go first and the auth user last, so a
// failure partway through leaves a retryable account rather than orphaned
// data with no owner to ask for its deletion.
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getBearerToken } from "@/lib/apiAuth";

export async function DELETE(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser(getBearerToken(req));
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json({ error: "Account deletion is not configured" }, { status: 503 });
  }

  const admin = createAdminClient();
  const fail = () => NextResponse.json({ error: "Failed to delete account" }, { status: 500 });

  const { data: meals, error: mealsError } = await admin.from("meals").select("id").eq("user_id", user.id);
  if (mealsError) return fail();

  const mealIds = (meals ?? []).map((m) => m.id);
  if (mealIds.length > 0) {
    const { error } = await admin.from("meal_items").delete().in("meal_id", mealIds);
    if (error) return fail();
  }

  const deleteSteps = [
    () => admin.from("meals").delete().eq("user_id", user.id),
    () => admin.from("weekly_summaries").delete().eq("user_id", user.id),
    () => admin.from("profiles").delete().eq("id", user.id),
  ];
  for (const step of deleteSteps) {
    const { error } = await step();
    if (error) return fail();
  }

  const { error: authError } = await admin.auth.admin.deleteUser(user.id);
  if (authError) return fail();

  return NextResponse.json({ ok: true });
}
