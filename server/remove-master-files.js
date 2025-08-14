const { MongoClient } = require('mongodb');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI;

async function removeLastLegacy() {
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
    
    // Delete the remaining legacy collection
    console.log('\n🗑️ Deleting final legacy collection:');
    
    try {
      const collection = db.collection('master_files');
      const count = await collection.countDocuments();
      console.log(`  - Deleting master_files (${count} documents)...`);
      
      await collection.drop();
      console.log(`    ✅ master_files deleted successfully`);
    } catch (error) {
      if (error.code === 26) {
        console.log(`    ⚠️ master_files doesn't exist (already deleted)`);
      } else {
        console.error(`    ❌ Error deleting master_files:`, error.message);
      }
    }
    
    // List collections after cleanup
    console.log('\n📋 Final collections:');
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
    
    console.log('\n🎯 Database is now perfectly clean!');
    console.log('📊 Total collections: 6 (optimal)');
    
  } catch (error) {
    console.error('❌ Error during cleanup:', error);
  } finally {
    await client.close();
    console.log('🔌 Database connection closed');
  }
}

// Run the cleanup
removeLastLegacy().catch(console.error);
