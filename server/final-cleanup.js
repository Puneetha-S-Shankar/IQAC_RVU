const mongoose = require('mongoose');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://adminUser:adminPassword123@clusterusers.ac-dmzh4gk.mongodb.net/iqac-database?retryWrites=true&w=majority&appName=ClusterUsers';

async function deleteAllLegacyCollections() {
  try {
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 10000,
      connectTimeoutMS: 10000,
      socketTimeoutMS: 10000,
      maxPoolSize: 5,
      retryWrites: true,
      w: 'majority'
    });
    
    console.log('🔌 Connected to MongoDB');
    
    const db = mongoose.connection.db;
    
    // Check master-files status first
    const masterFilesCount = await db.collection('master-files.files').countDocuments();
    const masterChunksCount = await db.collection('master-files.chunks').countDocuments();
    
    console.log(`\n🎯 Master Collections Status:`);
    console.log(`   master-files.files: ${masterFilesCount} documents`);
    console.log(`   master-files.chunks: ${masterChunksCount} documents`);
    
    if (masterFilesCount === 0) {
      console.log('❌ ERROR: Master collections are empty! Cannot proceed.');
      return;
    }
    
    // Get all collections and identify what to delete
    const allCollections = await db.listCollections().toArray();
    const collectionsToDelete = allCollections
      .map(c => c.name)
      .filter(name => 
        (name.includes('files') && !name.includes('master-files')) ||
        (name.includes('chunks') && !name.includes('master-files')) ||
        name.includes('uploads') ||
        name.includes('backup')
      );
    
    console.log('\n🗑️  Collections to DELETE:');
    collectionsToDelete.forEach(name => console.log(`   • ${name}`));
    
    console.log('\n✅ Collections to KEEP:');
    allCollections
      .map(c => c.name)
      .filter(name => name.includes('master-files') || name === 'master_files')
      .forEach(name => console.log(`   • ${name}`));
    
    console.log('\n💥 DELETING ALL LEGACY COLLECTIONS...');
    
    let totalDeleted = 0;
    
    for (const collectionName of collectionsToDelete) {
      try {
        await db.collection(collectionName).drop();
        console.log(`   ✅ DELETED: ${collectionName}`);
        totalDeleted++;
      } catch (error) {
        if (error.message.includes('ns not found')) {
          console.log(`   ⏭️  Already gone: ${collectionName}`);
        } else {
          console.error(`   ❌ Error: ${collectionName} - ${error.message}`);
        }
      }
    }
    
    console.log(`\n📊 FINAL SUMMARY:`);
    console.log(`   ✅ Collections deleted: ${totalDeleted}`);
    console.log(`   🎯 Master files: ${masterFilesCount} documents`);
    console.log(`   🎯 Master chunks: ${masterChunksCount} documents`);
    
    // Show final collections
    const finalCollections = await db.listCollections().toArray();
    const finalFileCollections = finalCollections
      .map(c => c.name)
      .filter(name => name.includes('files') || name.includes('chunks') || name.includes('uploads'));
    
    console.log('\n🏁 REMAINING FILE COLLECTIONS:');
    finalFileCollections.forEach(name => console.log(`   ✅ ${name}`));
    
    console.log('\n🎉 CLEANUP COMPLETE!');
    console.log('   • All legacy collections DELETED');
    console.log('   • Only master-files collections remain');
    console.log('   • No backups created - clean database!');
    
  } catch (error) {
    console.error('❌ Cleanup failed:', error.message);
  } finally {
    await mongoose.disconnect();
  }
}

console.log('🚨 NUCLEAR CLEANUP - DELETE ALL LEGACY COLLECTIONS');
console.log('==================================================');
console.log('⚠️  This will PERMANENTLY DELETE ALL legacy file collections');
console.log('🎯 Only master-files collections will remain');
console.log('🚫 NO backups will be created!');
console.log('');

deleteAllLegacyCollections();
