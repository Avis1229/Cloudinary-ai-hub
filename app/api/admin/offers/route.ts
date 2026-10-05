import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Offer from '../../../../lib/models/OfferModel';
import CouponModel from '@/lib/models/CouponModel';
import { requireAdminSession } from '@/lib/requireAdminSession';

/**
 * Syncs a linked coupon in CouponModel whenever an offer has a couponCode.
 * Creates or updates the coupon to match the offer's discount configuration.
 */
async function syncLinkedCoupon(offer: any, adminUserId?: string) {
  if (!offer.couponCode) return null;

  const couponData: any = {
    code: offer.couponCode.toUpperCase().trim(),
    name: offer.title,
    description: offer.shortDescription || offer.description || offer.title,
    startDate: offer.startDate,
    expiryDate: offer.endDate,
    status: offer.isActive ? 'active' : 'inactive',
    minimumOrderAmount: offer.minimumOrderAmount || 0,
  };

  // Map offer discount type to coupon type
  switch (offer.discountType) {
    case 'percentage':
      couponData.type = 'percentage';
      couponData.value = offer.discountValue || 0;
      couponData.maximumDiscountAmount = offer.maxDiscount || null;
      break;
    case 'flat':
      couponData.type = 'fixed_amount';
      couponData.value = offer.discountValue || 0;
      break;
    case 'combo':
    case 'bogo':
    case 'freebie':
      // For combo/bogo/freebie, store as fixed_amount with the savings value
      couponData.type = 'fixed_amount';
      couponData.value = offer.discountValue || 0;
      break;
    default:
      couponData.type = 'percentage';
      couponData.value = 0;
  }

  // Copy product/category targeting
  if (offer.applicableProducts?.length) {
    couponData.applicableProducts = offer.applicableProducts;
  }
  if (offer.applicableCategories?.length) {
    couponData.applicableCategories = offer.applicableCategories;
  }

  let coupon;
  if (offer.linkedCouponId) {
    // Update existing linked coupon
    coupon = await CouponModel.findByIdAndUpdate(
      offer.linkedCouponId,
      couponData,
      { new: true }
    );
  }

  if (!coupon) {
    // Try to find by code or create new
    coupon = await CouponModel.findOneAndUpdate(
      { code: couponData.code },
      { ...couponData, createdBy: adminUserId || offer._id },
      { new: true, upsert: true }
    );
  }

  return coupon?._id || null;
}

// GET: List all offers (paginated, filterable)
export async function GET(request: NextRequest) {
  await dbConnect();
  await requireAdminSession();

  const url = new URL(request.url);
  const type = url.searchParams.get('type');
  const page = parseInt(url.searchParams.get('page') || '1');
  const limit = parseInt(url.searchParams.get('limit') || '50');
  const skip = (page - 1) * limit;

  const filter: any = {};
  if (type) filter.type = type;

  const offers = await Offer.find(filter)
    .populate('applicableProducts', 'name slug')
    .populate('freeProductId', 'name slug')
    .sort({ isActive: -1, priority: -1, createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();

  const total = await Offer.countDocuments(filter);

  return NextResponse.json({
    offers,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  });
}

// POST: Create a new offer
export async function POST(req: NextRequest) {
  await dbConnect();
  const session = await requireAdminSession();

  const data = await req.json();

  // Validate discount configuration
  if (data.discountType) {
    if (data.discountType === 'percentage' && (data.discountValue < 0 || data.discountValue > 100)) {
      return NextResponse.json({ error: 'Percentage must be between 0 and 100' }, { status: 400 });
    }
    if (data.discountType === 'flat' && data.discountValue < 0) {
      return NextResponse.json({ error: 'Flat discount must be positive' }, { status: 400 });
    }
    if (data.discountType === 'combo' && !data.comboPrice) {
      return NextResponse.json({ error: 'Combo offers require a combo price' }, { status: 400 });
    }
  }

  const offer = new Offer(data);
  await offer.save();

  // Auto-create linked coupon if couponCode is provided
  if (data.couponCode) {
    const linkedCouponId = await syncLinkedCoupon(offer, (session as any)?.user?.id);
    if (linkedCouponId) {
      offer.linkedCouponId = linkedCouponId;
      await offer.save();
    }
  }

  return NextResponse.json(offer);
}

// PUT: Update an offer
export async function PUT(req: NextRequest) {
  await dbConnect();
  const session = await requireAdminSession();

  const { offerId, ...update } = await req.json();
  if (!offerId) {
    return NextResponse.json({ error: 'offerId is required' }, { status: 400 });
  }

  // Validate discount configuration
  if (update.discountType) {
    if (update.discountType === 'percentage' && (update.discountValue < 0 || update.discountValue > 100)) {
      return NextResponse.json({ error: 'Percentage must be between 0 and 100' }, { status: 400 });
    }
    if (update.discountType === 'combo' && !update.comboPrice) {
      return NextResponse.json({ error: 'Combo offers require a combo price' }, { status: 400 });
    }
  }

  const offer = await Offer.findByIdAndUpdate(offerId, update, { new: true });
  if (!offer) {
    return NextResponse.json({ error: 'Offer not found' }, { status: 404 });
  }

  // Sync linked coupon
  if (offer.couponCode) {
    const linkedCouponId = await syncLinkedCoupon(offer, (session as any)?.user?.id);
    if (linkedCouponId && !offer.linkedCouponId?.equals(linkedCouponId)) {
      offer.linkedCouponId = linkedCouponId;
      await offer.save();
    }
  }

  return NextResponse.json(offer);
}

// DELETE: Remove an offer and its linked coupon
export async function DELETE(req: NextRequest) {
  await dbConnect();
  await requireAdminSession();

  const { offerId } = await req.json();
  const offer = await Offer.findById(offerId);

  if (offer?.linkedCouponId) {
    await CouponModel.findByIdAndDelete(offer.linkedCouponId);
  }

  await Offer.findByIdAndDelete(offerId);
  return NextResponse.json({ success: true });
}
