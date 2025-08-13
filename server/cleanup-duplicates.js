const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://puneethaiqlabsinternproject:i8g4oq3fT5WBCfLQ@iqaccluster.rkxmw.mongodb.net/IQAC?retryWrites=true&w=majority&appName=IQACCluster');
    console.log('✅ MongoDB connected successfully');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

// Task schema (simplified)
const taskSchema = new mongoose.Schema({
  title: String,
  reviewerApprovals: [{
    reviewerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    comment: String,
    reviewedAt: Date
  }],
  status: String
}, { collection: 'tasks' });

const Task = mongoose.model('Task', taskSchema);

const cleanupDuplicates = async () => {
  try {
    console.log('🔍 Finding tasks with duplicate reviewer approvals...');
    
    const tasks = await Task.find({
      'reviewerApprovals.0': { $exists: true }
    });
    
    console.log(`📋 Found ${tasks.length} tasks with reviewer approvals`);
    
    for (const task of tasks) {
      const originalLength = task.reviewerApprovals.length;
      
      // Remove duplicates
      const seen = new Set();
      const uniqueApprovals = task.reviewerApprovals.filter(approval => {
        const id = approval.reviewerId.toString();
        if (seen.has(id)) {
          console.log(`🗑️  Removing duplicate approval for reviewer ${id} in task ${task.title}`);
          return false;
        }
        seen.add(id);
        return true;
      });
      
      if (uniqueApprovals.length !== originalLength) {
        task.reviewerApprovals = uniqueApprovals;
        await task.save();
        console.log(`✅ Fixed task "${task.title}" - removed ${originalLength - uniqueApprovals.length} duplicates`);
      }
    }
    
    console.log('🎉 Cleanup completed!');
    
    // Now update any tasks where a single reviewer has approved but status is still partially-approved
    console.log('🔄 Fixing status for single reviewer approvals...');
    
    const tasksToUpdate = await Task.find({
      status: 'partially-approved',
      'reviewerApprovals': { $size: 1 },
      'reviewerApprovals.status': 'approved'
    });
    
    for (const task of tasksToUpdate) {
      task.status = 'approved-by-reviewer';
      await task.save();
      console.log(`✅ Updated status for "${task.title}" from partially-approved to approved-by-reviewer`);
    }
    
  } catch (error) {
    console.error('❌ Error during cleanup:', error);
  } finally {
    mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
};

// Run the cleanup
connectDB().then(cleanupDuplicates);
