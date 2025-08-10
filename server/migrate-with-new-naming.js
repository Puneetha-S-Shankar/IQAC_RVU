const mongoose = require('mongoose');
const { ObjectId } = require('mongodb');
require('dotenv').config();

// Import the new unified file service and File model
const unifiedFileService = require('./services/unifiedFileService');
const File = require('./models/File');

async function migrateWithNewNaming() {
  try {
    console.log('🚀 Starting migration to unified file system with new naming convention...');
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');
    
    // Initialize the unified file service
    await unifiedFileService.initialize();
    console.log('✅ Unified file service initialized');
    
    // First, migrate existing files to unified system
    console.log('\n📦 Step 1: Migrating existing files to unified system...');
    await unifiedFileService.migrateExistingFiles();
    
    // Step 2: Apply new naming convention to migrated files
    console.log('\n📝 Step 2: Applying new naming convention to migrated files...');
    await applyNewNamingConvention();
    
    console.log('\n🎉 Migration with new naming convention completed successfully!');
    console.log('\n📊 New unified system with naming convention is ready!');
    console.log('🔗 Use /api/unified-files endpoints for all file operations');
    console.log('🔍 Use /api/unified-files/search-by-filename for pattern-based searches');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

async function applyNewNamingConvention() {
  try {
    // Get all files that need to be updated
    const filesToUpdate = await File.find({
      $or: [
        { 'metadata.year': { $exists: true } },
        { 'metadata.courseCode': { $exists: true } }
      ]
    });
    
    console.log(`📁 Found ${filesToUpdate.length} files to update with new naming convention`);
    
    let updatedCount = 0;
    let skippedCount = 0;
    
    for (const file of filesToUpdate) {
      try {
        // Check if file already has the new naming convention
        if (file.filename.includes('_') && 
            (file.filename.match(/^\d{4}_/) || file.filename.match(/^[A-Z]{2,3}\d{3}_/))) {
          console.log(`⏭️  Skipping ${file.filename} - already has new naming convention`);
          skippedCount++;
          continue;
        }
        
        // Generate new filename
        const newFilename = unifiedFileService.generateFormattedFilename(
          file.metadata,
          file.originalName
        );
        
        if (newFilename !== file.filename) {
          // Update the filename
          file.filename = newFilename;
          await file.save();
          
          console.log(`✅ Updated: ${file.originalName} → ${newFilename}`);
          updatedCount++;
        } else {
          console.log(`⏭️  No change needed for: ${file.originalName}`);
          skippedCount++;
        }
        
      } catch (error) {
        console.error(`❌ Failed to update ${file.originalName}:`, error.message);
      }
    }
    
    console.log(`\n📊 Naming convention update summary:`);
    console.log(`   ✅ Updated: ${updatedCount} files`);
    console.log(`   ⏭️  Skipped: ${skippedCount} files`);
    
    // Show examples of new filenames
    if (updatedCount > 0) {
      console.log(`\n📝 Examples of new filenames:`);
      const sampleFiles = await File.find({
        filename: { $regex: /^\d{4}_|^[A-Z]{2,3}\d{3}_/ }
      }).limit(5);
      
      sampleFiles.forEach(file => {
        console.log(`   ${file.filename} (${file.metadata.docType || 'Unknown'})`);
      });
    }
    
  } catch (error) {
    throw new Error(`Failed to apply new naming convention: ${error.message}`);
  }
}

// Function to show current system status
async function showSystemStatus() {
  try {
    console.log('\n📊 Current System Status:');
    
    // Count files by naming convention
    const oldNamingCount = await File.countDocuments({
      filename: { $not: /^\d{4}_|^[A-Z]{2,3}\d{3}_/ }
    });
    
    const newNamingCount = await File.countDocuments({
      filename: { $regex: /^\d{4}_|^[A-Z]{2,3}\d{3}_/ }
    });
    
    console.log(`   📁 Files with old naming: ${oldNamingCount}`);
    console.log(`   📝 Files with new naming: ${newNamingCount}`);
    console.log(`   📊 Total files: ${oldNamingCount + newNamingCount}`);
    
    // Show some examples
    if (newNamingCount > 0) {
      console.log(`\n📝 Examples of new naming convention:`);
      const examples = await File.find({
        filename: { $regex: /^\d{4}_|^[A-Z]{2,3}\d{3}_/ }
      }).limit(3);
      
      examples.forEach(file => {
        console.log(`   ${file.filename}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Failed to get system status:', error.message);
  }
}

// Run migration if this file is executed directly
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.includes('--status')) {
    // Just show status
    mongoose.connect(process.env.MONGODB_URI)
      .then(() => showSystemStatus())
      .then(() => mongoose.disconnect())
      .catch(console.error);
  } else {
    // Run full migration
    migrateWithNewNaming();
  }
}

module.exports = { migrateWithNewNaming, showSystemStatus };
