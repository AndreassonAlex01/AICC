// scripts/check-release-env.js
// Runs on the EAS build server before dependencies install (wired up as the
// "eas-build-pre-install" script in package.json). .env.local is gitignored,
// so EAS never sees it — the app's settings come from eas.json's "env" block
// instead. If the backend URL there is still the placeholder (or plain http /
// localhost, which release builds block or can't reach), the build would
// succeed and ship an app whose AI features silently never work. Fail loudly.
const profile = process.env.EAS_BUILD_PROFILE ?? "";
if (profile !== "preview" && profile !== "production") process.exit(0);

const url = process.env.EXPO_PUBLIC_API_BASE_URL ?? "";
const problems = [];

if (!url.startsWith("https://")) {
  problems.push(`EXPO_PUBLIC_API_BASE_URL must be an https:// URL (got "${url}").`);
}
if (url.includes("REPLACE") || /localhost|127\.0\.0\.1|192\.168\./.test(url)) {
  problems.push(`EXPO_PUBLIC_API_BASE_URL still points at a placeholder or local address ("${url}").`);
}
for (const name of ["EXPO_PUBLIC_SUPABASE_URL", "EXPO_PUBLIC_SUPABASE_ANON_KEY"]) {
  if (!process.env[name]) problems.push(`${name} is not set.`);
}

if (problems.length > 0) {
  console.error("\nRelease build blocked:\n - " + problems.join("\n - "));
  console.error("\nFix the \"env\" block in mobile/eas.json (see mobile/PLAY_STORE.md), then rebuild.\n");
  process.exit(1);
}
