'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, Form, Input, Button, message, Typography } from 'antd';
import { signIn } from '@/lib/auth-client';

const { Title, Text } = Typography;

/**
 * /admin/login - 管理员登录页 (不走守卫)
 */
export default function AdminLoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [messageApi, msgCtx] = message.useMessage();

  const handleSubmit = async (values: { email: string; password: string }) => {
    setLoading(true);
    const result = await signIn(values.email, values.password);
    setLoading(false);
    if (result.error) {
      messageApi.error(result.error.message || '登录失败');
    } else {
      messageApi.success('登录成功');
      setTimeout(() => router.push('/admin'), 500);
    }
  };

  return (
    <>
      {msgCtx}
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#FAF7F1', padding: 24 }}>
        <Card style={{ maxWidth: 400, width: '100%' }}>
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <div style={{ fontSize: 32 }}>🪷</div>
            <Title level={3} style={{ fontFamily: 'Fraunces, serif', marginBottom: 4 }}>Nara Charm</Title>
            <Text type="secondary">后台管理系统</Text>
          </div>
          <Form layout="vertical" onFinish={handleSubmit}>
            <Form.Item label="管理员邮箱" name="email" rules={[{ required: true, type: 'email' }]}>
              <Input placeholder="admin@naracharm.com" />
            </Form.Item>
            <Form.Item label="密码" name="password" rules={[{ required: true, min: 8 }]}>
              <Input.Password placeholder="••••••••" />
            </Form.Item>
            <Button type="primary" htmlType="submit" block loading={loading}>
              登录后台
            </Button>
          </Form>
        </Card>
      </div>
    </>
  );
}
