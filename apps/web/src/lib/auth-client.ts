'use client';

import { createAuthClient } from 'better-auth/client';
import { useState, useEffect, useCallback } from 'react';

/**
 * Better Auth 客户端 + React hook
 * 前端通过这个调登录/注册/登出/获取会话
 */
export const authClient = createAuthClient();

export function useSession() {
  const [session, setSession] = useState<Awaited<ReturnType<typeof authClient.getSession>> | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const s = await authClient.getSession();
      setSession(s);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { session, loading, refresh };
}

/**
 * 登录
 */
export async function signIn(email: string, password: string) {
  const result = await authClient.signIn.email({ email, password });
  return result;
}

/**
 * 注册
 */
export async function signUp(name: string, email: string, password: string) {
  const result = await authClient.signUp.email({ name, email, password });
  return result;
}

/**
 * 登出
 */
export async function signOut() {
  await authClient.signOut();
}
