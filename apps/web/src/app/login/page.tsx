import Link from 'next/link';
import type { Metadata } from 'next';
import { SiteHeader, SiteFooter } from '@/components/site-chrome';
import { AuthLayout, FormField, Input, Button, Divider } from '@/components/ui';

/**
 * /login - 登录页
 * Phase 4: 接 Better Auth (signInEmail) 后激活真实登录逻辑。
 * 当前为 UI 占位,提交暂不处理。
 */
export const metadata: Metadata = { title: 'Sign In' };

export default function LoginPage() {
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
        {/* 社交登录占位 (Phase 4 接 Better Auth socialProviders) */}
        <div className="grid grid-cols-2 gap-3">
          <Button variant="outline" type="button">Google</Button>
          <Button variant="outline" type="button">Apple</Button>
        </div>
        <Divider />

        {/* 邮箱密码表单 */}
        <form className="space-y-4" /* action={signIn} Phase 4 */>
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
          <Button type="submit" className="w-full">Sign In</Button>
        </form>
      </AuthLayout>
      <SiteFooter />
    </>
  );
}
