import Link from 'next/link';
import type { Metadata } from 'next';
import { SiteHeader, SiteFooter } from '@/components/site-chrome';
import { AuthLayout } from '@/components/ui';

export const metadata: Metadata = { title: 'Account recovery' };

export default function ForgotPasswordPage() {
  return (
    <>
      <SiteHeader />
      <AuthLayout
        title="Account recovery"
        subtitle="Contact us if you need help getting back into your account."
        footer={<Link href="/login" className="text-brand underline underline-offset-4">Back to sign in</Link>}
      >
        <p className="text-sm leading-6 text-muted">Use the email address associated with your account when you get in touch.</p>
        <Link href="/contact" className="shop-button mt-5">Contact support ↗</Link>
      </AuthLayout>
      <SiteFooter />
    </>
  );
}
