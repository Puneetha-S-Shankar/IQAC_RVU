const mongoose = require('mongoose');
require('dotenv').config();

const User = require('./models/User');
const Task = require('./models/Task');

async function checkDatabase() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to database');
    
    // Check users
    console.log('\n=== USERS ===');
    const users = await User.find({}, 'name email courseCode role');
    users.forEach(user => {
      console.log(`- ${user.name} (${user.email}) - Course: ${user.courseCode || 'No course'} - Role: ${user.role}`);
    });
    
    // Check assignments
    console.log('\n=== ASSIGNMENTS ===');
    const assignments = await Task.find({})
      .populate('assignedToInitiator', 'name email')
      .populate('assignedToReviewer', 'name email')
      .populate('assignedBy', 'name email');
      
    if (assignments.length === 0) {
      console.log('No assignments found');
    } else {
      assignments.forEach(assignment => {
        console.log(`- ${assignment.courseCode || 'No course'} - ${assignment.title || assignment.courseName} - Status: ${assignment.status}`);
        console.log(`  Initiator: ${assignment.assignedToInitiator?.name || 'None'}`);
        console.log(`  Reviewer: ${assignment.assignedToReviewer?.name || 'None'}`);
        console.log(`  File: ${assignment.fileId ? 'Yes' : 'No'}`);
        console.log('');
      });
    }
    
    // Check completed assignments specifically
    console.log('\n=== COMPLETED ASSIGNMENTS ===');
    const completed = await Task.find({ status: 'completed' })
      .populate('assignedToInitiator', 'name email')
      .populate('assignedToReviewer', 'name email');
      
    if (completed.length === 0) {
      console.log('No completed assignments found');
    } else {
      completed.forEach(assignment => {
        console.log(`- ${assignment.courseCode} - ${assignment.title || assignment.courseName}`);
        console.log(`  Initiator: ${assignment.assignedToInitiator?.name}`);
        console.log(`  Reviewer: ${assignment.assignedToReviewer?.name}`);
      });
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

checkDatabase();
