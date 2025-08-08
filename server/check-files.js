const mongoose = require('mongoose');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/iqac_system');

async function checkFiles() {
  try {
    const db = mongoose.connection.db;
    
    console.log('\n=== Files Bucket ===');
    const filesCollection = await db.collection('files.files').find({}).toArray();
    filesCollection.forEach(file => {
      console.log(`ID: ${file._id}, Name: ${file.filename}, Upload Date: ${file.uploadDate}`);
    });
    
    console.log('\n=== Uploads Bucket ===');
    const uploadsCollection = await db.collection('uploads.files').find({}).toArray();
    uploadsCollection.forEach(file => {
      console.log(`ID: ${file._id}, Name: ${file.filename}, Upload Date: ${file.uploadDate}`);
    });
    
    console.log('\n=== Task Documents ===');
    const Task = require('./models/Task');
    const tasks = await Task.find({ status: 'completed' }).populate('assignedTo', 'firstName lastName email');
    
    tasks.forEach(task => {
      console.log(`Task: ${task.title}`);
      console.log(`User: ${task.assignedTo?.firstName} ${task.assignedTo?.lastName}`);
      task.documents.forEach(doc => {
        console.log(`  Document: ${doc.filename}, File ID: ${doc.fileId}`);
      });
    });
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    mongoose.connection.close();
  }
}

checkFiles();
