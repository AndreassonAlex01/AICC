// components/contact-email.tsx
// Set NEXT_PUBLIC_CONTACT_EMAIL to show a mailto link on the legal pages.
// Without it the pages point at the developer contact email that Google Play
// already requires (and publicly shows) on the store listing, so no personal
// address is ever hard-coded into the repo.
export function ContactEmail() {
  const email = process.env.NEXT_PUBLIC_CONTACT_EMAIL;
  if (!email) {
    return <>the developer contact email listed on the AICC page in the Google Play Store</>;
  }
  return (
    <a href={`mailto:${email}`} className="underline">
      {email}
    </a>
  );
}
