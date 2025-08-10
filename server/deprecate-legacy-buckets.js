const mongoose = require('mongoose');
require('dotenv').config({ path: './config/.env' });

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://IamSamk:2gRB01wOhNhKIqvP@iqac.mlrfsfs.mongodb.net/IQAC?retryWrites=true&w=majority&appName=IQAC';

async function deprecateLegacyBuckets() {
  try {
    console.log('🔍 Starting Legacy Bucket Deprecation Process...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB Atlas');
    
    const db = mongoose.connection.db;
    
    // Step 1: Backup legacy collections
    console.log('\n📦 STEP 1: Creating Backup Collections');
    
    const backupDate = new Date().toISOString().split('T')[0];
    
    // Backup files bucket
    const legacyFiles = await db.collection('files.files').find().toArray();
    const legacyChunks = await db.collection('files.chunks').find().toArray();
    
    if (legacyFiles.length > 0) {
      await db.collection(`backup_files_files_${backupDate}`).insertMany(legacyFiles);
      console.log(`✅ Backed up ${legacyFiles.length} files.files documents`);
    }
    
    if (legacyChunks.length > 0) {
      await db.collection(`backup_files_chunks_${backupDate}`).insertMany(legacyChunks);
      console.log(`✅ Backed up ${legacyChunks.length} files.chunks documents`);
    }
    
    // Backup uploads bucket
    const uploadsFiles = await db.collection('uploads.files').find().toArray();
    const uploadsChunks = await db.collection('uploads.chunks').find().toArray();
    
    if (uploadsFiles.length > 0) {
      await db.collection(`backup_uploads_files_${backupDate}`).insertMany(uploadsFiles);
      console.log(`✅ Backed up ${uploadsFiles.length} uploads.files documents`);
    }
    
    if (uploadsChunks.length > 0) {
      await db.collection(`backup_uploads_chunks_${backupDate}`).insertMany(uploadsChunks);
      console.log(`✅ Backed up ${uploadsChunks.length} uploads.chunks documents`);
    }
    
    // Step 2: Verify master-files has all content
    console.log('\n🔍 STEP 2: Verifying Master-Files Bucket Integrity');
    
    const masterFiles = await db.collection('master-files.files').find().toArray();
    const masterChunks = await db.collection('master-files.chunks').find().toArray();
    
    console.log(`📁 Master-files bucket: ${masterFiles.length} files, ${masterChunks.length} chunks`);
    
    let canProceed = true;
    
    // Check if we have sufficient content in master-files
    if (masterFiles.length === 0) {
      console.log('❌ ERROR: No files in master-files bucket! Cannot proceed with deprecation.');
      canProceed = false;
    }
    
    if (masterChunks.length === 0) {
      console.log('❌ ERROR: No chunks in master-files bucket! Cannot proceed with deprecation.');
      canProceed = false;
    }
    
    // Verify chunk integrity
    for (const file of masterFiles) {
      const fileChunks = await db.collection('master-files.chunks').find({ files_id: file._id }).toArray();
      const expectedChunks = Math.ceil(file.length / file.chunkSize);
      
      if (fileChunks.length !== expectedChunks) {
        console.log(`❌ ERROR: File ${file.filename} has ${fileChunks.length} chunks, expected ${expectedChunks}`);
        canProceed = false;
      }
    }
    
    if (!canProceed) {
      console.log('\n🚫 DEPRECATION ABORTED: Data integrity issues detected.');
      console.log('Please resolve the issues above before proceeding.');
      return;
    }
    
    console.log('✅ Master-files bucket integrity verified');
    
    // Step 3: Final confirmation
    console.log('\n⚠️  FINAL CONFIRMATION REQUIRED:');
    console.log('This action will PERMANENTLY DELETE legacy buckets:');
    console.log(`   - files bucket: ${legacyFiles.length} files, ${legacyChunks.length} chunks`);
    console.log(`   - uploads bucket: ${uploadsFiles.length} files, ${uploadsChunks.length} chunks`);
    console.log('');
    console.log('Backups created:');
    console.log(`   - backup_files_files_${backupDate}`);
    console.log(`   - backup_files_chunks_${backupDate}`);
    console.log(`   - backup_uploads_files_${backupDate}`);
    console.log(`   - backup_uploads_chunks_${backupDate}`);
    console.log('');
    console.log('🎯 TO PROCEED WITH DELETION:');
    console.log('   Uncomment the deletion code below and run again.');
    console.log('');
    console.log('⚠️  WARNING: This action cannot be undone!');
    
    // UNCOMMENT BELOW TO ACTUALLY DELETE
    /*
    console.log('\n🗑️  STEP 3: Deleting Legacy Buckets');
    
    // Delete legacy files bucket
    await db.collection('files.files').drop();
    await db.collection('files.chunks').drop();
    console.log('✅ Deleted files bucket');
    
    // Delete legacy uploads bucket
    await db.collection('uploads.files').drop();
    await db.collection('uploads.chunks').drop();
    console.log('✅ Deleted uploads bucket');
    
    console.log('\n🎉 DEPRECATION COMPLETE!');
    console.log('Only master-files bucket remains for file storage.');
    */
    
    // Show final state
    console.log('\n📊 CURRENT STATE:');
    const collections = await db.listCollections().toArray();
    const fileCollections = collections.filter(c => 
      c.name.includes('files') || 
      c.name.includes('chunks') || 
      c.name.includes('uploads') ||
      c.name.includes('master-files')
    );
    
    for (const col of fileCollections) {
      const count = await db.collection(col.name).countDocuments();
      const status = col.name.includes('backup') ? '🗂️  BACKUP' : 
                     col.name.includes('master-files') ? '✅ ACTIVE' : '⚠️  LEGACY';
      console.log(`   ${status} ${col.name}: ${count} documents`);
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

deprecateLegacyBuckets();
