const { MongoClient } = require('mongodb');
require('dotenv').config();

async function checkRemoteDB() {
  const uri = process.env.MONGODB_URI;
  if (!uri) { console.error('MONGODB_URI not set'); process.exit(1); }
  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log("Connected to Atlas!");
    
    const adminDb = client.db().admin();
    const dbs = await adminDb.listDatabases();
    
    console.log("\nDatabases found:");
    for (const dbInfo of dbs.databases) {
      if (dbInfo.name === 'admin' || dbInfo.name === 'local') continue;
      
      console.log(`- ${dbInfo.name} (${(dbInfo.sizeOnDisk / 1024).toFixed(2)} KB)`);
      const db = client.db(dbInfo.name);
      const collections = await db.listCollections().toArray();
      
      for (const col of collections) {
        const count = await db.collection(col.name).countDocuments();
        console.log(`   -> ${col.name}: ${count} documents`);
      }
    }
  } catch (err) {
    console.error("Error connecting to Atlas:", err);
  } finally {
    await client.close();
  }
}

checkRemoteDB();
