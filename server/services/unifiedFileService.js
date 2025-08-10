const mongoose = require('mongoose');
const { ObjectId } = require('mongodb');
const File = require('../models/File');
const Task = require('../models/Task');

class UnifiedFileService {
  constructor() {
    this.db = null;
    this.masterBucket = null;
  }

  async initialize() {
    if (!mongoose.connection.readyState) {
      throw new Error('Database not connected');
    }
    this.db = mongoose.connection.db;
    this.masterBucket = new mongoose.mongo.GridFSBucket(this.db, {
      bucketName: 'master-files'
    });
  }

  // Upload file to unified system
  async uploadFile(fileBuffer, fileData, metadata) {
    await this.initialize();

    try {
      // Check for existing file with same criteria
      const existingFile = await this.findExistingFile(metadata);
      
      if (existingFile) {
        // Archive the existing file
        await this.archiveFile(existingFile._id);
      }

      // Upload to GridFS master bucket
      const uploadStream = this.masterBucket.openUploadStream(fileData.originalName, {
        contentType: fileData.mimetype,
        metadata: {
          // Store minimal metadata in GridFS, full metadata in our model
          originalName: fileData.originalName,
          uploadedBy: metadata.uploadedBy,
          category: metadata.category
        }
      });

      return new Promise((resolve, reject) => {
        // Write file buffer to stream
        uploadStream.end(fileBuffer);

        uploadStream.on('finish', async (file) => {
          try {
            // Create unified file record
            const unifiedFile = new File({
              filename: file.filename,
              originalName: fileData.originalName,
              contentType: fileData.mimetype,
              size: fileData.size,
              metadata: {
                ...metadata,
                gridfsId: file._id,
                gridfsBucket: 'master-files',
                uploadedAt: new Date()
              }
            });

            await unifiedFile.save();

            // If this is an assignment file, update the task
            if (metadata.assignmentId) {
              await this.updateTaskWithFile(metadata.assignmentId, unifiedFile._id);
            }

            resolve(unifiedFile);
          } catch (error) {
            reject(error);
          }
        });

        uploadStream.on('error', (error) => {
          reject(error);
        });
      });
    } catch (error) {
      throw new Error(`File upload failed: ${error.message}`);
    }
  }

  // Find existing file based on metadata
  async findExistingFile(metadata) {
    const query = {};
    
    if (metadata.assignmentId) {
      query['metadata.assignmentId'] = metadata.assignmentId;
    } else if (metadata.programme && metadata.courseCode && metadata.docType) {
      query['metadata.programme'] = metadata.programme;
      query['metadata.courseCode'] = metadata.courseCode;
      query['metadata.docType'] = metadata.docType;
      if (metadata.year) query['metadata.year'] = metadata.year;
      if (metadata.batch) query['metadata.batch'] = metadata.batch;
    }

    return await File.findOne(query);
  }

  // Archive a file (mark as not latest)
  async archiveFile(fileId) {
    await File.findByIdAndUpdate(fileId, {
      'metadata.isLatest': false,
      'metadata.status': 'archived'
    });
  }

  // Update task with file information
  async updateTaskWithFile(taskId, fileId) {
    await Task.findByIdAndUpdate(taskId, {
      fileId: fileId,
      status: 'file-uploaded',
      updatedAt: new Date()
    });
  }

  // Get file by ID
  async getFileById(fileId) {
    return await File.findById(fileId);
  }

  // Get files by academic criteria
  async getFilesByAcademicCriteria(criteria) {
    return await File.findByAcademicCriteria(criteria);
  }

  // Get assignment files
  async getAssignmentFiles(assignmentId) {
    return await File.findAssignmentFiles(assignmentId);
  }

  // Get curriculum files
  async getCurriculumFiles(programme, year, courseCode) {
    return await File.findCurriculumFiles(programme, year, courseCode);
  }

  // Get all files with filtering
  async getAllFiles(filters = {}, page = 1, limit = 20) {
    const query = { 'metadata.isLatest': true };
    
    // Apply filters
    Object.keys(filters).forEach(key => {
      if (filters[key] && filters[key] !== '') {
        query[`metadata.${key}`] = filters[key];
      }
    });

    const skip = (page - 1) * limit;
    
    const files = await File.find(query)
      .sort({ 'metadata.uploadedAt': -1 })
      .skip(skip)
      .limit(limit)
      .populate('metadata.uploadedBy', 'firstName lastName email')
      .populate('metadata.reviewedBy', 'firstName lastName email');

    const total = await File.countDocuments(query);

    return {
      files,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  // Download file stream
  async getFileStream(fileId) {
    await this.initialize();
    
    const file = await File.findById(fileId);
    if (!file) {
      throw new Error('File not found');
    }

    if (!file.metadata.gridfsId) {
      throw new Error('File data not found in GridFS');
    }

    return this.masterBucket.openDownloadStream(file.metadata.gridfsId);
  }

  // Update file metadata
  async updateFileMetadata(fileId, updateData) {
    const file = await File.findById(fileId);
    if (!file) {
      throw new Error('File not found');
    }

    // Update metadata fields
    Object.keys(updateData).forEach(key => {
      if (key !== '_id' && key !== 'gridfsId' && key !== 'gridfsBucket') {
        file.metadata[key] = updateData[key];
      }
    });

    file.metadata.updatedAt = new Date();
    await file.save();
    
    return file;
  }

  // Delete file
  async deleteFile(fileId) {
    await this.initialize();
    
    const file = await File.findById(fileId);
    if (!file) {
      throw new Error('File not found');
    }

    // Delete from GridFS
    if (file.metadata.gridfsId) {
      await this.masterBucket.delete(file.metadata.gridfsId);
    }

    // Delete from database
    await File.findByIdAndDelete(fileId);

    // If this was an assignment file, update the task
    if (file.metadata.assignmentId) {
      await Task.findByIdAndUpdate(file.metadata.assignmentId, {
        fileId: null,
        status: 'assigned',
        updatedAt: new Date()
      });
    }

    return true;
  }

  // Search files
  async searchFiles(searchTerm, filters = {}) {
    const query = { 'metadata.isLatest': true };
    
    // Text search
    if (searchTerm) {
      query.$or = [
        { filename: { $regex: searchTerm, $options: 'i' } },
        { originalName: { $regex: searchTerm, $options: 'i' } },
        { 'metadata.description': { $regex: searchTerm, $options: 'i' } },
        { 'metadata.courseName': { $regex: searchTerm, $options: 'i' } }
      ];
    }

    // Apply additional filters
    Object.keys(filters).forEach(key => {
      if (filters[key] && filters[key] !== '') {
        query[`metadata.${key}`] = filters[key];
      }
    });

    return await File.find(query)
      .sort({ 'metadata.uploadedAt': -1 })
      .populate('metadata.uploadedBy', 'firstName lastName email');
  }

  // Get file statistics
  async getFileStats() {
    const stats = await File.aggregate([
      { $match: { 'metadata.isLatest': true } },
      {
        $group: {
          _id: '$metadata.category',
          count: { $sum: 1 },
          totalSize: { $sum: '$size' }
        }
      }
    ]);

    const totalFiles = await File.countDocuments({ 'metadata.isLatest': true });
    const totalSize = await File.aggregate([
      { $match: { 'metadata.isLatest': true } },
      { $group: { _id: null, total: { $sum: '$size' } } }
    ]);

    return {
      byCategory: stats,
      totalFiles,
      totalSize: totalSize[0]?.total || 0
    };
  }

  // Migrate existing files to unified system
  async migrateExistingFiles() {
    await this.initialize();
    
    console.log('🔄 Starting migration to unified file system...');
    
    // Migrate files from old 'files' bucket
    const oldFiles = await this.db.collection('files.files').find({}).toArray();
    console.log(`📦 Found ${oldFiles.length} files in old 'files' bucket`);
    
    for (const oldFile of oldFiles) {
      try {
        // Create unified file record
        const unifiedFile = new File({
          filename: oldFile.filename,
          originalName: oldFile.metadata?.originalName || oldFile.filename,
          contentType: oldFile.contentType || 'application/octet-stream',
          size: oldFile.length,
          metadata: {
            ...oldFile.metadata,
            category: oldFile.metadata?.category || 'curriculum',
            gridfsId: oldFile._id,
            gridfsBucket: 'files',
            uploadedAt: oldFile.uploadDate || new Date(),
            status: 'pending'
          }
        });

        await unifiedFile.save();
        console.log(`✅ Migrated: ${oldFile.filename}`);
      } catch (error) {
        console.error(`❌ Failed to migrate ${oldFile.filename}:`, error.message);
      }
    }

    // Migrate files from old 'uploads' bucket
    const oldUploads = await this.db.collection('uploads.files').find({}).toArray();
    console.log(`📦 Found ${oldUploads.length} files in old 'uploads' bucket`);
    
    for (const oldUpload of oldUploads) {
      try {
        const unifiedFile = new File({
          filename: oldUpload.filename,
          originalName: oldUpload.metadata?.originalName || oldUpload.filename,
          contentType: oldUpload.contentType || 'application/octet-stream',
          size: oldUpload.length,
          metadata: {
            ...oldUpload.metadata,
            category: 'assignment',
            gridfsId: oldUpload._id,
            gridfsBucket: 'uploads',
            uploadedAt: oldUpload.uploadDate || new Date(),
            status: 'uploaded'
          }
        });

        await unifiedFile.save();
        console.log(`✅ Migrated: ${oldUpload.filename}`);
      } catch (error) {
        console.error(`❌ Failed to migrate ${oldUpload.filename}:`, error.message);
      }
    }

    console.log('✅ Migration completed!');
  }
}

module.exports = new UnifiedFileService();
