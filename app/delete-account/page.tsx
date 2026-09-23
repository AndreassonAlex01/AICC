// app/delete-account/page.tsx — public account-deletion instructions
// (Google Play's Data safety form requires a web link for this)
import type { Metadata } from "next";
import Link from "next/link";
import { ContactEmail } from "@/components/contact-email";

export const metadata: Metadata = {
  title: "Delete your account — AICC",
  description: "How to delete your AICC account and all associated data.",
};

const p = "text-sm leading-relaxed";
const list = "flex flex-col gap-1.5 pl-5 text-sm leading-relaxed";

export default function DeleteAccountPage() {
  return (
    <div className="flex flex-col gap-6">
      <h2 className="text-2xl font-semibold tracking-tight">Delete your AICC account</h2>

      <section className="flex flex-col gap-2">
        <h3 className="text-base font-semibold">In the app (recommended)</h3>
        <ol className={`${list} list-decimal`}>
          <li>Open AICC and sign in.</li>
          <li>Go to the Profile tab.</li>
          <li>Tap &ldquo;Delete account&rdquo; and confirm.</li>
        </ol>
        <p className={p}>Your account is deleted immediately and permanently.</p>
      </section>

      <section className="flex flex-col gap-2">
        <h3 className="text-base font-semibold">What gets deleted</h3>
        <ul className={`${list} list-disc`}>
          <li>Your account (email address and login).</li>
          <li>Your profile: name, height, weight, age, and calorie/macro goals.</li>
          <li>Every meal and food item you logged.</li>
          <li>Your AI weekly summaries.</li>
        </ul>
        <p className={p}>
          Meal photos are never stored by us, so there is nothing to delete there. Residual copies in provider backups are
          removed on their normal backup cycle.
        </p>
      </section>

      <section className="flex flex-col gap-2">
        <h3 className="text-base font-semibold">Can&rsquo;t sign in, or no longer have the app?</h3>
        <p className={p}>
          Send an email to <ContactEmail />, from the address your account was created with, with the subject
          &ldquo;Delete my AICC account&rdquo;. We will delete your account and data within 30 days.
        </p>
      </section>

      <p className="text-xs text-muted-foreground">
        See also our{" "}
        <Link href="/privacy" className="underline">
          Privacy Policy
        </Link>
        .
      </p>
    </div>
  );
}
