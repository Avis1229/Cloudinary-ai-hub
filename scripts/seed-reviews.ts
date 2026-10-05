import mongoose from 'mongoose';
import dotenv from 'dotenv';
import ProductModel from '../lib/models/ProductModel';
import TestimonialModel from '../lib/models/TestimonialModel';

// Load environment variables from .env
dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env');
}

const fakeReviews = [
  {
    name: "Aanya Sharma",
    city: "Mumbai",
    rating: 5,
    quote: "Absolutely love the texture and how my skin feels afterward. The natural ingredients really make a difference. Highly recommended!",
    isVerifiedPurchase: true,
  },
  {
    name: "Rohan Patel",
    city: "Ahmedabad",
    rating: 4,
    quote: "Great product, has a very earthy and refreshing smell. I've been using it for a week and can see a visible glow.",
    isVerifiedPurchase: true,
  },
  {
    name: "Priya Singh",
    city: "Delhi",
    rating: 5,
    quote: "This is exactly what I was looking for. My skin is quite sensitive, but this didn't cause any irritation. So soothing!",
    isVerifiedPurchase: true,
  },
  {
    name: "Neha Gupta",
    city: "Bangalore",
    rating: 5,
    quote: "I’ve tried many premium brands, but Aethravia’s formulations feel so authentic and pure. Will definitely repurchase.",
    isVerifiedPurchase: true,
  },
  {
    name: "Karan Desai",
    city: "Pune",
    rating: 4,
    quote: "Very effective and gentle. Packaging is beautiful too. Just wish the quantity was a bit more.",
    isVerifiedPurchase: false,
  },
  {
    name: "Meera Reddy",
    city: "Hyderabad",
    rating: 5,
    quote: "I am obsessed with this ritual! It leaves my skin feeling deeply cleansed without being stripped of moisture.",
    isVerifiedPurchase: true,
  }
];

// Helper to get random reviews
function getRandomReviews(count: number) {
  const shuffled = [...fakeReviews].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

async function seedReviews() {
  try {
    await mongoose.connect(MONGODB_URI as string);
    console.log('Connected to MongoDB.');

    // Fetch all products
    const products = await ProductModel.find({}, '_id name');
    console.log(`Found ${products.length} products to seed reviews for.`);

    for (const product of products) {
      // Get a random number of reviews between 3 and 5
      const numReviews = Math.floor(Math.random() * 3) + 3;
      const selectedReviews = getRandomReviews(numReviews);

      for (const review of selectedReviews) {
        // Create review with product reference
        const newReview = new TestimonialModel({
          ...review,
          productId: product._id,
          role: review.isVerifiedPurchase ? 'Verified Buyer' : 'Customer',
          published: true,
          // Randomize date within the last 60 days
          createdAt: new Date(Date.now() - Math.floor(Math.random() * 60) * 24 * 60 * 60 * 1000)
        });
        
        await newReview.save();
      }
      
      console.log(`Seeded ${numReviews} reviews for product: ${product.name}`);
    }

    console.log('Successfully seeded all product reviews.');
  } catch (error) {
    console.error('Error seeding reviews:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB.');
  }
}

seedReviews();
