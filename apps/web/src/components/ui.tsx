import Link from 'next/link';

/**
 * 通用 UI 组件库
 * 认证页/结账页/会员中心等表单密集页统一使用,保证视觉一致。
 * Phase 3: 接 react-hook-form + zod 后,这些组件扩展为受控组件。
 */

/** 主按钮 (实心) */
export function Button({
  children,
  variant = 'primary',
  className = '',
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'outline' | 'ghost';
}) {
  const base = 'inline-flex items-center justify-center rounded-md px-6 py-3 text-sm font-medium tracking-wide transition-all disabled:opacity-50 disabled:pointer-events-none';
  const styles = {
    primary: 'bg-brand text-bg hover:-translate-y-0.5',
    outline: 'border border-ink text-ink hover:bg-ink hover:text-bg',
    ghost: 'text-brand hover:bg-brand/10',
  }[variant];
  return (
    <button className={`${base} ${styles} ${className}`} {...props}>
      {children}
    </button>
  );
}

/** 链接式按钮 */
export function ButtonLink({
  href,
  children,
  variant = 'primary',
  className = '',
}: {
  href: string;
  children: React.ReactNode;
  variant?: 'primary' | 'outline' | 'ghost';
  className?: string;
}) {
  const base = 'inline-flex items-center justify-center rounded-md px-6 py-3 text-sm font-medium tracking-wide transition-all';
  const styles = {
    primary: 'bg-brand text-bg hover:-translate-y-0.5',
    outline: 'border border-ink text-ink hover:bg-ink hover:text-bg',
    ghost: 'text-brand hover:bg-brand/10',
  }[variant];
  return (
    <Link href={href} className={`${base} ${styles} ${className}`}>
      {children}
    </Link>
  );
}

/** 表单字段容器 (label + input + hint/error) */
export function FormField({
  label,
  htmlFor,
  children,
  hint,
  error,
  required,
}: {
  label: string;
  htmlFor: string;
  children: React.ReactNode;
  hint?: string;
  error?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label htmlFor={htmlFor} className="block text-sm font-medium text-ink">
        {label}
        {required && <span className="text-brand"> *</span>}
      </label>
      <div className="mt-1.5">{children}</div>
      {hint && !error && <p className="mt-1 text-xs text-muted">{hint}</p>}
      {error && <p className="mt-1 text-xs text-brand">{error}</p>}
    </div>
  );
}

/** 文本输入框 */
export const inputClass =
  'w-full rounded-md border border-border bg-bg px-4 py-2.5 text-sm text-ink placeholder:text-muted/60 focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand';

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={`${inputClass} ${props.className ?? ''}`} />;
}

/** 认证页布局 (居中卡片,带 logo) */
export function AuthLayout({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <main className="flex min-h-[80vh] items-center justify-center px-4 py-16">
      <div className="w-full max-w-md">
        <div className="text-center">
          <Link href="/" className="inline-flex items-center gap-2" aria-label="Nara Charm home">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mx-auto h-9 w-9 text-brand" aria-hidden="true">
              <path d="M12 21c-4 0-7-3-7-7 0 0 3-1 7 4 4-5 7-4 7-4 0 4-3 7-7 7z" />
              <path d="M12 18c-2-2-3-5-3-8 0 0 1.5-1 3 1 1.5-2 3-1 3-1 0 3-1 6-3 8z" />
              <path d="M12 10c0-3 0-5 0-7" />
            </svg>
          </Link>
          <h1 className="mt-4 font-display text-3xl">{title}</h1>
          {subtitle && <p className="mt-2 text-sm text-muted">{subtitle}</p>}
        </div>
        <div className="mt-8 rounded-lg border border-border bg-surface p-7 md:p-8">{children}</div>
        {footer && <div className="mt-6 text-center text-sm text-muted">{footer}</div>}
      </div>
    </main>
  );
}

/** 分隔线 "or" */
export function Divider({ label = 'or' }: { label?: string }) {
  return (
    <div className="my-5 flex items-center gap-3 text-xs uppercase tracking-wider text-muted">
      <span className="h-px flex-1 bg-border" />
      {label}
      <span className="h-px flex-1 bg-border" />
    </div>
  );
}
