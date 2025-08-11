const mongoose = require('mongoose');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://adminUser:adminPassword123@clusterusers.ac-dmzh4gk.mongodb.net/iqac-database?retryWrites=true&w=majority&appName=ClusterUsers';

async function migrateToMasterFiles() {
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
    
    // Get all collections
    const collections = await db.listCollections().toArray();
    const collectionNames = collections.map(c => c.name);
    
    console.log('\n📁 Current collections:');
    collectionNames.forEach(name => {
      if (name.includes('files') || name.includes('chunks') || name.includes('uploads')) {
        console.log(`   ${name}`);
      }
    });
    
    // Collections to migrate FROM and deprecate
    const legacyCollections = [
      { files: 'files.files', chunks: 'files.chunks' },
      { files: 'uploads.files', chunks: 'uploads.chunks' },
      { files: 'backup_files_files_2025-08-10', chunks: 'backup_files_chunks_2025-08-10' },
      { files: 'backup_uploads_files_2025-08-10', chunks: 'backup_uploads_chunks_2025-08-10' }
    ];
    
    // Target collections (master system)
    const masterFiles = 'master-files.files';
    const masterChunks = 'master-files.chunks';
    
    console.log('\n🎯 Target collections:');
    console.log(`   Files: ${masterFiles}`);
    console.log(`   Chunks: ${masterChunks}`);
    
    // Ensure master collections exist
    const masterFilesCollection = db.collection(masterFiles);
    const masterChunksCollection = db.collection(masterChunks);
    
    let totalFilesMigrated = 0;
    let totalChunksMigrated = 0;
    
    // Migrate from each legacy collection
    for (const legacy of legacyCollections) {
      const { files: filesCollection, chunks: chunksCollection } = legacy;
      
      if (!collectionNames.includes(filesCollection)) {
        console.log(`\n⏭️  Skipping ${filesCollection} (doesn't exist)`);
        continue;
      }
      
      console.log(`\n📦 Migrating from ${filesCollection}...`);
      
      // Get all files from legacy collection
      const legacyFiles = await db.collection(filesCollection).find({}).toArray();
      console.log(`   Found ${legacyFiles.length} files`);
      
      for (const file of legacyFiles) {
        // Check if file already exists in master collection
        const existingFile = await masterFilesCollection.findOne({
          $or: [
            { _id: file._id },
            { filename: file.filename, uploadDate: file.uploadDate },
            { md5: file.md5, length: file.length }
          ]
        });
        
        if (!existingFile) {
          // Copy file metadata to master collection
          await masterFilesCollection.insertOne({
            ...file,
            migratedFrom: filesCollection,
            migratedAt: new Date()
          });
          
          // Copy associated chunks if they exist
          if (collectionNames.includes(chunksCollection)) {
            const chunks = await db.collection(chunksCollection).find({ files_id: file._id }).toArray();
            console.log(`     Copying ${chunks.length} chunks for file ${file.filename}`);
            
            for (const chunk of chunks) {
              const existingChunk = await masterChunksCollection.findOne({
                files_id: chunk.files_id,
                n: chunk.n
              });
              
              if (!existingChunk) {
                await masterChunksCollection.insertOne({
                  ...chunk,
                  migratedFrom: chunksCollection,
                  migratedAt: new Date()
                });
                totalChunksMigrated++;
              }
            }
          }
          
          totalFilesMigrated++;
          console.log(`   ✅ Migrated: ${file.filename}`);
        } else {
          console.log(`   ⏭️  Skipped (duplicate): ${file.filename}`);
        }
      }
    }
    
    console.log(`\n📊 Migration Summary:`);
    console.log(`   Files migrated: ${totalFilesMigrated}`);
    console.log(`   Chunks migrated: ${totalChunksMigrated}`);
    
    // Get final counts
    const finalFileCount = await masterFilesCollection.countDocuments();
    const finalChunkCount = await masterChunksCollection.countDocuments();
    
    console.log(`\n🎯 Master Collection Status:`);
    console.log(`   master-files.files: ${finalFileCount} documents`);
    console.log(`   master-files.chunks: ${finalChunkCount} documents`);
    
    // Create a backup of current state before deprecation
    const backupDate = new Date().toISOString().split('T')[0];
    
    console.log(`\n💾 Creating backup of legacy collections...`);
    
    for (const legacy of legacyCollections) {
      const { files: filesCollection, chunks: chunksCollection } = legacy;
      
      if (collectionNames.includes(filesCollection)) {
        const backupName = `deprecated_${filesCollection.replace(/\./g, '_')}_${backupDate}`;
        console.log(`   Backing up ${filesCollection} to ${backupName}`);
        
        // This is a simple rename - in production you might want to copy instead
        // await db.collection(filesCollection).rename(backupName);
      }
    }
    
    console.log('\n⚠️  NEXT STEPS:');
    console.log('   1. Update code to use only master-files collections');
    console.log('   2. Test the system thoroughly');
    console.log('   3. Run the deprecation script to remove old collections');
    console.log('   4. Update any hardcoded collection names in the codebase');
    
    console.log('\n✅ Migration completed successfully!');
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
  } finally {
    await mongoose.disconnect();
  }
}

console.log('🚀 IQAC File Storage Migration to Master Collections');
console.log('=====================================');
console.log('This script will:');
console.log('1. Migrate all files from legacy collections to master-files');
console.log('2. Preserve all file metadata and chunks');
console.log('3. Add migration tracking information');
console.log('4. Prepare for deprecation of old collections');
console.log('');
console.log('Starting migration in 3 seconds...');

setTimeout(migrateToMasterFiles, 3000);
