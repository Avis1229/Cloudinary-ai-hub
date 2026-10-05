const { MongoClient } = require('mongodb');

async function checkRemoteDB() {
  const uri = "mongodb+srv://heukcare_db_user:D4Jsnep56SHcnK9O@cluster0.bghvakr.mongodb.net/aethravia?appName=Cluster0";
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
