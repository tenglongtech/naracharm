'use client';

import React, { useState } from 'react';
import { Layout, Menu, theme, Avatar, Dropdown, Badge } from 'antd';
import {
  DashboardOutlined,
  ShoppingOutlined,
  ShoppingCartOutlined,
  TeamOutlined,
  AppstoreOutlined,
  GiftOutlined,
  BellOutlined,
  UserOutlined,
  LogoutOutlined,
  ExportOutlined,
} from '@ant-design/icons';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { signOut } from '@/lib/auth-client';

const { Header, Sider, Content } = Layout;

const MENU_ITEMS = [
  { key: '/admin', icon: <DashboardOutlined />, label: <Link href="/admin">仪表盘</Link> },
  { key: '/admin/products', icon: <ShoppingOutlined />, label: <Link href="/admin/products">商品管理</Link> },
  { key: '/admin/orders', icon: <ShoppingCartOutlined />, label: <Link href="/admin/orders">订单管理</Link> },
  { key: '/admin/customers', icon: <TeamOutlined />, label: <Link href="/admin/customers">顾客管理</Link> },
  { key: '/admin/collections', icon: <AppstoreOutlined />, label: <Link href="/admin/collections">系列管理</Link> },
  { key: '/admin/discounts', icon: <GiftOutlined />, label: <Link href="/admin/discounts">优惠券</Link> },
];

/**
 * 后台 UI 外壳 (client,antd 交互)
 * 由 admin/layout.tsx (server) 在登录守卫后渲染
 */
export function AdminShell({ children, adminName }: { children: React.ReactNode; adminName: string }) {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { token } = theme.useToken();

  const selectedKey = MENU_ITEMS
    .filter((m) => pathname === m.key || pathname.startsWith(m.key + '/'))
    .sort((a, b) => b.key.length - a.key.length)[0]?.key || '/admin';

  const handleLogout = async () => {
    await signOut();
    router.push('/admin/login');
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        theme="light"
        style={{ borderRight: `1px solid ${token.colorBorderSecondary}` }}
      >
        <div
          style={{
            height: 56,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            borderBottom: `1px solid ${token.colorBorderSecondary}`,
          }}
        >
          <span style={{ fontSize: 22 }}>🪷</span>
          {!collapsed && (
            <span style={{ fontFamily: 'Fraunces, serif', fontSize: 18, fontWeight: 600, color: token.colorPrimary }}>
              Nara Charm
            </span>
          )}
        </div>
        <Menu mode="inline" selectedKeys={[selectedKey]} items={MENU_ITEMS} style={{ borderRight: 0, marginTop: 8 }} />
      </Sider>

      <Layout>
        <Header
          style={{
            background: token.colorBgContainer,
            padding: '0 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: `1px solid ${token.colorBorderSecondary}`,
          }}
        >
          <span style={{ color: token.colorTextSecondary, fontSize: 13 }}>
            后台管理系统 · {adminName}
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <Badge count={0} showZero={false}>
              <BellOutlined style={{ fontSize: 18 }} />
            </Badge>
            <Link href="/" target="_blank">
              <ExportOutlined style={{ fontSize: 16 }} />
            </Link>
            <Dropdown
              menu={{
                items: [
                  { key: 'logout', icon: <LogoutOutlined />, label: '退出登录', danger: true },
                ],
                onClick: ({ key }) => key === 'logout' && handleLogout(),
              }}
            >
              <Avatar style={{ backgroundColor: token.colorPrimary }} icon={<UserOutlined />} size="small" />
            </Dropdown>
          </div>
        </Header>
        <Content style={{ margin: 0, padding: 24, background: '#FAF7F1', overflow: 'auto' }}>
          {children}
        </Content>
      </Layout>
    </Layout>
  );
}
