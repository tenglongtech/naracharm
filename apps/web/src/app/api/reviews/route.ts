import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { productReviews } from '@jewelry/db';
import { eq, desc } from 'drizzle-orm';
import { z } from 'zod';

const reviewSchema = z.object({
  productId: z.string().min(1),
  authorName: z.string().min(1, 'Name is required').max(100),
  rating: z.number().int().min(1).max(5),
  title: z.string().max(200).optional().or(z.literal('')),
  text: z.string().min(1, 'Review text is required').max(3000),
});

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

/**
 * GET /api/reviews?productId=xxx
 * Returns reviews for a product.
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const productId = searchParams.get('productId');

  if (!productId) {
    return NextResponse.json({ error: 'Missing productId parameter' }, { status: 400 });
  }

  try {
    const reviews = await db
      .select({
        id: productReviews.id,
        authorName: productReviews.authorName,
        rating: productReviews.rating,
        title: productReviews.title,
        text: productReviews.text,
        isVerifiedPurchase: productReviews.isVerifiedPurchase,
        createdAt: productReviews.createdAt,
      })
      .from(productReviews)
      .where(eq(productReviews.productId, productId))
      .orderBy(desc(productReviews.createdAt));

    const averageRating =
      reviews.length > 0
        ? Math.round((reviews.reduce((s: number, r: { rating: number }) => s + r.rating, 0) / reviews.length) * 10) / 10
        : 0;

    return NextResponse.json({ reviews, averageRating, totalReviews: reviews.length }, { headers: corsHeaders });
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return NextResponse.json({ error: 'Failed to fetch reviews' }, { status: 500, headers: corsHeaders });
  }
}

/**
 * POST /api/reviews
 * Submit a new review.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = reviewSchema.safeParse(body);

    if (!parsed.success) {
      const firstError = parsed.error.issues[0]?.message ?? 'Invalid input';
      return NextResponse.json({ error: firstError }, { status: 400, headers: corsHeaders });
    }

    const { productId, authorName, rating, title, text } = parsed.data;

    await db.insert(productReviews).values({
      productId,
      authorName,
      rating,
      title: title || null,
      text,
      isVerifiedPurchase: false,
      isFeatured: false,
    });

    return NextResponse.json({ success: true }, { headers: corsHeaders });
  } catch (error) {
    console.error('Error creating review:', error);
    return NextResponse.json({ error: 'Failed to submit review' }, { status: 500, headers: corsHeaders });
  }
}
