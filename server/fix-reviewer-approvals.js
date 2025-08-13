const mongoose = require('mongoose');
require('dotenv').config();

const Task = require('./models/Task');

async function fixReviewerApprovals() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Find tasks with corrupted reviewer approvals
    const tasks = await Task.find({
      'reviewerApprovals.reviewerId': { $type: 'string' }
    });

    console.log(`Found ${tasks.length} tasks with corrupted reviewer approvals`);

    for (const task of tasks) {
      console.log(`\nFixing task: ${task._id}`);
      console.log('Before fix:', task.reviewerApprovals);

      // Remove all corrupted entries (where reviewerId is a string)
      task.reviewerApprovals = task.reviewerApprovals.filter(approval => {
        const isCorrupted = typeof approval.reviewerId === 'string' && approval.reviewerId.includes('_id:');
        if (isCorrupted) {
          console.log('Removing corrupted entry:', approval.reviewerId);
        }
        return !isCorrupted;
      });

      console.log('After cleanup:', task.reviewerApprovals);

      await task.save();
      console.log(`Task ${task._id} fixed successfully`);
    }

    console.log('\nAll tasks fixed!');
  } catch (error) {
    console.error('Error fixing reviewer approvals:', error);
  } finally {
    await mongoose.disconnect();
  }
}

fixReviewerApprovals();
