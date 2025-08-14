const { MongoClient } = require('mongodb');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI;

console.log('🔍 Testing MongoDB connection...');
console.log('📍 MongoDB URI:', MONGODB_URI ? 'Present' : 'Missing');
console.log('📍 URI starts with:', MONGODB_URI ? MONGODB_URI.substring(0, 20) + '...' : 'N/A');

async function testConnection() {
  const client = new MongoClient(MONGODB_URI, {
    serverSelectionTimeoutMS: 5000,
    connectTimeoutMS: 10000,
  });
  
  try {
    console.log('🔌 Attempting to connect...');
    await client.connect();
    console.log('✅ Connected to MongoDB Atlas successfully!');
    
    const db = client.db('IQAC');
    
    // Test basic operations
    console.log('\n📊 Testing database operations...');
    
    // List collections
    const collections = await db.listCollections().toArray();
    console.log(`📁 Found ${collections.length} collections:`, collections.map(c => c.name));
    
    // Count users
    const userCount = await db.collection('users').countDocuments();
    console.log(`👥 Users: ${userCount}`);
    
    // Count notifications
    const notificationCount = await db.collection('notifications').countDocuments();
    console.log(`🔔 Notifications: ${notificationCount}`);
    
    // Get sample notification
    const sampleNotification = await db.collection('notifications').findOne();
    if (sampleNotification) {
      console.log(`📋 Sample notification:`, {
        id: sampleNotification._id,
        userId: sampleNotification.userId,
        title: sampleNotification.title,
        type: sampleNotification.type,
        isRead: sampleNotification.isRead
      });
    }
    
    console.log('\n✅ Database test completed successfully!');
    
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    
    if (error.message.includes('ECONNREFUSED')) {
      console.log('\n🔧 Connection troubleshooting:');
      console.log('1. Check your internet connection');
      console.log('2. Verify MongoDB Atlas cluster is running');
      console.log('3. Check if IP address is whitelisted in Atlas');
      console.log('4. Verify the connection string is correct');
    }
    
    if (error.message.includes('authentication')) {
      console.log('\n🔐 Authentication troubleshooting:');
      console.log('1. Check username and password in connection string');
      console.log('2. Verify database user has proper permissions');
    }
    
  } finally {
    await client.close();
    console.log('🔌 Connection closed');
  }
}

testConnection().catch(console.error);
