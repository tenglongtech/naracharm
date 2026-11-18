import { auth } from '@/lib/auth';
import { storefrontHeaders, storefrontPreflight, unsupportedOrigin } from '@/lib/checkout-origin';

/**
 * Better Auth API 路由 (catch-all)
 * 处理所有 /api/auth/* 请求 (登录/注册/登出/验证等)
 */
async function handleAuth(request: Request) {
  const cors = storefrontHeaders(request);
  if (unsupportedOrigin(request, cors)) return new Response(null, { status: 403, headers: cors });

  const response = await auth.handler(request);
  const headers = new Headers(response.headers);
  for (const [key, value] of cors) {
    if (key === 'vary' && headers.has('vary')) headers.append('vary', value);
    else headers.set(key, value);
  }
  return new Response(response.body, { status: response.status, statusText: response.statusText, headers });
}

export const GET = handleAuth;
export const POST = handleAuth;
export const OPTIONS = storefrontPreflight;
