const mongoose = require('mongoose');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://adminUser:adminPassword123@clusterusers.ac-dmzh4gk.mongodb.net/iqac-database?retryWrites=true&w=majority&appName=ClusterUsers';

async function testConnection() {
  console.log('Testing MongoDB connection...');
  console.log('URI:', MONGODB_URI.replace(/\/\/.*@/, '//***:***@')); // Hide credentials
  
  try {
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 10000,
      connectTimeoutMS: 10000,
      socketTimeoutMS: 10000,
      maxPoolSize: 5,
      retryWrites: true,
      w: 'majority'
    });
    
    console.log('✅ MongoDB connected successfully!');
    
    // Test database operations
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('📁 Available collections:', collections.map(c => c.name));
    
    // Test ping
    const adminDb = mongoose.connection.db.admin();
    const pingResult = await adminDb.ping();
    console.log('🏓 Ping result:', pingResult);
    
  } catch (error) {
    console.error('❌ MongoDB connection failed:');
    console.error('Error type:', error.constructor.name);
    console.error('Error message:', error.message);
    
    if (error.message.includes('ENOTFOUND')) {
      console.error('🌐 DNS resolution failed - check network connectivity');
    } else if (error.message.includes('authentication')) {
      console.error('🔐 Authentication failed - check credentials');
    } else if (error.message.includes('timeout')) {
      console.error('⏱️ Connection timeout - check firewall/network');
    }
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

testConnection();
