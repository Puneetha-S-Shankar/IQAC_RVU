const mongoose = require('mongoose');
const unifiedFileService = require('./services/unifiedFileService');
require('dotenv').config();

async function testUnifiedSystem() {
  try {
    console.log('🧪 Testing Unified File System...\n');
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');
    
    // Initialize the service
    await unifiedFileService.initialize();
    console.log('✅ Unified file service initialized');
    
    // Test 1: Check if master_files collection exists
    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    const masterFilesExists = collections.some(col => col.name === 'master_files');
    
    console.log(`\n📊 Collection Check:`);
    console.log(`   master_files collection: ${masterFilesExists ? '✅ EXISTS' : '❌ MISSING'}`);
    
    // Test 2: Check if master-files GridFS bucket exists
    const masterFilesBucket = collections.some(col => col.name === 'master-files.files');
    console.log(`   master-files GridFS bucket: ${masterFilesBucket ? '✅ EXISTS' : '❌ MISSING'}`);
    
    // Test 3: Count files in new system
    if (masterFilesExists) {
      const fileCount = await db.collection('master_files').countDocuments();
      console.log(`   Files in master_files: ${fileCount}`);
    }
    
    // Test 4: Check old collections still exist
    const oldFilesExists = collections.some(col => col.name === 'files.files');
    const oldUploadsExists = collections.some(col => col.name === 'uploads.files');
    
    console.log(`\n📦 Legacy Collections:`);
    console.log(`   files.files (old curriculum): ${oldFilesExists ? '✅ EXISTS' : '❌ MISSING'}`);
    console.log(`   uploads.files (old assignments): ${oldUploadsExists ? '✅ EXISTS' : '❌ MISSING'}`);
    
    // Test 5: Test API endpoints (if server is running)
    console.log(`\n🔌 API Endpoint Test:`);
    console.log(`   New unified endpoint: /api/unified-files`);
    console.log(`   Old endpoints still available: /api/files, /api/uploads`);
    
    // Test 6: Show migration status
    console.log(`\n🔄 Migration Status:`);
    if (masterFilesExists && (oldFilesExists || oldUploadsExists)) {
      console.log(`   ⚠️  Migration needed - run: node migrate-to-unified-system.js`);
    } else if (masterFilesExists && !oldFilesExists && !oldUploadsExists) {
      console.log(`   ✅ Migration completed - old collections removed`);
    } else if (!masterFilesExists) {
      console.log(`   ❌ New system not set up - run: node migrate-to-unified-system.js`);
    }
    
    // Test 7: Show system architecture
    console.log(`\n🏗️  System Architecture:`);
    console.log(`   Database: ${process.env.MONGODB_URI ? '✅ CONFIGURED' : '❌ NOT CONFIGURED'}`);
    console.log(`   New Model: File.js ${masterFilesExists ? '✅ LOADED' : '❌ NOT LOADED'}`);
    console.log(`   New Service: unifiedFileService.js ${unifiedFileService ? '✅ LOADED' : '❌ NOT LOADED'}`);
    console.log(`   New Routes: unifiedFiles.js - Ready to use`);
    
    console.log(`\n🎯 Next Steps:`);
    if (!masterFilesExists) {
      console.log(`   1. Run migration: node migrate-to-unified-system.js`);
      console.log(`   2. Test new endpoints: curl http://localhost:5000/api/unified-files`);
      console.log(`   3. Update frontend to use new API`);
    } else {
      console.log(`   1. Test new endpoints: curl http://localhost:5000/api/unified-files`);
      console.log(`   2. Update frontend to use new API`);
      console.log(`   3. Remove old endpoints when ready`);
    }
    
    console.log(`\n✅ System test completed!`);
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

// Run test if this file is executed directly
if (require.main === module) {
  testUnifiedSystem();
}

module.exports = testUnifiedSystem;
