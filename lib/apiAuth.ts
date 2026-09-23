// lib/apiAuth.ts
import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { createAdminClient } from "@/lib/supabase/admin";

export async function requireApiKey(req: NextRequest) {
  const key = req.headers.get("x-api-key");
  if (!key) return NextResponse.json({ error: "Missing API key" }, { status: 401 });

  const hashedKey = crypto.createHash("sha256").update(key).digest("hex");
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("api_keys")
    .select("partner_id, active")
    .eq("hashed_key", hashedKey)
    .single();

  if (!data?.active) return NextResponse.json({ error: "Invalid API key" }, { status: 401 });
  return null; // null means "passed, continue"
}

// The web app authenticates via the SSR cookie session; the mobile app has
// no cookies and sends its Supabase access token as a Bearer header instead.
// supabase.auth.getUser(jwt?) validates either — pass this through so one
// route handler serves both clients.
export function getBearerToken(req: NextRequest): string | undefined {
  const header = req.headers.get("authorization");
  return header?.startsWith("Bearer ") ? header.slice(7) : undefined;
}