import { auth } from '@/lib/auth';
import { toNextJsHandler } from 'better-auth/next-js';

/**
 * Better Auth API 路由 (catch-all)
 * 处理所有 /api/auth/* 请求 (登录/注册/登出/验证等)
 */
export const { GET, POST } = toNextJsHandler(auth);
