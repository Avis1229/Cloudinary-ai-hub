import mongoose from 'mongoose';
import dotenv from 'dotenv';
import ProductModel from '../lib/models/ProductModel';

// Load environment variables from .env
dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env');
}

const faceWashTags = [
  "All Skin Types", "Gentle Daily Cleanser", "Everyday Use", "Deep Cleansing",
  "Removes Dirt & Oil", "Refreshes Skin", "Healthy-Looking Skin", "Hydration Support",
  "Salicylic Acid", "Niacinamide", "Hyaluronic Acid", "Multani Mitti", "Reetha Extract"
];

const bodyWashTags = [
  "All Skin Types", "Daily Body Wash", "Deep Cleansing", "Body Odor Care",
  "Back Acne Care", "Tan Care", "Bright & Fresh Skin", "Hydrating Formula",
  "Niacinamide", "Salicylic Acid", "Ceramide", "Hyaluronic Acid", "Multani Mitti",
  "Reetha Saponins"
];

const bodyScrubTags = [
  "All Skin Types", "Gentle Exfoliation", "Removes Dead Skin", "Tan Removal",
  "Smooth Skin", "Soft Skin", "Nourishing Formula", "Skin Barrier Support",
  "Walnut Shell Scrub", "Multani Mitti", "Reetha Extract", "Ceramide", "Jojoba Oil"
];

async function updateTags() {
  try {
    await mongoose.connect(MONGODB_URI as string);
    console.log('Connected to MongoDB.');

    const updates = [
      { name: "Face Wash", tags: faceWashTags, tagBannerImage: '/images/tag-banners/face-wash-tags.jpg' },
      { name: "Body wash", tags: bodyWashTags, tagBannerImage: '/images/tag-banners/body-wash-tags.jpg' },
      { name: "Body Scrub", tags: bodyScrubTags, tagBannerImage: '/images/tag-banners/body-scrub-tags.jpg' }
    ];

    for (const update of updates) {
      // Find by regex to ignore case differences
      const product = await ProductModel.findOne({ name: { $regex: new RegExp(update.name, 'i') } });
      if (product) {
        product.tags = update.tags;
        product.tagBannerImage = update.tagBannerImage;
        await product.save();
        console.log(`Updated tags + tagBannerImage for: ${product.name}`);
      } else {
        console.log(`Product NOT FOUND: ${update.name}`);
        const allProducts = await ProductModel.find({}, 'name');
        console.log('Available products:', allProducts.map(p => p.name).join(', '));
      }
    }

    console.log('Update complete.');
  } catch (error) {
    console.error('Error updating tags:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB.');
  }
}

updateTags();
