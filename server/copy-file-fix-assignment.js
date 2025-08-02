const mongoose = require('mongoose');
const { GridFSBucket } = require('mongodb');
require('dotenv').config();

const User = require('./models/User');
const Task = require('./models/Task');

async function copyFileAndFixAssignment() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to database');
    
    const db = mongoose.connection.db;
    const bucket = new GridFSBucket(db, { bucketName: 'uploads' });
    
    const realFileId = '688cbc0dd6f88c6cdae48f25';
    const dummyFileId = '507f1f77bcf86cd799439011';
    
    console.log('Copying file...');
    
    // Create streams for copying
    const downloadStream = bucket.openDownloadStream(new mongoose.Types.ObjectId(realFileId));
    const uploadStream = bucket.openUploadStream('Course_Syllabus_Document_Copy.pdf', {
      metadata: {
        originalName: 'Course_Syllabus_Document_Copy.pdf',
        courseCode: 'CS101',
        uploadedAt: new Date()
      }
    });
    
    // Copy the file
    await new Promise((resolve, reject) => {
      downloadStream.pipe(uploadStream);
      
      uploadStream.on('error', reject);
      uploadStream.on('finish', () => {
        console.log('File copied successfully!');
        console.log('New file ID:', uploadStream.id.toString());
        resolve();
      });
      
      downloadStream.on('error', (error) => {
        console.error('Error reading original file:', error);
        reject(error);
      });
    });
    
    // Update the assignment with the new file ID
    const newFileId = uploadStream.id.toString();
    await Task.updateOne(
      { fileId: dummyFileId },
      { $set: { fileId: newFileId } }
    );
    
    console.log('Updated assignment with new file ID');
    
    // Verify the update
    const updatedAssignment = await Task.findOne({ fileId: newFileId })
      .populate('assignedToInitiator', 'firstName lastName email')
      .populate('assignedToReviewer', 'firstName lastName email');
      
    console.log('Updated assignment:');
    console.log(`- Title: ${updatedAssignment.title}`);
    console.log(`- FileId: ${updatedAssignment.fileId}`);
    console.log(`- Initiator: ${updatedAssignment.assignedToInitiator?.firstName} ${updatedAssignment.assignedToInitiator?.lastName}`);
    console.log(`- Reviewer: ${updatedAssignment.assignedToReviewer?.firstName} ${updatedAssignment.assignedToReviewer?.lastName}`);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

copyFileAndFixAssignment();
