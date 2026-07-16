// proxy.ts (at the project root, not inside app/)
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export default async function proxy(request: NextRequest) {
  const response = NextResponse.next({ request });
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL= "https://qhaaxqckkupsjjvopvrf.supabase.co/rest/v1/",
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = "sb_publishable_-7FQBhppNoOsc2IIS0I1IA_Wk1Li9s3",
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cookiesToSet) =>
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          ),
      },
    }
  );
  await supabase.auth.getUser(); // refreshes the session cookie if it's expiring
  return response;
}