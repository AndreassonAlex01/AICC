// app/privacy/page.tsx — public privacy policy (required for Google Play)
import type { Metadata } from "next";
import Link from "next/link";
import { ContactEmail } from "@/components/contact-email";

export const metadata: Metadata = {
  title: "Privacy Policy — AICC",
  description: "How AICC collects, uses, and protects your data.",
};

const LAST_UPDATED = "September 23, 2026";

const p = "text-sm leading-relaxed";
const ul = "flex list-disc flex-col gap-1.5 pl-5 text-sm leading-relaxed";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-2">
      <h3 className="text-base font-semibold">{title}</h3>
      {children}
    </section>
  );
}

export default function PrivacyPolicyPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Privacy Policy</h2>
        <p className="mt-1 text-xs text-muted-foreground">Last updated: {LAST_UPDATED}</p>
      </div>

      <p className={p}>
        AICC (&ldquo;we&rdquo;, &ldquo;us&rdquo;) is a meal and macro tracking app. You can photograph a meal, get an AI
        estimate of its calories and macronutrients, and keep a history of what you eat. This policy explains what the
        AICC mobile app and website collect, how that information is used, and the choices you have.
      </p>

      <Section title="1. Information we collect">
        <ul className={ul}>
          <li>
            <strong>Account information:</strong> your email address, a password (stored only in hashed form by our
            authentication provider), and the display name you choose.
          </li>
          <li>
            <strong>Profile information you enter during setup:</strong> height, weight, age, sex, activity level, and
            weight goal. We use it to calculate your daily calorie and macronutrient targets. Because this relates to your
            health, we treat it as sensitive.
          </li>
          <li>
            <strong>Meal logs:</strong> the foods you log, portion sizes, estimated calories, protein, carbs and fat, and
            when you logged them.
          </li>
          <li>
            <strong>Meal photos:</strong> when you take or pick a photo to analyze, it is sent to our server and on to our
            AI provider to identify the food. We do not save the photo to our database or servers.
          </li>
          <li>
            <strong>AI weekly summary:</strong> a short sentence generated from your last seven days of calorie and protein
            totals is stored so it can be shown again without being regenerated.
          </li>
        </ul>
        <p className={p}>
          We do not collect your precise location, contacts, or advertising identifiers, and the app contains no
          advertising or third-party analytics SDKs.
        </p>
      </Section>

      <Section title="2. How we use your information">
        <ul className={ul}>
          <li>To provide the app: meal logging, history, charts, and your daily goals.</li>
          <li>To authenticate you and keep your account secure.</li>
          <li>To generate AI estimates from your photos and your weekly summary.</li>
        </ul>
        <p className={p}>We do not sell your data and we do not use it for advertising.</p>
      </Section>

      <Section title="3. Who processes your data">
        <ul className={ul}>
          <li>
            <strong>Supabase</strong> — authentication and database storage for your account, profile and meal data.
          </li>
          <li>
            <strong>Anthropic</strong> — receives meal photos for analysis and, for the weekly summary, your recent daily
            calorie and protein totals. It does not receive your name or email address. Anthropic processes this under its
            own terms and privacy policy.
          </li>
          <li>
            <strong>Our hosting provider</strong> — runs the server that relays requests between the app and the services
            above.
          </li>
        </ul>
        <p className={p}>
          These providers act on our behalf to run the app. We do not sell or rent your personal information, and we may
          disclose it only if the law requires.
        </p>
      </Section>

      <Section title="4. Consent for health-related information">
        <p className={p}>
          Some of what you enter relates to your health. We process it only to provide the app&rsquo;s features, based on
          the consent you give by entering it. You can withdraw that consent at any time by deleting your account (see
          below).
        </p>
      </Section>

      <Section title="5. Retention and deletion">
        <p className={p}>
          We keep your data while your account exists. You can delete your account at any time inside the app (Profile
          &rarr; Delete account), which permanently deletes your account, profile, meal logs and weekly summaries. You can
          also request deletion by contacting us &mdash; see{" "}
          <Link href="/delete-account" className="underline">
            how to delete your account
          </Link>
          . Residual copies in backups are removed on our providers&rsquo; normal backup cycle.
        </p>
      </Section>

      <Section title="6. Security">
        <p className={p}>
          Data is encrypted in transit using HTTPS. No method of transmission or storage is perfectly secure, so we cannot
          guarantee absolute security.
        </p>
      </Section>

      <Section title="7. Not medical advice">
        <p className={p}>
          Calorie and macro figures, including AI estimates from photos, are approximations and can be wrong. AICC is not a
          medical device and does not provide medical advice. Talk to a qualified professional before making health or
          diet decisions.
        </p>
      </Section>

      <Section title="8. Age">
        <p className={p}>
          AICC is intended for people aged 18 or older. We do not knowingly collect data from anyone under 18. If you
          believe a minor has created an account, contact us and we will delete it.
        </p>
      </Section>

      <Section title="9. Your rights">
        <p className={p}>
          You can edit or delete individual meals in the History tab and delete your account at any time. Depending on where
          you live (for example under the EU GDPR) you may also have the right to access, correct, export or erase your
          data, to restrict or object to processing, and to lodge a complaint with your data protection authority. Contact
          us to exercise these rights.
        </p>
      </Section>

      <Section title="10. Changes to this policy">
        <p className={p}>
          We may update this policy from time to time. The &ldquo;Last updated&rdquo; date above shows the latest version.
        </p>
      </Section>

      <Section title="11. Contact">
        <p className={p}>
          Questions or requests about your data: <ContactEmail />.
        </p>
      </Section>
    </div>
  );
}
