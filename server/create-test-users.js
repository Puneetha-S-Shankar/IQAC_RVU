const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('./models/User');
require('dotenv').config();

async function createTestUsers() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Check if users already exist
    const existingAdmin = await User.findOne({ email: 'admin@test.com' });
    const existingUser = await User.findOne({ email: 'user@test.com' });
    const existingViewer = await User.findOne({ email: 'viewer@test.com' });

    // Create admin user
    if (!existingAdmin) {
      const adminPassword = await bcrypt.hash('admin123', 10);
      const admin = new User({
        username: 'admin',
        email: 'admin@test.com',
        password: adminPassword,
        firstName: 'Admin',
        lastName: 'User',
        role: 'admin',
        isActive: true
      });
      await admin.save();
      console.log('✅ Admin user created: admin@test.com / admin123');
    } else {
      console.log('ℹ️ Admin user already exists');
    }

    // Create regular user
    if (!existingUser) {
      const userPassword = await bcrypt.hash('user123', 10);
      const user = new User({
        username: 'normaluser',
        email: 'user@test.com',
        password: userPassword,
        firstName: 'Normal',
        lastName: 'User',
        role: 'user',
        isActive: true
      });
      await user.save();
      console.log('✅ Regular user created: user@test.com / user123');
    } else {
      console.log('ℹ️ Regular user already exists');
    }

    // Create viewer user
    if (!existingViewer) {
      const viewerPassword = await bcrypt.hash('viewer123', 10);
      const viewer = new User({
        username: 'viewer',
        email: 'viewer@test.com',
        password: viewerPassword,
        firstName: 'Viewer',
        lastName: 'User',
        role: 'viewer',
        isActive: true
      });
      await viewer.save();
      console.log('✅ Viewer user created: viewer@test.com / viewer123');
    } else {
      console.log('ℹ️ Viewer user already exists');
    }

    console.log('\n🎉 Test users setup complete!');
    console.log('\nLogin credentials:');
    console.log('Admin: admin@test.com / admin123');
    console.log('User: user@test.com / user123');
    console.log('Viewer: viewer@test.com / viewer123');

  } catch (error) {
    console.error('❌ Error creating test users:', error);
  } finally {
    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');
  }
}

createTestUsers();
