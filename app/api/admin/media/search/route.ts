import { NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';
import { initCloudinary, ROOT_FOLDER } from '@/lib/cloudinaryConfig';

export async function GET(req: Request) {
  try {
    initCloudinary();
    const { searchParams } = new URL(req.url);
    const query = searchParams.get('q') || '';
    const nextCursor = searchParams.get('next_cursor') || '';

    // Build the search expression
    // We want to search in our specific ROOT_FOLDER
    let expression = `folder:${ROOT_FOLDER}/*`;
    
    if (query) {
      // Cloudinary search supports matching tags, filename, etc.
      expression += ` AND (tags:${query}* OR filename:${query}*)`;
    }

    const searchResult = await cloudinary.search
      .expression(expression)
      .with_field('tags')
      .with_field('context')
      .with_field('image_metadata')
      .max_results(20)
      .next_cursor(nextCursor)
      .execute();

    return NextResponse.json(searchResult);
  } catch (error: any) {
    console.error('Cloudinary Search API Error:', error);
    return NextResponse.json({ error: error.message || 'Search failed' }, { status: 500 });
  }
}
