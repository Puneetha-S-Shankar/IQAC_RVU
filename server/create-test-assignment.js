const mongoose = require('mongoose');
require('dotenv').config();

const User = require('./models/User');
const Task = require('./models/Task');

async function createTestAssignment() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to database');
    
    // Find test users
    const test3 = await User.findOne({ email: 'test3@iqac.com' });
    const test4 = await User.findOne({ email: 'test4@iqac.com' });
    
    if (!test3 || !test4) {
      console.error('Test users not found');
      return;
    }
    
    // Create a new completed assignment
    const newAssignment = new Task({
      courseCode: 'CS101',
      courseName: 'DSCA',
      title: 'Course Syllabus Document',
      description: 'Complete course syllabus and curriculum document',
      assignedToInitiator: test4._id,
      assignedToReviewer: test3._id,
      assignedBy: test3._id,
      status: 'completed',
      fileId: '507f1f77bcf86cd799439011', // Dummy file ID
      deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      year: 2025,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    await newAssignment.save();
    console.log('Created new completed assignment:', newAssignment.title);
    
    // Verify we have multiple completed assignments now
    const completed = await Task.find({ status: 'completed' })
      .populate('assignedToInitiator', 'firstName lastName email')
      .populate('assignedToReviewer', 'firstName lastName email');
      
    console.log(`\nTotal completed assignments: ${completed.length}`);
    completed.forEach((assignment, index) => {
      console.log(`${index + 1}. ${assignment.courseCode} - ${assignment.title}`);
      console.log(`   Initiator: ${assignment.assignedToInitiator?.firstName} ${assignment.assignedToInitiator?.lastName}`);
      console.log(`   Reviewer: ${assignment.assignedToReviewer?.firstName} ${assignment.assignedToReviewer?.lastName}`);
    });
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

createTestAssignment();
