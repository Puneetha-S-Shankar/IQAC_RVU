const mongoose = require('mongoose');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://adminUser:adminPassword123@clusterusers.ac-dmzh4gk.mongodb.net/iqac-database?retryWrites=true&w=majority&appName=ClusterUsers';

async function cleanupTasks() {
  try {
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 10000,
      connectTimeoutMS: 10000,
      socketTimeoutMS: 10000,
      maxPoolSize: 5,
      retryWrites: true,
      w: 'majority'
    });
    
    console.log('Connected to MongoDB');
    
    const db = mongoose.connection.db;
    const tasksCollection = db.collection('tasks');
    
    // Get all tasks
    const allTasks = await tasksCollection.find({}).toArray();
    console.log(`\n📋 Total tasks before cleanup: ${allTasks.length}`);
    
    if (allTasks.length === 0) {
      console.log('No tasks to clean up');
      return;
    }
    
    // Find and remove near-duplicate tasks (same initiator, reviewer, course, and very close timestamps)
    const toDelete = [];
    const processed = new Set();
    
    for (let i = 0; i < allTasks.length; i++) {
      if (processed.has(i)) continue;
      
      const task1 = allTasks[i];
      const task1Time = new Date(task1.createdAt).getTime();
      
      for (let j = i + 1; j < allTasks.length; j++) {
        if (processed.has(j)) continue;
        
        const task2 = allTasks[j];
        const task2Time = new Date(task2.createdAt).getTime();
        
        // Check if tasks are similar and created within 1 hour of each other
        if (task1.assignedToInitiator === task2.assignedToInitiator &&
            task1.assignedToReviewer === task2.assignedToReviewer &&
            task1.courseCode === task2.courseCode &&
            task1.deadline === task2.deadline &&
            Math.abs(task1Time - task2Time) < 3600000) { // 1 hour
          
          console.log(`🔍 Found near-duplicate tasks:`);
          console.log(`   Task 1: ${task1._id} (${task1.createdAt})`);
          console.log(`   Task 2: ${task2._id} (${task2.createdAt})`);
          
          // Keep the older one, mark newer for deletion
          if (task1Time < task2Time) {
            toDelete.push(task2._id);
            processed.add(j);
          } else {
            toDelete.push(task1._id);
            processed.add(i);
            break;
          }
        }
      }
    }
    
    if (toDelete.length > 0) {
      console.log(`\n🗑️ Deleting ${toDelete.length} near-duplicate tasks...`);
      
      for (const taskId of toDelete) {
        await tasksCollection.deleteOne({ _id: taskId });
        console.log(`   Deleted task: ${taskId}`);
      }
    }
    
    // Update all remaining tasks to set default assignmentType if missing
    const updateResult = await tasksCollection.updateMany(
      { assignmentType: { $in: [null, undefined] } },
      { $set: { assignmentType: 'course-material' } }
    );
    
    console.log(`\n📝 Updated ${updateResult.modifiedCount} tasks with missing assignmentType`);
    
    // Get final count
    const finalCount = await tasksCollection.countDocuments();
    console.log(`\n📋 Total tasks after cleanup: ${finalCount}`);
    
    console.log('\n✅ Cleanup completed successfully');
    
  } catch (error) {
    console.error('❌ Error during cleanup:', error.message);
  } finally {
    await mongoose.disconnect();
  }
}

// Ask for confirmation before running
console.log('⚠️  This script will:');
console.log('   1. Remove near-duplicate tasks (same users, course, deadline within 1 hour)');
console.log('   2. Set default assignmentType for tasks with missing type');
console.log('');
console.log('🚀 Starting cleanup in 3 seconds...');

setTimeout(cleanupTasks, 3000);
