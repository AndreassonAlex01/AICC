// lib/api.ts
// The Next.js web app's API routes stay the backend — the Anthropic key
// never ships inside the Android bundle. Point this at the deployed
// Vercel URL (or a local `next dev` for testing) via EXPO_PUBLIC_API_BASE_URL.
import { supabase } from "@/lib/supabase";

export const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL ?? "http://localhost:3000";

// The web app authenticates those routes via an SSR cookie session; the
// mobile app has no cookies, so it sends the current Supabase access token
// as a Bearer header instead (the routes were updated to accept either).
export async function authedFetch(path: string, init: RequestInit = {}) {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  return fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      ...init.headers,
      ...(session ? { Authorization: `Bearer ${session.access_token}` } : {}),
    },
  });
}
