const mongoose = require('mongoose');
require('dotenv').config();

const Task = require('./models/Task');

async function resetTaskReviewerApprovals() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Find the most recent task (the one you're testing with)
    const task = await Task.findOne().sort({ createdAt: -1 });
    
    if (!task) {
      console.log('No tasks found');
      return;
    }

    console.log(`Found task: ${task._id} - ${task.title}`);
    console.log('Current reviewer approvals:', task.reviewerApprovals);

    // Clear all reviewer approvals
    task.reviewerApprovals = [];
    task.status = 'file-uploaded'; // Reset status to allow reviews
    
    await task.save();
    console.log('Task reviewer approvals cleared successfully');
    console.log('Task status reset to: file-uploaded');
    console.log('Both reviewers can now approve this task again');

  } catch (error) {
    console.error('Error resetting task reviewer approvals:', error);
  } finally {
    await mongoose.disconnect();
  }
}

resetTaskReviewerApprovals();
