import { auth } from '@/lib/auth';
import dbConnect from '@/lib/dbConnect';
import ProductModel from '@/lib/models/ProductModel';

export const GET = auth(async (...args: any) => {
  const [req, { params: paramsPromise }] = args;
  const params = await paramsPromise;
  if (!req.auth || !req.auth.user?.isAdmin) {
    return Response.json(
      { message: 'unauthorized' },
      {
        status: 401,
      },
    );
  }
  await dbConnect();
  
  const { id } = params;
  console.log(`[Admin API] GET product ID: ${id}`);

  if (id === 'new') {
    return Response.json({
      name: '',
      slug: '',
      price: '',
      image: '',
      images: [],
      category: '',
      brand: '',
      countInStock: '',
      description: '',
      rating: 0,
      numReviews: 0,
      tags: [],
      tagBannerImage: '',
      isSignature: false,
    });
  }

  try {
    const product = await ProductModel.findById(id);
    if (!product) {
      return Response.json(
        { message: 'product not found' },
        {
          status: 404,
        },
      );
    }
    return Response.json(product);
  } catch (err: any) {
    console.error(`[Admin API] Failed to fetch product ${id}:`, err);
    return Response.json(
      { message: 'Invalid Product ID format' },
      { status: 400 }
    );
  }
}) as any;

export const PUT = auth(async (...args: any) => {
  const [req, { params: paramsPromise }] = args;
  const params = await paramsPromise;
  if (!req.auth || !req.auth.user?.isAdmin) {
    return Response.json(
      { message: 'unauthorized' },
      {
        status: 401,
      },
    );
  }

  const {
    name,
    slug,
    price,
    category,
    image,
    images,
    brand,
    countInStock,
    description,
    sizes,
    tags,
    tagBannerImage,
    isSignature,
  } = await req.json();

  try {
    await dbConnect();

    if (params.id === 'new') {
      const newProduct = new ProductModel({
        name,
        slug,
        price,
        category,
        image,
        images,
        brand,
        countInStock,
        description,
        sizes,
        tags,
        tagBannerImage,
        isSignature,
      });
      const createdProduct = await newProduct.save();
      return Response.json(createdProduct);
    }

    const product = await ProductModel.findById(params.id);
    if (product) {
      product.name = name;
      product.slug = slug;
      product.price = price;
      product.category = category;
      product.image = image;
      product.images = images;
      product.brand = brand;
      product.countInStock = countInStock;
      product.description = description;
      product.sizes = sizes;
      product.tags = tags;
      product.tagBannerImage = tagBannerImage;
      product.isSignature = isSignature;

      const updatedProduct = await product.save();
      return Response.json(updatedProduct);
    } else {
      return Response.json(
        { message: 'Product not found' },
        {
          status: 404,
        },
      );
    }
  } catch (err: any) {
    return Response.json(
      { message: err.message },
      {
        status: 500,
      },
    );
  }
}) as any;

export const DELETE = auth(async (...args: any) => {
  const [req, { params: paramsPromise }] = args;
  const params = await paramsPromise;

  if (!req.auth || !req.auth.user?.isAdmin) {
    return Response.json(
      { message: 'unauthorized' },
      {
        status: 401,
      },
    );
  }

  try {
    await dbConnect();
    const product = await ProductModel.findById(params.id);
    if (product) {
      await product.deleteOne();
      return Response.json({ message: 'Product deleted successfully' });
    } else {
      return Response.json(
        { message: 'Product not found' },
        {
          status: 404,
        },
      );
    }
  } catch (err: any) {
    return Response.json(
      { message: err.message },
      {
        status: 500,
      },
    );
  }
}) as any;
