const mongoose = require('mongoose');
const { GridFSBucket } = require('mongodb');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const Task = require('./models/Task');

async function fixAllAssignments() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to database');
    
    const db = mongoose.connection.db;
    const bucket = new GridFSBucket(db, { bucketName: 'uploads' });
    
    // List all files in GridFS
    console.log('Files in GridFS:');
    const files = await bucket.find().toArray();
    files.forEach(file => {
      console.log(`- ${file.filename} (ID: ${file._id})`);
    });
    
    // Upload another file for the first assignment
    const uploadsPath = path.join(__dirname, 'uploads');
    const localFiles = fs.readdirSync(uploadsPath);
    
    if (localFiles.length > 1) {
      const secondFile = path.join(uploadsPath, localFiles[1]);
      console.log(`\nUploading second file: ${localFiles[1]}`);
      
      const uploadStream = bucket.openUploadStream('Course_Document_2_Copy.pdf', {
        metadata: {
          originalName: 'Course_Document_2_Copy.pdf',
          courseCode: 'CS101',
          uploadedAt: new Date()
        }
      });
      
      await new Promise((resolve, reject) => {
        fs.createReadStream(secondFile).pipe(uploadStream);
        
        uploadStream.on('error', reject);
        uploadStream.on('finish', () => {
          console.log('Second file uploaded successfully!');
          console.log('New file ID:', uploadStream.id.toString());
          resolve();
        });
      });
      
      // Update the first assignment
      const newFileId = uploadStream.id.toString();
      await Task.updateOne(
        { fileId: '688cbc0dd6f88c6cdae48f25' },
        { $set: { fileId: newFileId } }
      );
      
      console.log('Updated first assignment with new file ID');
    }
    
    // Verify both assignments now have working files
    console.log('\nFinal verification:');
    const assignments = await Task.find({ status: 'completed' });
    for (const assignment of assignments) {
      console.log(`- ${assignment.title}: FileId ${assignment.fileId}`);
      
      // Check if file exists in GridFS
      try {
        const fileInfo = await bucket.find({ _id: new mongoose.Types.ObjectId(assignment.fileId) }).toArray();
        if (fileInfo.length > 0) {
          console.log(`  ✅ File exists: ${fileInfo[0].filename}`);
        } else {
          console.log(`  ❌ File not found in GridFS`);
        }
      } catch (error) {
        console.log(`  ❌ Invalid file ID format`);
      }
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

fixAllAssignments();
