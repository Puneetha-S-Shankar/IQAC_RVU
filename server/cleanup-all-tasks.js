const mongoose = require('mongoose');
require('dotenv').config();

const Task = require('./models/Task');
const Notification = require('./models/Notification');

async function cleanupAllTasks() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Count existing tasks and notifications
    const taskCount = await Task.countDocuments();
    const notificationCount = await Notification.countDocuments();
    
    console.log(`Found ${taskCount} tasks and ${notificationCount} notifications`);
    
    if (taskCount === 0 && notificationCount === 0) {
      console.log('No tasks or notifications to clean up!');
      return;
    }

    // Ask for confirmation (in a real script, but we'll proceed directly)
    console.log('Cleaning up all tasks and related notifications...');

    // Delete all tasks
    const taskDeleteResult = await Task.deleteMany({});
    console.log(`Deleted ${taskDeleteResult.deletedCount} tasks`);

    // Delete all notifications (since they reference tasks)
    const notificationDeleteResult = await Notification.deleteMany({});
    console.log(`Deleted ${notificationDeleteResult.deletedCount} notifications`);

    console.log('\n✅ Database cleanup completed successfully!');
    console.log('All tasks and notifications have been removed.');
    console.log('You can now start fresh with a clean database.');

  } catch (error) {
    console.error('Error during cleanup:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

cleanupAllTasks();
