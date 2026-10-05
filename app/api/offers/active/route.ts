import { NextRequest, NextResponse } from 'next/server';

// Always resolve at runtime; depends on DB and current date
export const dynamic = 'force-dynamic';
import dbConnect from '@/lib/dbConnect';
import Offer from '../../../../lib/models/OfferModel';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const url = new URL(request.url);
    const productId = url.searchParams.get('productId');

    const now = new Date();

    // Base filter: active offers within date range
    const filter: any = {
      isActive: true,
      $or: [
        { startDate: { $lte: now }, endDate: { $gte: now } },
        { startDate: { $exists: false }, endDate: { $exists: false } },
        { startDate: { $lte: now }, endDate: { $exists: false } },
        { startDate: { $exists: false }, endDate: { $gte: now } },
      ],
    };

    // If productId is provided, only return offers that either:
    // 1. Have no applicableProducts (global offers)
    // 2. Include this product in applicableProducts
    if (productId) {
      filter.$and = [
        {
          $or: [
            { applicableProducts: { $exists: false } },
            { applicableProducts: { $size: 0 } },
            { applicableProducts: productId },
          ],
        },
      ];
    }

    const offers = await Offer.find(filter)
      .select('title shortDescription description discountType discountValue comboPrice minimumQuantity minimumOrderAmount maxDiscount couponCode badge type freeProductId')
      .sort({ priority: -1, createdAt: -1 })
      .limit(10)
      .lean();

    return NextResponse.json({ offers });
  } catch (error) {
    console.error('Error fetching active offers:', error);
    return NextResponse.json(
      { error: 'Failed to fetch offers' },
      { status: 500 }
    );
  }
}