const mongoose = require('mongoose');
require('dotenv').config();

const User = require('./models/User');

async function updateUserNames() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to database');
    
    // Update users with proper names
    const updates = [
      { email: 'Samarth@gmail.com', firstName: 'Samarth', lastName: 'Kadam' },
      { email: 'admin@iqac.com', firstName: 'Admin', lastName: 'User' },
      { email: 'user@iqac.com', firstName: 'Regular', lastName: 'User' },
      { email: 'viewer@iqac.com', firstName: 'Viewer', lastName: 'User' },
      { email: 'test1@iqac.com', firstName: 'Test', lastName: 'User 1' },
      { email: 'test2@iqac.com', firstName: 'Test', lastName: 'User 2' },
      { email: 'test3@iqac.com', firstName: 'Test', lastName: 'User 3' },
      { email: 'test4@iqac.com', firstName: 'Test', lastName: 'User 4' }
    ];
    
    for (const update of updates) {
      const result = await User.updateOne(
        { email: update.email },
        { $set: { firstName: update.firstName, lastName: update.lastName } }
      );
      console.log(`Updated ${update.email}: ${result.modifiedCount} modified`);
    }
    
    console.log('\nVerifying updates:');
    const users = await User.find({}, 'email firstName lastName');
    users.forEach(user => {
      console.log(`- ${user.email}: ${user.firstName} ${user.lastName}`);
    });
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

updateUserNames();
