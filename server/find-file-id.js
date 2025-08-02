const mongoose = require('mongoose');
require('dotenv').config();

const User = require('./models/User');
const Task = require('./models/Task');

async function findRealFileId() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to database');
    
    // Find the completed assignments
    const assignments = await Task.find({ status: 'completed' })
      .populate('assignedToInitiator', 'firstName lastName email')
      .populate('assignedToReviewer', 'firstName lastName email');
      
    console.log('Completed assignments:');
    assignments.forEach((assignment, index) => {
      console.log(`${index + 1}. ${assignment.courseCode} - ${assignment.title}`);
      console.log(`   FileId: ${assignment.fileId}`);
      console.log(`   Initiator: ${assignment.assignedToInitiator?.firstName} ${assignment.assignedToInitiator?.lastName}`);
      console.log(`   Reviewer: ${assignment.assignedToReviewer?.firstName} ${assignment.assignedToReviewer?.lastName}`);
      console.log('');
    });
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

findRealFileId();
