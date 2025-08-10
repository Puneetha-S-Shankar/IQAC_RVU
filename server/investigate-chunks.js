const mongoose = require('mongoose');
require('dotenv').config({ path: './config/.env' });

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://IamSamk:2gRB01wOhNhKIqvP@iqac.mlrfsfs.mongodb.net/IQAC?retryWrites=true&w=majority&appName=IQAC';

async function investigateFileChunks() {
  try {
    console.log('🔍 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB Atlas');
    
    const db = mongoose.connection.db;
    
    // Get all file storage collections
    console.log('\n📊 INVESTIGATING FILE/CHUNK RELATIONSHIP\n');
    
    // Check master-files bucket
    console.log('🎯 MASTER-FILES BUCKET:');
    const masterFiles = await db.collection('master-files.files').find().toArray();
    const masterChunks = await db.collection('master-files.chunks').find().toArray();
    
    console.log(`📁 Files: ${masterFiles.length} documents`);
    console.log(`🧩 Chunks: ${masterChunks.length} documents`);
    
    console.log('\n📋 DETAILED FILE ANALYSIS:');
    let totalExpectedChunks = 0;
    
    for (const file of masterFiles) {
      const fileChunks = await db.collection('master-files.chunks').find({ files_id: file._id }).toArray();
      const expectedChunks = Math.ceil(file.length / file.chunkSize);
      totalExpectedChunks += expectedChunks;
      
      console.log(`\n📄 File: ${file.filename}`);
      console.log(`   Size: ${(file.length / 1024).toFixed(2)} KB`);
      console.log(`   Chunk Size: ${(file.chunkSize / 1024).toFixed(0)} KB`);
      console.log(`   Expected Chunks: ${expectedChunks}`);
      console.log(`   Actual Chunks: ${fileChunks.length}`);
      console.log(`   Upload Date: ${file.uploadDate}`);
      
      if (expectedChunks !== fileChunks.length) {
        console.log(`   ⚠️  MISMATCH: Expected ${expectedChunks}, Found ${fileChunks.length}`);
      } else {
        console.log(`   ✅ CORRECT: Chunks match expected count`);
      }
    }
    
    console.log('\n📊 SUMMARY:');
    console.log(`Total Files: ${masterFiles.length}`);
    console.log(`Total Chunks: ${masterChunks.length}`);
    console.log(`Expected Chunks: ${totalExpectedChunks}`);
    
    if (masterChunks.length === totalExpectedChunks) {
      console.log('✅ File/Chunk count is CORRECT - larger files create multiple chunks');
    } else {
      console.log('⚠️  File/Chunk count MISMATCH detected');
    }
    
    // Check legacy buckets
    console.log('\n📊 LEGACY BUCKETS:');
    
    const legacyFiles = await db.collection('files.files').find().toArray();
    const legacyChunks = await db.collection('files.chunks').find().toArray();
    console.log(`Legacy files bucket: ${legacyFiles.length} files, ${legacyChunks.length} chunks`);
    
    const uploadsFiles = await db.collection('uploads.files').find().toArray();
    const uploadsChunks = await db.collection('uploads.chunks').find().toArray();
    console.log(`Legacy uploads bucket: ${uploadsFiles.length} files, ${uploadsChunks.length} chunks`);
    
    const totalFiles = masterFiles.length + legacyFiles.length + uploadsFiles.length;
    const totalChunks = masterChunks.length + legacyChunks.length + uploadsChunks.length;
    console.log(`\nGRAND TOTAL: ${totalFiles} files, ${totalChunks} chunks across all buckets`);
    
    // Show collections
    console.log('\n📋 ALL COLLECTIONS:');
    const collections = await db.listCollections().toArray();
    for (const col of collections) {
      const count = await db.collection(col.name).countDocuments();
      console.log(`   ${col.name}: ${count} documents`);
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

investigateFileChunks();
