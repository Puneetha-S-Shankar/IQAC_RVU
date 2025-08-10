const mongoose = require('mongoose');
require('dotenv').config();

async function checkGridFSCollections() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to database');
    
    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    
    console.log('All collections:');
    collections.forEach(collection => {
      console.log(`- ${collection.name}`);
    });
    
    // Check which GridFS bucket has our files
    const filesBucket = collections.filter(c => c.name.includes('.files'));
    console.log('\nGridFS buckets found:');
    filesBucket.forEach(bucket => {
      console.log(`- ${bucket.name}`);
    });
    
    // Check files in each bucket
    for (const bucket of filesBucket) {
      const bucketName = bucket.name.replace('.files', '');
      console.log(`\nFiles in ${bucketName} bucket:`);
      
      const files = await db.collection(bucket.name).find().toArray();
      files.forEach(file => {
        console.log(`  - ${file.filename} (ID: ${file._id})`);
      });
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

checkGridFSCollections();
