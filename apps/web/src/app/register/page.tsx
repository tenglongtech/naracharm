import Link from 'next/link';
import type { Metadata } from 'next';
import { SiteHeader, SiteFooter } from '@/components/site-chrome';
import { AuthLayout, FormField, Input, Button, Divider } from '@/components/ui';

/**
 * /register - 注册页
 * Phase 4: 接 Better Auth (signUpEmail) 后激活真实注册。
 */
export const metadata: Metadata = { title: 'Create Account' };

export default function RegisterPage() {
  return (
    <>
      <SiteHeader />
      <AuthLayout
        title="Create Your Account"
        subtitle="Join to track orders, save favorites, and get 10% off your first charm."
        footer={
          <>
            Already have an account?{' '}
            <Link href="/login" className="text-brand hover:underline">Sign in</Link>
          </>
        }
      >
        <div className="grid grid-cols-2 gap-3">
          <Button variant="outline" type="button">Google</Button>
          <Button variant="outline" type="button">Apple</Button>
        </div>
        <Divider />

        <form className="space-y-4" /* action={signUp} Phase 4 */>
          <div className="grid grid-cols-2 gap-3">
            <FormField label="First Name" htmlFor="firstName" required>
              <Input id="firstName" name="firstName" autoComplete="given-name" required placeholder="Emma" />
            </FormField>
            <FormField label="Last Name" htmlFor="lastName" required>
              <Input id="lastName" name="lastName" autoComplete="family-name" required placeholder="Rivera" />
            </FormField>
          </div>
          <FormField label="Email" htmlFor="email" required>
            <Input id="email" name="email" type="email" autoComplete="email" required placeholder="your@email.com" />
          </FormField>
          <FormField label="Password" htmlFor="password" required hint="At least 8 characters, with a number.">
            <Input id="password" name="password" type="password" autoComplete="new-password" required placeholder="••••••••" />
          </FormField>
          <label className="flex items-start gap-2 text-sm text-muted">
            <input type="checkbox" name="agree" required className="mt-1 rounded border-border" />
            <span>
              I agree to the{' '}
              <Link href="/terms" className="text-brand hover:underline">Terms</Link> and{' '}
              <Link href="/privacy" className="text-brand hover:underline">Privacy Policy</Link>.
            </span>
          </label>
          <Button type="submit" className="w-full">Create Account</Button>
        </form>
      </AuthLayout>
      <SiteFooter />
    </>
  );
}
