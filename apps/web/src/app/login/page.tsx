'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { SiteHeader, SiteFooter } from '@/components/site-chrome';
import { AuthLayout, FormField, Input, Button } from '@/components/ui';
import { signIn } from '@/lib/auth-client';

/**
 * /login - 登录页 (接 Better Auth)
 */
export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const email = String(formData.get('email') || '');
    const password = String(formData.get('password') || '');
    const result = await signIn(email, password);
    setLoading(false);
    if (result.error) {
      setError(result.error.message || '登录失败,请检查邮箱和密码');
    } else {
      router.push('/account');
      router.refresh();
    }
  };

  return (
    <>
      <SiteHeader />
      <AuthLayout
        title="Welcome Back"
        subtitle="Sign in to track orders and save your favorites."
        footer={
          <>
            New to Nara Charm?{' '}
            <Link href="/register" className="text-brand hover:underline">Create an account</Link>
          </>
        }
      >
        {error && (
          <div className="mb-4 rounded-md border border-brand/30 bg-brand/10 px-4 py-2.5 text-sm text-brand">
            {error}
          </div>
        )}
        <form className="space-y-4" onSubmit={handleSubmit}>
          <FormField label="Email" htmlFor="email" required>
            <Input id="email" name="email" type="email" autoComplete="email" required placeholder="your@email.com" />
          </FormField>
          <FormField label="Password" htmlFor="password" required hint="At least 8 characters.">
            <Input id="password" name="password" type="password" autoComplete="current-password" required placeholder="••••••••" />
          </FormField>
          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center gap-2 text-muted">
              <input type="checkbox" name="remember" className="rounded border-border" />
              Remember me
            </label>
            <Link href="/forgot-password" className="text-brand hover:underline">Forgot password?</Link>
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Signing in…' : 'Sign In'}
          </Button>
        </form>
      </AuthLayout>
      <SiteFooter />
    </>
  );
}
