import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

/**
 * POST /api/admin/upload
 * 上传产品图片到 public/products/ (仅 admin)
 * body: multipart/form-data, field "file"
 */
export async function POST(req: NextRequest) {
  // ── 权限校验 ──
  let isAdmin = false;
  try {
    const { headers } = await import('next/headers');
    const h = await headers();
    const { auth } = await import('@/lib/auth');
    const session = await auth.api.getSession({ headers: h });
    if (session?.user) {
      // Better Auth session 可能不含 role,回库查
      const { db } = await import('@/lib/db');
      const { users } = await import('@jewelry/db');
      const { eq } = await import('drizzle-orm');
      const [u] = await db.select().from(users).where(eq(users.id, session.user.id)).limit(1);
      isAdmin = u?.role === 'admin';
    }
  } catch (e: any) {
    console.error('[upload] auth error:', e?.message);
  }
  if (!isAdmin) {
    return NextResponse.json({ error: '未授权,需要管理员登录' }, { status: 401 });
  }

  // ── 处理上传 ──
  const formData = await req.formData();
  const file = formData.get('file') as File | null;
  if (!file) {
    return NextResponse.json({ error: '未提供文件' }, { status: 400 });
  }

  const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  if (!allowed.includes(file.type)) {
    return NextResponse.json({ error: '仅支持 JPG/PNG/WebP/GIF' }, { status: 400 });
  }
  if (file.size > 10 * 1024 * 1024) {
    return NextResponse.json({ error: '文件不能超过 10MB' }, { status: 400 });
  }

  const ext = file.type.split('/')[1] === 'jpeg' ? 'jpg' : file.type.split('/')[1];
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const uploadDir = path.join(process.cwd(), 'public', 'products');
  await mkdir(uploadDir, { recursive: true });
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(uploadDir, filename), buffer);

  return NextResponse.json({ url: `/products/${filename}`, filename });
}
