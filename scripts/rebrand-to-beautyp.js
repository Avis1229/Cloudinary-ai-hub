/**
 * BeautyP - Rebrand Database Content
 * Replaces all "Aethravia" references in product names, descriptions,
 * brands, and other text fields across all collections.
 * 
 * Run: node scripts/rebrand-to-beautyp.js
 */

const { MongoClient } = require('mongodb');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI;

async function rebrandDatabase() {
  if (!MONGODB_URI) {
    console.error('❌ MONGODB_URI not set in .env');
    process.exit(1);
  }

  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    console.log('✅ Connected to MongoDB Atlas');

    const db = client.db(); // uses default db from URI

    // Get all collections
    const collections = await db.listCollections().toArray();
    console.log(`\n📦 Found ${collections.length} collections\n`);

    let totalUpdated = 0;

    for (const colInfo of collections) {
      const col = db.collection(colInfo.name);
      
      // Find documents containing "aethravia" (case-insensitive) in any string field
      const docs = await col.find({}).toArray();
      let colUpdated = 0;

      for (const doc of docs) {
        const updates = {};
        let hasUpdate = false;

        // Check all string fields
        for (const [key, value] of Object.entries(doc)) {
          if (key === '_id') continue;
          
          if (typeof value === 'string' && /aethravia/i.test(value)) {
            updates[key] = value.replace(/Aethravia/gi, 'BeautyP');
            hasUpdate = true;
          }
        }

        if (hasUpdate) {
          await col.updateOne({ _id: doc._id }, { $set: updates });
          colUpdated++;
          console.log(`  ✏️  Updated doc in ${colInfo.name}: ${doc._id}`);
          for (const [key, newVal] of Object.entries(updates)) {
            console.log(`      ${key}: ${newVal.substring(0, 80)}...`);
          }
        }
      }

      if (colUpdated > 0) {
        console.log(`  📝 ${colInfo.name}: ${colUpdated} documents updated`);
        totalUpdated += colUpdated;
      }
    }

    console.log(`\n🎉 Rebrand complete! Total documents updated: ${totalUpdated}`);

  } catch (err) {
    console.error('❌ Error:', err);
  } finally {
    await client.close();
  }
}

rebrandDatabase();
