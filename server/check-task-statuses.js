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
  status: String,
  fileUrl: String,
  fileName: String
}, { collection: 'tasks' });

const Task = mongoose.model('Task', taskSchema);

const checkTaskStatuses = async () => {
  try {
    console.log('🔍 Checking all task statuses...');
    
    const tasks = await Task.find({}).sort({ createdAt: -1 });
    
    console.log(`📋 Found ${tasks.length} total tasks`);
    
    tasks.forEach(task => {
      console.log(`\n📄 Task: "${task.title}"`);
      console.log(`   ID: ${task._id}`);
      console.log(`   Status: ${task.status}`);
      console.log(`   Has File: ${!!(task.fileUrl || task.fileName)}`);
      console.log(`   Reviewer Approvals: ${task.reviewerApprovals?.length || 0}`);
      
      if (task.reviewerApprovals && task.reviewerApprovals.length > 0) {
        task.reviewerApprovals.forEach((approval, index) => {
          console.log(`     Approval ${index + 1}: ${approval.status}`);
        });
      }
      
      // Check if this should show admin approval button
      const hasApprovedReviews = task.reviewerApprovals && 
                                task.reviewerApprovals.some(approval => approval.status === 'approved');
      const hasReviews = task.status === 'approved-by-reviewer' || 
                        task.status === 'partially-approved' ||
                        hasApprovedReviews;
      const hasFile = !!(task.fileUrl || task.fileName);
      const shouldShowAdminApproval = hasReviews && hasFile;
      
      console.log(`   Should show admin approval: ${shouldShowAdminApproval}`);
      console.log(`     - Has reviews: ${hasReviews}`);
      console.log(`     - Has file: ${hasFile}`);
    });
    
  } catch (error) {
    console.error('❌ Error checking tasks:', error);
  } finally {
    mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
  }
};

// Run the check
connectDB().then(checkTaskStatuses);
