import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import TestimonialModel from '@/lib/models/TestimonialModel';
import OrderModel from '@/lib/models/OrderModel';
import { auth } from '@/lib/auth';

export const dynamic = 'force-dynamic';

// GET: Fetch published reviews, optionally filtered by productId
export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const url = new URL(request.url);
    const productId = url.searchParams.get('productId');
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;

    const filter: any = { published: true };
    if (productId) {
      filter.productId = productId;
    }

    const [reviews, total] = await Promise.all([
      TestimonialModel.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      TestimonialModel.countDocuments(filter),
    ]);

    // Calculate rating distribution
    const allRatings = await TestimonialModel.aggregate([
      { $match: filter },
      { $group: { _id: '$rating', count: { $sum: 1 } } },
    ]);

    const ratingDistribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    let totalRating = 0;
    let ratingCount = 0;
    for (const r of allRatings) {
      if (r._id >= 1 && r._id <= 5) {
        ratingDistribution[r._id] = r.count;
        totalRating += r._id * r.count;
        ratingCount += r.count;
      }
    }

    return NextResponse.json({
      reviews: reviews.map((r: any) => ({
        id: r._id.toString(),
        name: r.name,
        quote: r.quote,
        rating: r.rating,
        role: r.role,
        city: r.city,
        images: r.images || [],
        videos: r.videos || [],
        isVerifiedPurchase: r.isVerifiedPurchase || false,
        createdAt: r.createdAt,
      })),
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
      stats: {
        averageRating: ratingCount ? +(totalRating / ratingCount).toFixed(1) : 0,
        totalReviews: ratingCount,
        distribution: ratingDistribution,
      },
    });
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return NextResponse.json({ error: 'Failed to fetch reviews' }, { status: 500 });
  }
}

// POST: Submit a new review (authenticated users only)
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Please sign in to submit a review' }, { status: 401 });
    }

    await dbConnect();

    const body = await request.json();
    const { productId, rating, quote, images, videos } = body;

    if (!quote || !rating) {
      return NextResponse.json({ error: 'Rating and review text are required' }, { status: 400 });
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json({ error: 'Rating must be between 1 and 5' }, { status: 400 });
    }

    // Check if user already reviewed this product
    if (productId) {
      const existing = await TestimonialModel.findOne({
        userId: session.user.id,
        productId,
      });
      if (existing) {
        return NextResponse.json(
          { error: 'You have already reviewed this product' },
          { status: 409 }
        );
      }
    }

    // Check if user has purchased this product (verified purchase)
    let isVerifiedPurchase = false;
    if (productId) {
      const order = await OrderModel.findOne({
        user: session.user.id,
        'items.product': productId,
        status: { $in: ['confirmed', 'processing', 'shipped', 'delivered'] },
      });
      isVerifiedPurchase = !!order;
    }

    const review = new TestimonialModel({
      name: session.user.name || 'Anonymous',
      quote: quote.trim(),
      rating,
      role: isVerifiedPurchase ? 'Verified Buyer' : 'Customer',
      published: true, // Auto-publish per user preference
      images: Array.isArray(images) ? images.slice(0, 5) : [],
      videos: Array.isArray(videos) ? videos.slice(0, 2) : [],
      productId: productId || undefined,
      userId: session.user.id,
      isVerifiedPurchase,
    });

    await review.save();

    return NextResponse.json({
      success: true,
      review: {
        id: review._id.toString(),
        name: review.name,
        quote: review.quote,
        rating: review.rating,
        images: review.images,
        videos: review.videos,
        isVerifiedPurchase: review.isVerifiedPurchase,
        createdAt: review.createdAt,
      },
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating review:', error);
    return NextResponse.json({ error: 'Failed to submit review' }, { status: 500 });
  }
}
