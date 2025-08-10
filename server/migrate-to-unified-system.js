const mongoose = require('mongoose');
const { ObjectId } = require('mongodb');
require('dotenv').config();

// Import the new unified file service
const unifiedFileService = require('./services/unifiedFileService');

async function migrateToUnifiedSystem() {
  try {
    console.log('🚀 Starting migration to unified file system...');
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');
    
    // Initialize the unified file service
    await unifiedFileService.initialize();
    console.log('✅ Unified file service initialized');
    
    // Start migration
    await unifiedFileService.migrateExistingFiles();
    
    console.log('🎉 Migration completed successfully!');
    console.log('\n📊 New unified system is ready!');
    console.log('🔗 Use /api/unified-files endpoints for all file operations');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

// Run migration if this file is executed directly
if (require.main === module) {
  migrateToUnifiedSystem();
}

module.exports = migrateToUnifiedSystem;
