import { redirect } from 'next/navigation';
import type { Metadata } from 'next';
import { getSession } from '@/lib/auth';
import { AdminShell } from '@/components/admin-shell';

/**
 * 后台布局 (server component)
 * 守卫: 未登录 → 跳 /admin/login; 非 admin → 显示无权限
 * SEO: 完全屏蔽搜索引擎 (noindex + nofollow)
 */
export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: {
      index: false,
      follow: false,
    },
  },
};
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();

  if (!session) {
    redirect('/admin/login');
  }

  if ((session.user as { role?: string }).role !== 'admin') {
    return (
      <div style={{ padding: 80, textAlign: 'center', fontFamily: 'Inter, sans-serif' }}>
        <h2>无权限访问</h2>
        <p style={{ color: '#999' }}>你的账号不是管理员。请联系管理员授权。</p>
        <a href="/" style={{ color: '#C4745A' }}>返回首页</a>
      </div>
    );
  }

  return <AdminShell adminName={session.user.name}>{children}</AdminShell>;
}
