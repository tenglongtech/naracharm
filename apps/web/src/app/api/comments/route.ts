import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { blogComments } from '@jewelry/db';
import { eq, and, desc } from 'drizzle-orm';
import { z } from 'zod';

const commentSchema = z.object({
  articleSlug: z.string().min(1),
  authorName: z.string().min(1, 'Name is required').max(100),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  text: z.string().min(1, 'Comment is required').max(2000),
});

/**
 * GET /api/comments?articleSlug=xxx
 * Returns approved comments for a given article, ordered by newest first.
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const articleSlug = searchParams.get('articleSlug');

  if (!articleSlug) {
    return NextResponse.json({ error: 'Missing articleSlug parameter' }, { status: 400 });
  }

  try {
    const comments = await db
      .select({
        id: blogComments.id,
        authorName: blogComments.authorName,
        text: blogComments.text,
        createdAt: blogComments.createdAt,
      })
      .from(blogComments)
      .where(
        and(
          eq(blogComments.articleSlug, articleSlug),
          eq(blogComments.isApproved, true),
        ),
      )
      .orderBy(desc(blogComments.createdAt));

    return NextResponse.json({ comments });
  } catch (error) {
    console.error('Error fetching comments:', error);
    return NextResponse.json({ error: 'Failed to fetch comments' }, { status: 500 });
  }
}

/**
 * POST /api/comments
 * Submit a new comment for moderation.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = commentSchema.safeParse(body);

    if (!parsed.success) {
      const firstError = parsed.error.issues[0]?.message ?? 'Invalid input';
      return NextResponse.json({ error: firstError }, { status: 400 });
    }

    const { articleSlug, authorName, email, text } = parsed.data;

    await db.insert(blogComments).values({
      articleSlug,
      authorName,
      email: email || null,
      text,
      isApproved: false,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error creating comment:', error);
    return NextResponse.json({ error: 'Failed to submit comment' }, { status: 500 });
  }
}
