'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { SiteHeader, SiteFooter } from '@/components/site-chrome';
import { AuthLayout, FormField, Input, Button } from '@/components/ui';
import { signUp } from '@/lib/auth-client';

/**
 * /register - 注册页 (接 Better Auth)
 */
export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const firstName = String(formData.get('firstName') || '');
    const lastName = String(formData.get('lastName') || '');
    const email = String(formData.get('email') || '');
    const password = String(formData.get('password') || '');

    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      setLoading(false);
      return;
    }

    const result = await signUp(`${firstName} ${lastName}`.trim(), email, password);
    setLoading(false);
    if (result.error) {
      setError(result.error.message || 'Registration failed');
    } else {
      router.push('/account');
      router.refresh();
    }
  };

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
        {error && (
          <div className="mb-4 rounded-md border border-brand/30 bg-brand/10 px-4 py-2.5 text-sm text-brand">
            {error}
          </div>
        )}
        <form className="space-y-4" onSubmit={handleSubmit}>
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
          <FormField label="Password" htmlFor="password" required hint="At least 8 characters.">
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
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Creating…' : 'Create Account'}
          </Button>
        </form>
      </AuthLayout>
      <SiteFooter />
    </>
  );
}
