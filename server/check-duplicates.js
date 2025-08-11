const mongoose = require('mongoose');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://adminUser:adminPassword123@clusterusers.ac-dmzh4gk.mongodb.net/iqac-database?retryWrites=true&w=majority&appName=ClusterUsers';

async function checkDuplicateTasks() {
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
    console.log(`\n📋 Total tasks: ${allTasks.length}`);
    
    if (allTasks.length > 0) {
      console.log('\n📝 All tasks:');
      allTasks.forEach((task, index) => {
        console.log(`${index + 1}. ID: ${task._id}`);
        console.log(`   Type: ${task.assignmentType}`);
        console.log(`   Initiator: ${task.assignedToInitiator}`);
        console.log(`   Reviewer: ${task.assignedToReviewer}`);
        console.log(`   Course: ${task.courseCode} - ${task.courseName}`);
        console.log(`   Deadline: ${task.deadline}`);
        console.log(`   Created: ${task.createdAt}`);
        console.log('');
      });
      
      // Find potential duplicates
      const duplicates = [];
      for (let i = 0; i < allTasks.length; i++) {
        for (let j = i + 1; j < allTasks.length; j++) {
          const task1 = allTasks[i];
          const task2 = allTasks[j];
          
          if (task1.assignedToInitiator === task2.assignedToInitiator &&
              task1.assignedToReviewer === task2.assignedToReviewer &&
              task1.assignmentType === task2.assignmentType &&
              task1.courseCode === task2.courseCode &&
              task1.deadline === task2.deadline) {
            duplicates.push({ task1: task1._id, task2: task2._id });
          }
        }
      }
      
      if (duplicates.length > 0) {
        console.log('🔍 Found duplicate tasks:');
        duplicates.forEach(dup => {
          console.log(`   ${dup.task1} and ${dup.task2}`);
        });
        
        console.log('\n🗑️ Do you want to clean up duplicates? (This script only reports them)');
      } else {
        console.log('✅ No duplicate tasks found');
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
  }
}

checkDuplicateTasks();
