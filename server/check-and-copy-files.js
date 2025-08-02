const mongoose = require('mongoose');
const { GridFSBucket } = require('mongodb');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const Task = require('./models/Task');

async function checkFilesAndCopy() {
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
    
    // List local files
    console.log('\nFiles in uploads directory:');
    const uploadsPath = path.join(__dirname, 'uploads');
    const localFiles = fs.readdirSync(uploadsPath);
    localFiles.forEach(file => {
      console.log(`- ${file}`);
    });
    
    // If GridFS has files, use the first one
    if (files.length > 0) {
      const sourceFileId = files[0]._id.toString();
      console.log(`\nUsing GridFS file: ${files[0].filename} (${sourceFileId})`);
      
      // Copy the file
      const downloadStream = bucket.openDownloadStream(files[0]._id);
      const uploadStream = bucket.openUploadStream('Course_Syllabus_Document_Copy.pdf', {
        metadata: {
          originalName: 'Course_Syllabus_Document_Copy.pdf',
          courseCode: 'CS101',
          uploadedAt: new Date()
        }
      });
      
      await new Promise((resolve, reject) => {
        downloadStream.pipe(uploadStream);
        
        uploadStream.on('error', reject);
        uploadStream.on('finish', () => {
          console.log('File copied successfully!');
          console.log('New file ID:', uploadStream.id.toString());
          resolve();
        });
        
        downloadStream.on('error', reject);
      });
      
      // Update the dummy assignment
      const newFileId = uploadStream.id.toString();
      await Task.updateOne(
        { fileId: '507f1f77bcf86cd799439011' },
        { $set: { fileId: newFileId } }
      );
      
      console.log('Updated assignment with new file ID');
      
    } else if (localFiles.length > 0) {
      // Use a local file
      const localFile = path.join(uploadsPath, localFiles[0]);
      console.log(`\nUsing local file: ${localFiles[0]}`);
      
      const uploadStream = bucket.openUploadStream('Course_Syllabus_Document_Copy.pdf', {
        metadata: {
          originalName: 'Course_Syllabus_Document_Copy.pdf',
          courseCode: 'CS101',
          uploadedAt: new Date()
        }
      });
      
      await new Promise((resolve, reject) => {
        fs.createReadStream(localFile).pipe(uploadStream);
        
        uploadStream.on('error', reject);
        uploadStream.on('finish', () => {
          console.log('File uploaded successfully!');
          console.log('New file ID:', uploadStream.id.toString());
          resolve();
        });
      });
      
      // Update the dummy assignment
      const newFileId = uploadStream.id.toString();
      await Task.updateOne(
        { fileId: '507f1f77bcf86cd799439011' },
        { $set: { fileId: newFileId } }
      );
      
      console.log('Updated assignment with new file ID');
    } else {
      console.log('No files found to copy');
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

checkFilesAndCopy();
