/**
 * Aethravia - Pre-Live Data Cleanup Script
 * 
 * Clears test/dummy data from MongoDB before going live.
 * 
 * WHAT IT DELETES:
 *   - All orders (test orders)
 *   - All system logs
 *   - All abandoned cart records
 *   - All register verification records (OTP)
 *   - All non-admin user accounts (test users)
 * 
 * WHAT IT KEEPS:
 *   - Products
 *   - Coupons
 *   - Admin user accounts
 *   - Banners, Popup Banners
 *   - Testimonials
 *   - Offers
 *   - Loyalty Rules
 * 
 * Run: node scripts/clear-test-data.js
 */

const { MongoClient } = require('mongodb');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI not found in .env');
  process.exit(1);
}

async function clearTestData() {
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    console.log('✅ Connected to MongoDB');

    const db = client.db();

    // ─────────────────────────────────────────────
    // 1. DELETE ALL ORDERS
    // ─────────────────────────────────────────────
    const ordersResult = await db.collection('orders').deleteMany({});
    console.log(`🗑️  Deleted ${ordersResult.deletedCount} orders`);

    // ─────────────────────────────────────────────
    // 2. DELETE ALL SYSTEM LOGS
    // ─────────────────────────────────────────────
    const logsResult = await db.collection('systemlogs').deleteMany({});
    console.log(`🗑️  Deleted ${logsResult.deletedCount} system logs`);

    // ─────────────────────────────────────────────
    // 3. DELETE ALL ABANDONED CARTS
    // ─────────────────────────────────────────────
    const abandonedResult = await db.collection('abandonedcarts').deleteMany({});
    console.log(`🗑️  Deleted ${abandonedResult.deletedCount} abandoned carts`);

    // ─────────────────────────────────────────────
    // 4. DELETE REGISTER VERIFICATION RECORDS
    // ─────────────────────────────────────────────
    const verifyResult = await db.collection('registerverifications').deleteMany({});
    console.log(`🗑️  Deleted ${verifyResult.deletedCount} register verification records`);

    // ─────────────────────────────────────────────
    // 5. DELETE NON-ADMIN USERS (test accounts)
    // ─────────────────────────────────────────────
    const usersResult = await db.collection('users').deleteMany({ isAdmin: { $ne: true } });
    console.log(`🗑️  Deleted ${usersResult.deletedCount} non-admin (test) users`);

    // ─────────────────────────────────────────────
    // 6. RESET COUPON USAGE COUNTERS
    // ─────────────────────────────────────────────
    const couponResult = await db.collection('coupons').updateMany(
      {},
      {
        $set: {
          usedCount: 0,
          usedBy: [],
        }
      }
    );
    console.log(`♻️  Reset usage counters on ${couponResult.modifiedCount} coupons`);

    // ─────────────────────────────────────────────
    // SUMMARY
    // ─────────────────────────────────────────────
    console.log('\n✨ Cleanup complete! Database is now ready for live.');
    console.log('\n📦 The following data was KEPT (untouched):');
    
    const productCount = await db.collection('products').countDocuments();
    const adminCount = await db.collection('users').countDocuments({ isAdmin: true });
    const couponCount = await db.collection('coupons').countDocuments();
    const bannerCount = await db.collection('banners').countDocuments();
    const testimonialCount = await db.collection('testimonials').countDocuments();
    const offerCount = await db.collection('offers').countDocuments();

    console.log(`   ✅ Products:      ${productCount}`);
    console.log(`   ✅ Admin Users:   ${adminCount}`);
    console.log(`   ✅ Coupons:       ${couponCount}`);
    console.log(`   ✅ Banners:       ${bannerCount}`);
    console.log(`   ✅ Testimonials:  ${testimonialCount}`);
    console.log(`   ✅ Offers:        ${offerCount}`);

  } catch (error) {
    console.error('❌ Error during cleanup:', error);
    process.exit(1);
  } finally {
    await client.close();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

clearTestData();
