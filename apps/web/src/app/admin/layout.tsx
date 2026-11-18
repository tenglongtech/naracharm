import type { Metadata } from 'next';
import { AntdProvider } from '@/components/antd-provider';

export const metadata: Metadata = { robots: { index: false, follow: false } };

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <AntdProvider>{children}</AntdProvider>;
}
