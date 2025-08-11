const mongoose = require('mongoose');
const { GridFSBucket } = require('mongodb');

class DatabaseConfig {
  constructor() {
    this.isConnected = false;
    this.db = null;
    this.masterBucket = null;
  }

  async connect() {
    try {
      if (this.isConnected) {
        return;
      }

      const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/iqac_rvu';
      
      // Enhanced connection options for better reliability
      const options = {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        serverSelectionTimeoutMS: 30000, // Increase server selection timeout
        connectTimeoutMS: 30000, // Increase connection timeout
        socketTimeoutMS: 45000, // Increase socket timeout
        maxPoolSize: 10, // Maximum number of connections
        retryWrites: true,
      };
      
      await mongoose.connect(uri, options);

      this.db = mongoose.connection.db;
      this.masterBucket = new GridFSBucket(this.db, { bucketName: 'master-files' });
      this.isConnected = true;

      console.log('✅ MongoDB connected successfully');
      console.log(`📊 Database: ${this.db.databaseName}`);
      console.log(`📦 Master GridFS bucket: master-files`);
    } catch (error) {
      console.error('❌ MongoDB connection failed:', error.message);
      throw error;
    }
  }

  getDatabase() {
    if (!this.isConnected) {
      throw new Error('Database not connected. Call connect() first.');
    }
    return this.db;
  }

  getMasterBucket() {
    if (!this.isConnected) {
      throw new Error('Database not connected. Call connect() first.');
    }
    return this.masterBucket;
  }

  async disconnect() {
    if (this.isConnected) {
      await mongoose.disconnect();
      this.isConnected = false;
      this.db = null;
      this.masterBucket = null;
      console.log('🔌 MongoDB disconnected');
    }
  }
}

module.exports = new DatabaseConfig();
