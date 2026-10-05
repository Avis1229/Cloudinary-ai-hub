import { auth } from '@/lib/auth';
import dbConnect from '@/lib/dbConnect';
import TestimonialModel from '@/lib/models/TestimonialModel';
import ProductModel from '@/lib/models/ProductModel';
import UserModel from '@/lib/models/UserModel';
import { emitAdminEvent } from '@/lib/eventBus';

export const dynamic = 'force-dynamic';

// GET: List all reviews with optional product filter, populated user + product info
export const GET = auth(async (req: any) => {
  if (!req.auth || !req.auth.user?.isAdmin) {
    return Response.json({ message: 'unauthorized' }, { status: 401 });
  }
  await dbConnect();
  // Ensure models are registered for populate
  ProductModel;
  UserModel;

  const url = new URL(req.url);
  const productId = url.searchParams.get('productId');

  const filter: any = {};
  if (productId) filter.productId = productId;

  const reviews = await TestimonialModel.find(filter)
    .sort({ createdAt: -1 })
    .lean();

  // Manually populate user and product info
  const userIds = [...new Set(reviews.map((r: any) => r.userId).filter(Boolean))];
  const productIds = [...new Set(reviews.map((r: any) => r.productId).filter(Boolean))];

  const [users, products] = await Promise.all([
    userIds.length > 0
      ? UserModel.find({ _id: { $in: userIds } }).select('name email savedAddresses avatar').lean()
      : [],
    productIds.length > 0
      ? ProductModel.find({ _id: { $in: productIds } }).select('name slug image').lean()
      : [],
  ]);

  const userMap = new Map((users as any[]).map((u: any) => [String(u._id), u]));
  const productMap = new Map((products as any[]).map((p: any) => [String(p._id), p]));

  // Get all products for the filter dropdown
  const allProducts = await ProductModel.find().select('name slug _id').sort({ name: 1 }).lean();

  const enriched = reviews.map((r: any) => {
    const user = r.userId ? userMap.get(String(r.userId)) : null;
    const product = r.productId ? productMap.get(String(r.productId)) : null;

    // Extract phone from saved addresses
    let phone = '';
    if (user?.savedAddresses?.length) {
      const addrWithPhone = user.savedAddresses.find((a: any) => a.phone);
      if (addrWithPhone) phone = addrWithPhone.phone;
    }

    return {
      _id: String(r._id),
      name: r.name,
      quote: r.quote,
      rating: r.rating,
      role: r.role,
      city: r.city,
      published: r.published,
      order: r.order,
      images: r.images || [],
      videos: r.videos || [],
      isVerifiedPurchase: r.isVerifiedPurchase || false,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
      userId: r.userId ? String(r.userId) : null,
      productId: r.productId ? String(r.productId) : null,
      user: user ? {
        _id: String(user._id),
        name: user.name,
        email: user.email,
        phone,
        avatar: user.avatar,
      } : null,
      product: product ? {
        _id: String(product._id),
        name: product.name,
        slug: product.slug,
        image: product.image,
      } : null,
    };
  });

  return Response.json({ reviews: enriched, products: allProducts });
}) as any;

// POST: Create a new review as admin
export const POST = auth(async (req: any) => {
  if (!req.auth || !req.auth.user?.isAdmin) {
    return Response.json({ message: 'unauthorized' }, { status: 401 });
  }

  try {
    await dbConnect();
    const data = await req.json();

    const review = await TestimonialModel.create({
      name: data.name,
      quote: data.quote,
      role: data.role || '',
      city: data.city || '',
      rating: data.rating || 5,
      published: data.published ?? true,
      productId: data.productId || null,
      images: data.images || [],
      videos: data.videos || [],
    });

    emitAdminEvent({
      ts: Date.now(),
      type: 'review.created',
      reviewId: String(review._id),
    });

    return Response.json({ message: 'Review created successfully', review });
  } catch (err: any) {
    console.error('[Admin API] Error creating review:', err);
    return Response.json({ message: err.message }, { status: 500 });
  }
}) as any;
