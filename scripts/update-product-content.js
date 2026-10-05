/**
 * Aethravia - Update Product Ingredients, Ritual & Description
 * Run: node scripts/update-product-content.js
 */

const { MongoClient } = require('mongodb');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI not found in .env');
  process.exit(1);
}

// Full ingredient lists from Arpita's document
const PRODUCT_UPDATES = [
  {
    // Match by name containing "Face Wash"
    namePattern: /face.?wash/i,
    update: {
      ingredients: [
        'Aqua', 'Decyl Glucoside', 'Sodium Cocoyl Isethionate', 'Coco-Glucoside', 'Glycerin',
        'Cetearyl Alcohol', 'Multani Mitti (Fuller\'s Earth)', 'Pumice', 'Niacinamide',
        'Sodium Benzoate', 'Potassium Sorbate', 'Xanthan Gum', 'Lactic Acid', 'Citric Acid',
        'Hyaluronic Acid', 'Cucumis Sativus (Cucumber) Extract',
        'Camellia Sinensis (Green Tea) Leaf Extract',
        'Citrus Bergamia (Bergamot) Peel Oil',
        'Citrus Aurantium Amara (Neroli) Flower Oil',
        'Citrus Aurantium Amara (Petitgrain) Leaf Oil'
      ]
    }
  },
  {
    // Match by name containing "Body Wash"
    namePattern: /body.?wash/i,
    update: {
      ingredients: [
        'Aqua', 'Sodium C14-16 Olefin Sulfonate', 'Cocamidopropyl Betaine',
        'PEG-7 Glyceryl Cocoate', 'Cocamide DEA', 'Glycerin',
        'Reetha (Sapindus Mukorossi) Fruit Extract', 'Multani Mitti (Fuller\'s Earth)',
        'Sodium Cocoyl Isethionate', 'Polyquaternium-7', 'Sodium Benzoate',
        'Acrylates/C10-30 Alkyl Acrylate Crosspolymer', 'Glycolic Acid', 'Citric Acid',
        'Salicylic Acid', 'Niacinamide', 'Ceramide NP', 'Hyaluronic Acid',
        'Cocos Nucifera (Coconut) Oil', 'Vetiveria Zizanoides (Vetiver) Root Oil',
        'Pogostemon Cablin (Patchouli) Oil', 'Elettaria Cardamomum (Cardamom) Seed Oil',
        'Santalum Album (Sandalwood) Oil', 'Rosa Damascena Flower Oil',
        'Citrus Bergamia (Bergamot) Peel Oil', 'Parfum'
      ]
    }
  },
  {
    // Match by name containing "Body Scrub"
    namePattern: /body.?scrub/i,
    update: {
      ingredients: [
        'Aqua', 'Paraffinum Liquidum', 'Stearic Acid', 'E-Wax',
        'Juglans Regia (Walnut) Shell Powder', 'Multani Mitti',
        'Reetha Extract', 'Cicer Arietinum (Besan) Powder', 'Mel (Honey)',
        'Simmondsia Chinensis (Jojoba) Seed Oil', 'Ceramide', 'Tocopherol',
        'Melaleuca Alternifolia (Tea Tree) Leaf Oil',
        'Azadirachta Indica (Neem) Leaf Extract',
        'Eucalyptus Globulus Leaf Oil', 'Gluconolactone', 'Disodium EDTA',
        'Sodium Benzoate', 'Benzyl Alcohol', 'Parfum (Fragrance)'
      ]
    }
  }
];

async function updateProducts() {
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    console.log('✅ Connected to MongoDB');

    const db = client.db();
    const products = db.collection('products');

    // First, list all products so we can confirm matches
    const allProducts = await products.find({}, { projection: { name: 1, slug: 1 } }).toArray();
    console.log('\n📦 Products in DB:');
    allProducts.forEach(p => console.log(`  - ${p.name} (${p.slug})`));

    console.log('\n🔄 Updating ingredients...');

    for (const update of PRODUCT_UPDATES) {
      // Find matching products
      const matchingProducts = allProducts.filter(p => update.namePattern.test(p.name));
      
      if (matchingProducts.length === 0) {
        console.log(`⚠️  No product matched pattern: ${update.namePattern}`);
        continue;
      }

      for (const product of matchingProducts) {
        const result = await products.updateOne(
          { _id: product._id },
          { $set: update.update }
        );
        
        if (result.modifiedCount > 0) {
          console.log(`✅ Updated "${product.name}"`);
          console.log(`   Ingredients: ${update.update.ingredients.slice(0, 3).join(', ')}... (${update.update.ingredients.length} total)`);
        } else {
          console.log(`ℹ️  No change needed for "${product.name}"`);
        }
      }
    }

    console.log('\n✨ Product content update complete!');

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  } finally {
    await client.close();
    console.log('🔌 Disconnected from MongoDB');
  }
}

updateProducts();
