/**
 * 后端 API 基础配置
 *
 * 静态前端调用独立后端 (Contabo) 的 API。
 * 生产: NEXT_PUBLIC_API_URL=https://api.naracharm.com
 * 本地: 默认同源 (Vercel/Next dev)
 */
export const API_URL =
  process.env.NEXT_PUBLIC_API_URL || '';

/** 带 baseURL 的 fetch (跨源时携带 cookie) */
export async function apiFetch(
  path: string,
  init?: RequestInit,
): Promise<Response> {
  const url = API_URL ? `${API_URL}${path}` : path;
  return fetch(url, {
    ...init,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
  });
}
