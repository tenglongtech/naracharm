import Link from 'next/link';
import type { Metadata } from 'next';
import { SiteHeader, SiteFooter } from '@/components/site-chrome';
import { AuthLayout, FormField, Input, Button } from '@/components/ui';

/**
 * /forgot-password - 忘记密码
 * Phase 4: 接 Better Auth (sendResetPassword) 后激活。
 */
export const metadata: Metadata = { title: 'Reset Password' };

export default function ForgotPasswordPage() {
  return (
    <>
      <SiteHeader />
      <AuthLayout
        title="Forgot Password"
        subtitle="Enter your email and we'll send you a reset link."
        footer={
          <>
            Remembered it?{' '}
            <Link href="/login" className="text-brand hover:underline">Back to sign in</Link>
          </>
        }
      >
        <form className="space-y-4" /* action={requestReset} Phase 4 */>
          <FormField label="Email" htmlFor="email" required>
            <Input id="email" name="email" type="email" autoComplete="email" required placeholder="your@email.com" />
          </FormField>
          <Button type="submit" className="w-full">Send Reset Link</Button>
        </form>
        <p className="mt-4 text-center text-xs text-muted">
          Check your spam folder if you don&apos;t receive an email within a few minutes.
        </p>
      </AuthLayout>
      <SiteFooter />
    </>
  );
}
