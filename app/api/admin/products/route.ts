import { auth } from '@/lib/auth';
import dbConnect from '@/lib/dbConnect';
import ProductModel from '@/lib/models/ProductModel';
import { systemLogger, LogModule } from '@/lib/logger';

export const GET = auth(async (req: any) => {
  if (!req.auth || !req.auth.user?.isAdmin) {
    return Response.json(
      { message: 'unauthorized' },
      {
        status: 401,
      },
    );
  }
  await dbConnect();
  const products = await ProductModel.find();
  return Response.json(products);
}) as any;

export const POST = auth(async (req: any) => {
  if (!req.auth || !req.auth.user?.isAdmin) {
    return Response.json(
      { message: 'unauthorized' },
      {
        status: 401,
      },
    );
  }
  await dbConnect();
  const product = new ProductModel({
    name: 'New Artisanal Product',
    slug: 'new-product-' + Date.now(),
    image: '/images/products/natural-cosmetic-products-arrangement.jpg',
    price: 1,
    category: 'Body Care',
    brand: 'Aethravia',
    countInStock: 0,
    description: 'A newly archived treasure awaiting its description.',
    rating: 0,
    numReviews: 0,
  });
  try {
    await product.save();
    
    systemLogger.info({
      module: LogModule.PRODUCT,
      message: `Admin created a new product draft: ${product.name}`,
      user: req.auth.user._id,
      meta: { productId: product._id, slug: product.slug }
    });

    return Response.json(
      { message: 'Product created successfully', product },
      {
        status: 201,
      },
    );
  } catch (err: any) {
    console.error('[Admin API] Product creation failed:', err);
    return Response.json(
      { message: err.message || 'Product creation failed' },
      {
        status: 500,
      },
    );
  }
}) as any;
