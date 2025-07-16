const bcrypt = require('bcryptjs');
const mongoDB = require('./config/database');
const database = require('./services/database');

async function setupDatabase() {
  try {
    console.log('🚀 Setting up MongoDB database...');
    
    // Connect to MongoDB
    await mongoDB.connect();
    const db = mongoDB.getDatabase();
    
    // Create default users
    const defaultUsers = [
      {
        username: 'admin',
        email: 'admin@iqac.com',
        password: 'admin123',
        role: 'admin',
        firstName: 'Admin',
        lastName: 'User',
        isActive: true
      },
      {
        username: 'user',
        email: 'user@iqac.com',
        password: 'user123',
        role: 'user',
        firstName: 'Regular',
        lastName: 'User',
        isActive: true
      },
      {
        username: 'viewer',
        email: 'viewer@iqac.com',
        password: 'viewer123',
        role: 'viewer',
        firstName: 'Viewer',
        lastName: 'User',
        isActive: true
      }
    ];

    console.log('👥 Creating default users...');
    
    for (const userData of defaultUsers) {
      // Check if user already exists
      const existingUser = await db.collection('users').findOne({ 
        $or: [{ email: userData.email }, { username: userData.username }] 
      });
      
      if (!existingUser) {
        // Hash password
        userData.password = await bcrypt.hash(userData.password, 12);
        userData.createdAt = new Date();
        userData.lastLogin = new Date();
        
        await db.collection('users').insertOne(userData);
        console.log(`✅ Created user: ${userData.username}`);
      } else {
        console.log(`⏭️  User already exists: ${userData.username}`);
      }
    }

    // Create collections if they don't exist
    const collections = ['curriculum', 'reports'];
    for (const collectionName of collections) {
      const collectionExists = await db.listCollections({ name: collectionName }).hasNext();
      if (!collectionExists) {
        await db.createCollection(collectionName);
        console.log(`✅ Created collection: ${collectionName}`);
      } else {
        console.log(`⏭️  Collection already exists: ${collectionName}`);
      }
    }

    console.log('✅ Database setup completed successfully!');
    console.log('\n📋 Default login credentials:');
    console.log('Admin: admin@iqac.com / admin123');
    console.log('User: user@iqac.com / user123');
    console.log('Viewer: viewer@iqac.com / viewer123');
    
  } catch (error) {
    console.error('❌ Database setup failed:', error);
    process.exit(1);
  } finally {
    await mongoDB.disconnect();
  }
}

// Run setup if this file is executed directly
if (require.main === module) {
  setupDatabase();
}

module.exports = setupDatabase; 