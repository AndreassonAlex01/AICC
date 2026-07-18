// lib/supabase/client.ts
import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://qhaaxqckkupsjjvopvrf.supabase.co",
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY= "sb_publishable_-7FQBhppNoOsc2IIS0I1IA_Wk1Li9s3"
  );
}

