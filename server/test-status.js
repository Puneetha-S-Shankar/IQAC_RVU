const mongoose = require('mongoose');
const User = require('./models/User');
const Task = require('./models/Task');

mongoose.connect('mongodb+srv://samarthkadam:Samarth%40123@cluster0.e3qvw.mongodb.net/IQAC?retryWrites=true&w=majority&appName=Cluster0')
.then(async () => {
  console.log('✅ Connected to MongoDB');
  
  // Check if test3 user can login now
  const test3User = await User.findOne({ email: 'test3@iqac.com' });
  console.log('Test3 user found:', test3User ? '✅ Yes' : '❌ No');
  if (test3User) {
    console.log('Test3 user password starts with:', test3User.password.substring(0, 10) + '...');
    console.log('Password is bcrypt encrypted:', test3User.password.startsWith('$2b$') ? '✅ Yes' : '❌ No');
  }
  
  // Check current assignments count
  const totalAssignments = await Task.countDocuments();
  console.log('Total assignments in database:', totalAssignments);
  
  // Check for duplicate assignments (same initiator and reviewer)
  const duplicateAssignments = await Task.find({
    $expr: { $eq: ['$assignedToInitiator', '$assignedToReviewer'] }
  });
  console.log('Duplicate assignments found:', duplicateAssignments.length);
  
  // Check some assignment statuses
  const assignmentStatuses = await Task.aggregate([
    { $group: { _id: '$status', count: { $sum: 1 } } },
    { $sort: { count: -1 } }
  ]);
  console.log('Assignment statuses:');
  assignmentStatuses.forEach(status => {
    console.log(`  ${status._id}: ${status.count}`);
  });
  
  mongoose.connection.close();
  console.log('✅ Database test completed');
})
.catch(err => {
  console.error('❌ Database connection error:', err);
  process.exit(1);
});
