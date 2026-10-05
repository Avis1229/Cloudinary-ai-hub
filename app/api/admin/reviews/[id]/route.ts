import { auth } from '@/lib/auth';
import dbConnect from '@/lib/dbConnect';
import TestimonialModel from '@/lib/models/TestimonialModel';
import UserModel from '@/lib/models/UserModel';
import ProductModel from '@/lib/models/ProductModel';
import { emitAdminEvent } from '@/lib/eventBus';

const isValidObjectIdString = (s?: string) => !!s && /^[a-fA-F0-9]{24}$/.test(s);

// GET: Single review with user + product info
export const GET = auth(async (...args: any) => {
  const [req, { params: paramsPromise }] = args;
  const params = await paramsPromise;
  if (!req.auth || !req.auth.user?.isAdmin) {
    return Response.json({ message: 'unauthorized' }, { status: 401 });
  }
  const id = params.id;
  if (!isValidObjectIdString(id)) return Response.json({ message: 'invalid id' }, { status: 400 });
  await dbConnect();
  // Ensure models are registered for populate
  ProductModel;
  UserModel;

  const item = await TestimonialModel.findById(id).lean();
  if (!item) return Response.json({ message: 'not found' }, { status: 404 });

  const r = item as any;

  // Populate user
  let user = null;
  if (r.userId) {
    const u = await UserModel.findById(r.userId).select('name email savedAddresses avatar phone').lean();
    if (u) {
      let phone = '';
      if ((u as any).savedAddresses?.length) {
        const addrWithPhone = (u as any).savedAddresses.find((a: any) => a.phone);
        if (addrWithPhone) phone = addrWithPhone.phone;
      }
      user = {
        _id: String((u as any)._id),
        name: (u as any).name,
        email: (u as any).email,
        phone,
        avatar: (u as any).avatar,
      };
    }
  }

  // Populate product
  let product = null;
  if (r.productId) {
    const p = await ProductModel.findById(r.productId).select('name slug image').lean();
    if (p) {
      product = {
        _id: String((p as any)._id),
        name: (p as any).name,
        slug: (p as any).slug,
        image: (p as any).image,
      };
    }
  }

  return Response.json({
    ...r,
    _id: String(r._id),
    userId: r.userId ? String(r.userId) : null,
    productId: r.productId ? String(r.productId) : null,
    images: r.images || [],
    videos: r.videos || [],
    user,
    product,
  });
}) as any;

// PUT: Update review
export const PUT = auth(async (...args: any) => {
  const [req, { params: paramsPromise }] = args;
  const params = await paramsPromise;
  if (!req.auth || !req.auth.user?.isAdmin) {
    return Response.json({ message: 'unauthorized' }, { status: 401 });
  }
  const id = params.id;
  if (!isValidObjectIdString(id)) return Response.json({ message: 'invalid id' }, { status: 400 });
  await dbConnect();
  const body = await req.json();
  const item = await TestimonialModel.findById(id);
  if (!item) return Response.json({ message: 'not found' }, { status: 404 });

  if (typeof body.name === 'string') item.name = body.name.trim();
  if (typeof body.quote === 'string') item.quote = body.quote.trim();
  if (typeof body.role === 'string') item.role = body.role.trim();
  if (typeof body.city === 'string') item.city = body.city.trim();
  if (typeof body.rating === 'number') item.rating = Math.max(1, Math.min(5, Math.round(body.rating)));
  if (typeof body.published === 'boolean') item.published = body.published;
  if (typeof body.order === 'number') item.order = body.order;
  if (Array.isArray(body.images)) item.images = body.images;
  if (Array.isArray(body.videos)) item.videos = body.videos;

  await item.save();

  emitAdminEvent({
    type: 'review.updated',
    reviewId: id,
    name: item.name,
  });

  return Response.json({ message: 'updated' });
}) as any;

// DELETE: Delete review
export const DELETE = auth(async (...args: any) => {
  const [req, { params: paramsPromise }] = args;
  const params = await paramsPromise;
  if (!req.auth || !req.auth.user?.isAdmin) {
    return Response.json({ message: 'unauthorized' }, { status: 401 });
  }
  const id = params.id;
  if (!isValidObjectIdString(id)) return Response.json({ message: 'invalid id' }, { status: 400 });
  await dbConnect();
  const item = await TestimonialModel.findById(id);
  await TestimonialModel.findByIdAndDelete(id);

  if (item) {
    emitAdminEvent({
      type: 'review.deleted',
      reviewId: id,
      name: item.name,
    });
  }

  return Response.json({ message: 'deleted' });
}) as any;
