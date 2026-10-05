import { auth } from '@/lib/auth';
import dbConnect from '@/lib/dbConnect';
import UserModel from '@/lib/models/UserModel';
import OrderModel from '@/lib/models/OrderModel';
import TestimonialModel from '@/lib/models/TestimonialModel';
import ProductModel from '@/lib/models/ProductModel';
import { emitAdminEvent } from '@/lib/eventBus';

export const GET = auth(async (...args: any) => {
  const [req, { params: paramsPromise }] = args;
  const params = await paramsPromise;
  if (!req.auth || !req.auth.user?.isAdmin) {
    return Response.json({ message: 'unauthorized' }, { status: 401 });
  }
  await dbConnect();
  const user = await UserModel.findById(params.id).lean();
  if (!user) {
    return Response.json({ message: 'user not found' }, { status: 404 });
  }

  // Fetch user's orders
  const orders = await OrderModel.find({ user: params.id })
    .sort({ createdAt: -1 })
    .select('_id createdAt totalPrice isPaid isDelivered orderItems shippingAddress status')
    .lean();

  // Fetch user's reviews (stored in TestimonialModel with userId field)
  const reviews = await TestimonialModel.find({ userId: params.id })
    .sort({ createdAt: -1 })
    .lean();

  // Enrich reviews with product names
  const productIds = [...new Set(reviews.map((r: any) => r.productId).filter(Boolean))];
  const products = await ProductModel.find({ _id: { $in: productIds } })
    .select('_id name slug images')
    .lean();
  const productMap: Record<string, any> = {};
  for (const p of products as any[]) {
    productMap[String(p._id)] = p;
  }

  const enrichedReviews = reviews.map((r: any) => ({
    ...r,
    product: r.productId ? productMap[String(r.productId)] || null : null,
  }));

  return Response.json({ user, orders, reviews: enrichedReviews });
}) as any;

export const PUT = auth(async (...p: any) => {
  const [req, { params: paramsPromise }] = p;
  const params = await paramsPromise;
  if (!req.auth || !req.auth.user?.isAdmin) {
    return Response.json({ message: 'unauthorized' }, { status: 401 });
  }

  const { name, email, phone, isAdmin } = await req.json();

  try {
    await dbConnect();
    const user = await UserModel.findById(params.id);
    if (user) {
      if (name !== undefined) user.name = name;
      if (email !== undefined) user.email = email;
      if (phone !== undefined) user.phone = phone;
      if (isAdmin !== undefined) user.isAdmin = Boolean(isAdmin);

      const updatedUser = await user.save();
      emitAdminEvent({
        ts: Date.now(),
        type: 'user.updated',
        userId: String(updatedUser._id),
        isAdmin: updatedUser.isAdmin,
        email: updatedUser.email,
      });
      return Response.json({ message: 'User updated successfully', user: updatedUser });
    } else {
      return Response.json({ message: 'User not found' }, { status: 404 });
    }
  } catch (err: any) {
    console.error(`[Admin API] Error updating user ${params.id}:`, err);
    return Response.json({ message: err.message }, { status: 500 });
  }
}) as any;

export const DELETE = auth(async (...args: any) => {
  const [req, { params: paramsPromise }] = args;
  const params = await paramsPromise;
  if (!req.auth || !req.auth.user?.isAdmin) {
    return Response.json({ message: 'unauthorized' }, { status: 401 });
  }

  try {
    await dbConnect();
    const user = await UserModel.findById(params.id);
    if (user) {
      if (user.isAdmin)
        return Response.json({ message: 'Cannot delete an admin user' }, { status: 400 });
      await user.deleteOne();
      emitAdminEvent({ ts: Date.now(), type: 'user.deleted', userId: String(user._id), email: user.email });
      return Response.json({ message: 'User deleted successfully' });
    } else {
      return Response.json({ message: 'User not found' }, { status: 404 });
    }
  } catch (err: any) {
    console.error(`[Admin API] Error deleting user ${params.id}:`, err);
    return Response.json({ message: err.message }, { status: 500 });
  }
}) as any;
