const { MongoClient, GridFSBucket } = require('mongodb');
require('dotenv').config();

class MongoDB {
  constructor() {
    this.client = null;
    this.db = null;
    this.bucket = null;
    this.isConnected = false;
  }

  async connect() {
    try {
      const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/iqac';
      this.client = new MongoClient(uri, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });

      await this.client.connect();
      this.db = this.client.db();
      this.bucket = new GridFSBucket(this.db, {
        bucketName: 'files'
      });
      this.isConnected = true;

      console.log('✅ Connected to MongoDB successfully');
      
      // Create indexes for better performance
      await this.createIndexes();
      
      return this.db;
    } catch (error) {
      console.error('❌ MongoDB connection error:', error);
      throw error;
    }
  }

  async createIndexes() {
    try {
      // Users collection indexes
      await this.db.collection('users').createIndex({ email: 1 }, { unique: true });
      await this.db.collection('users').createIndex({ username: 1 }, { unique: true });
      
      // Files collection indexes
      await this.db.collection('files.files').createIndex({ 'metadata.programme': 1 });
      await this.db.collection('files.files').createIndex({ 'metadata.docLevel': 1 });
      await this.db.collection('files.files').createIndex({ 'metadata.year': 1 });
      await this.db.collection('files.files').createIndex({ 'metadata.docType': 1 });
      await this.db.collection('files.files').createIndex({ 'metadata.uploadedBy': 1 });
      
      // Curriculum collection indexes
      await this.db.collection('curriculum').createIndex({ programme: 1 });
      await this.db.collection('curriculum').createIndex({ year: 1 });
      
      // Reports collection indexes
      await this.db.collection('reports').createIndex({ type: 1 });
      await this.db.collection('reports').createIndex({ createdAt: -1 });
      
      console.log('✅ Database indexes created successfully');
    } catch (error) {
      console.error('❌ Error creating indexes:', error);
    }
  }

  async disconnect() {
    if (this.client) {
      await this.client.close();
      this.isConnected = false;
      console.log('✅ Disconnected from MongoDB');
    }
  }

  getDatabase() {
    return this.db;
  }

  getBucket() {
    return this.bucket;
  }

  isConnected() {
    return this.isConnected;
  }
}

// Create singleton instance
const mongoDB = new MongoDB();

module.exports = mongoDB; 