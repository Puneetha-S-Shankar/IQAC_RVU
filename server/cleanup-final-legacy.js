const { MongoClient } = require('mongodb');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI;

async function cleanupFinalLegacy() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    console.log('Connected to MongoDB Atlas');
    
    const db = client.db('IQAC');
    
    // List all collections before cleanup
    console.log('\n📋 Collections before cleanup:');
    const collectionsBefore = await db.listCollections().toArray();
    collectionsBefore.forEach(col => {
      console.log(`  - ${col.name}`);
    });
    
    // Collections to delete (legacy file storage)
    const collectionsToDelete = [
      'files.chunks',
      'files.files', 
      'master_files'  // Empty legacy collection
    ];
    
    console.log('\n🗑️ Deleting legacy collections:');
    
    for (const collectionName of collectionsToDelete) {
      try {
        const collection = db.collection(collectionName);
        const count = await collection.countDocuments();
        console.log(`  - Deleting ${collectionName} (${count} documents)...`);
        
        await collection.drop();
        console.log(`    ✅ ${collectionName} deleted successfully`);
      } catch (error) {
        if (error.code === 26) {
          console.log(`    ⚠️ ${collectionName} doesn't exist (already deleted)`);
        } else {
          console.error(`    ❌ Error deleting ${collectionName}:`, error.message);
        }
      }
    }
    
    // List collections after cleanup
    console.log('\n📋 Collections after cleanup:');
    const collectionsAfter = await db.listCollections().toArray();
    collectionsAfter.forEach(col => {
      console.log(`  - ${col.name}`);
    });
    
    // Verify only correct collections remain
    console.log('\n✅ Expected final collections:');
    const expectedCollections = [
      'courses',
      'master-files.chunks', 
      'master-files.files',
      'notifications',
      'tasks', 
      'users'
    ];
    
    expectedCollections.forEach(name => {
      const exists = collectionsAfter.find(col => col.name === name);
      console.log(`  ${exists ? '✅' : '❌'} ${name} ${exists ? '(exists)' : '(MISSING!)'}`);
    });
    
    console.log('\n🎯 Legacy cleanup completed!');
    
  } catch (error) {
    console.error('❌ Error during cleanup:', error);
  } finally {
    await client.close();
    console.log('🔌 Database connection closed');
  }
}

// Run the cleanup
cleanupFinalLegacy().catch(console.error);
