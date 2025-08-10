const mongoose = require('mongoose');
const { GridFSBucket } = require('mongodb');
const File = require('../models/File');
const Course = require('../models/Course');
const environment = require('../config/environment');

class UnifiedFileService {
  constructor() {
    this.db = null;
    this.masterBucket = null;
  }

  async initialize() {
    try {
      // Get database connection from config
      const databaseConfig = require('../config/database');
      if (!databaseConfig.isConnected) {
        await databaseConfig.connect();
      }
      
      this.db = databaseConfig.getDatabase();
      this.masterBucket = databaseConfig.getMasterBucket();
      
      console.log('✅ Unified file service initialized');
      console.log(`📦 Using bucket: ${environment.MASTER_BUCKET_NAME}`);
      console.log(`📁 Collection: ${environment.MASTER_COLLECTION_NAME}`);
    } catch (error) {
      throw new Error(`Failed to initialize unified file service: ${error.message}`);
    }
  }

  // Generate filename in Merin ma'am's format: year_courseCode_documentType_version.pdf
  generateMasterFilename(year, courseCode, documentType, version = 1, extension = 'pdf') {
    return `${year}_${courseCode}_${documentType}_v${version}.${extension}`;
  }

  // Parse master filename to extract components
  parseMasterFilename(filename) {
    const regex = /^(\d{4})_([A-Z]{2,4}\d{3})_([a-z_]+)_v(\d+)\.(.+)$/;
    const match = filename.match(regex);
    
    if (match) {
      return {
        year: match[1],
        courseCode: match[2],
        courseId: `${match[1]}_${match[2]}`,
        documentType: match[3],
        version: parseInt(match[4]),
        extension: match[5]
      };
    }
    return null;
  }

  // Upload file with master database structure
  async uploadFileToMasterDB(fileBuffer, fileData, courseId, documentType, userId) {
    await this.initialize();

    try {
      // Parse courseId to get year and courseCode
      const [year, courseCode] = courseId.split('_');
      if (!year || !courseCode) {
        throw new Error('Invalid courseId format. Expected: YYYY_CCNNN');
      }

      // Get or create course
      let course = await Course.findOne({ courseId });
      if (!course) {
        throw new Error(`Course ${courseId} not found. Please create course first.`);
      }

      // Get file extension
      const extension = fileData.originalName ? 
        fileData.originalName.split('.').pop().toLowerCase() : 'pdf';

      // Find next version number for this document type
      const existingDocs = course.getDocumentsByType(documentType);
      const version = existingDocs.length + 1;

      // Generate master filename
      const masterFilename = this.generateMasterFilename(
        year, 
        courseCode, 
        documentType, 
        version, 
        extension
      );

      // Upload to GridFS master bucket
      const uploadStream = this.masterBucket.openUploadStream(masterFilename, {
        contentType: fileData.mimetype,
        metadata: {
          courseId,
          year,
          courseCode,
          documentType,
          version,
          uploadedBy: userId,
          uploadedAt: new Date(),
          originalFilename: fileData.originalName || masterFilename,
          category: 'master-course-document'
        }
      });

      return new Promise((resolve, reject) => {
        uploadStream.end(fileBuffer);
        
        uploadStream.on('finish', async () => {
          try {
            // Add document to course
            const documentData = {
              type: documentType,
              fileId: uploadStream.id,
              filename: masterFilename,
              version,
              uploadedBy: userId,
              uploadedAt: new Date(),
              status: 'draft'
            };

            await course.addDocument(documentData);

            // Also create File record for compatibility
            const unifiedFile = new File({
              filename: masterFilename,
              originalName: fileData.originalName,
              contentType: fileData.mimetype,
              size: fileData.size,
              metadata: {
                courseId,
                year,
                courseCode,
                documentType,
                version,
                gridfsId: uploadStream.id,
                gridfsBucket: environment.MASTER_BUCKET_NAME,
                uploadedBy: userId,
                uploadedAt: new Date(),
                category: 'master-course-document',
                isLatest: true,
                status: 'draft'
              }
            });

            await unifiedFile.save();

            console.log(`✅ File stored in master DB: ${masterFilename} (ID: ${uploadStream.id})`);
            resolve({
              fileId: uploadStream.id,
              filename: masterFilename,
              courseId,
              documentType,
              version,
              unifiedFileId: unifiedFile._id
            });
          } catch (error) {
            reject(error);
          }
        });

        uploadStream.on('error', reject);
      });

    } catch (error) {
      console.error('❌ Error storing file in master DB:', error);
      throw error;
    }
  }

  // Create new course in master database
  async createMasterCourse(courseData) {
    try {
      const courseId = `${courseData.year}_${courseData.courseCode}`;
      
      const course = new Course({
        courseId,
        courseCode: courseData.courseCode,
        courseName: courseData.courseName,
        year: courseData.year,
        ltp: courseData.ltp || { lecture: 3, tutorial: 0, practical: 0 },
        examPattern: courseData.examPattern || "70_30",
        department: courseData.department,
        semester: courseData.semester || 1,
        credits: courseData.credits || 3,
        courseCoordinator: courseData.courseCoordinator,
        faculty: courseData.faculty || [],
        isActive: true
      });

      await course.save();
      console.log(`✅ Master course created: ${courseId}`);
      return course;
    } catch (error) {
      if (error.code === 11000) {
        throw new Error(`Course ${courseData.year}_${courseData.courseCode} already exists`);
      }
      console.error('❌ Error creating master course:', error);
      throw error;
    }
  }

  // Get all documents for a course (Merin ma'am's main requirement)
  async getAllCourseDocuments(courseId) {
    try {
      const course = await Course.findOne({ courseId })
        .populate('documents.uploadedBy', 'name email')
        .populate('documents.approvedBy', 'name email')
        .populate('courseCoordinator', 'name email')
        .populate('faculty', 'name email');

      if (!course) {
        throw new Error(`Course ${courseId} not found`);
      }

      return {
        courseInfo: {
          courseId: course.courseId,
          courseCode: course.courseCode,
          courseName: course.courseName,
          year: course.year,
          department: course.department,
          semester: course.semester,
          ltp: course.ltp,
          examPattern: course.examPattern,
          coordinator: course.courseCoordinator,
          faculty: course.faculty
        },
        documents: course.documents,
        documentSummary: this._generateDocumentSummary(course.documents),
        totalDocuments: course.documents.length,
        approvedDocuments: course.getApprovedDocuments().length
      };
    } catch (error) {
      console.error('❌ Error getting course documents:', error);
      throw error;
    }
  }

  // Admin master view: Get all courses with document summary
  async getMasterCoursesView(year = null) {
    try {
      const query = year ? { year } : {};
      
      const courses = await Course.find(query)
        .populate('courseCoordinator', 'name email')
        .populate('faculty', 'name email')
        .sort({ year: -1, courseCode: 1 });

      return courses.map(course => ({
        courseId: course.courseId,
        courseCode: course.courseCode,
        courseName: course.courseName,
        year: course.year,
        department: course.department,
        semester: course.semester,
        coordinator: course.courseCoordinator,
        faculty: course.faculty,
        documentSummary: this._generateDocumentSummary(course.documents),
        totalDocuments: course.documents.length,
        approvedDocuments: course.getApprovedDocuments().length,
        lastUpdated: course.updatedAt
      }));
    } catch (error) {
      console.error('❌ Error getting master courses view:', error);
      throw error;
    }
  }

  // Search courses by courseId, courseCode, or courseName
  async searchMasterCourses(searchTerm) {
    try {
      const regex = new RegExp(searchTerm, 'i');
      
      const courses = await Course.find({
        $or: [
          { courseId: regex },
          { courseCode: regex },
          { courseName: regex },
          { department: regex }
        ]
      })
      .populate('courseCoordinator', 'name email')
      .sort({ year: -1, courseCode: 1 });

      return courses.map(course => ({
        courseId: course.courseId,
        courseCode: course.courseCode,
        courseName: course.courseName,
        year: course.year,
        department: course.department,
        totalDocuments: course.documents.length,
        approvedDocuments: course.getApprovedDocuments().length
      }));
    } catch (error) {
      console.error('❌ Error searching master courses:', error);
      throw error;
    }
  }

  // Generate document summary for admin view
  _generateDocumentSummary(documents) {
    const summary = {};
    const documentTypes = [
      'syllabus', 'lesson_plan', 'course_file', 'cie_marks', 
      'see_marks', 'question_paper', 'answer_key', 'course_outcome',
      'program_outcome', 'co_po_mapping', 'attainment_report'
    ];

    documentTypes.forEach(type => {
      const typeDocs = documents.filter(doc => doc.type === type);
      summary[type] = {
        count: typeDocs.length,
        approved: typeDocs.filter(doc => doc.status === 'approved').length,
        latest: typeDocs.length > 0 ? typeDocs[typeDocs.length - 1] : null
      };
    });

    return summary;
  }

  // Legacy support: Keep existing functions for backwards compatibility
  async uploadFile(fileBuffer, fileData, metadata) {
    // If courseId is provided, use master database structure
    if (metadata.courseId || (metadata.year && metadata.courseCode)) {
      const courseId = metadata.courseId || `${metadata.year}_${metadata.courseCode}`;
      const documentType = metadata.documentType || metadata.docType || 'course_file';
      const userId = metadata.uploadedBy;
      
      return await this.uploadFileToMasterDB(fileBuffer, fileData, courseId, documentType, userId);
    }
    
    // Otherwise, use legacy system
    return await this.uploadFileLegacy(fileBuffer, fileData, metadata);
  }

  // Legacy upload function (kept for backwards compatibility)
  async uploadFileLegacy(fileBuffer, fileData, metadata) {
    await this.initialize();

    try {
      // Check for existing file with same criteria
      const existingFile = await this.findExistingFile(metadata);
      
      if (existingFile) {
        // Archive the existing file
        await this.archiveFile(existingFile._id);
      }

      // Generate old filename format
      const formattedFilename = this.generateFormattedFilename(metadata, fileData.originalName);

      // Upload to GridFS master bucket with old filename
      const uploadStream = this.masterBucket.openUploadStream(formattedFilename, {
        contentType: fileData.mimetype,
        metadata: {
          originalName: fileData.originalName,
          formattedFilename: formattedFilename,
          uploadedBy: metadata.uploadedBy,
          category: metadata.category
        }
      });

      return new Promise((resolve, reject) => {
        uploadStream.end(fileBuffer);

        uploadStream.on('finish', async (file) => {
          try {
            const unifiedFile = new File({
              filename: formattedFilename,
              originalName: fileData.originalName,
              contentType: fileData.mimetype,
              size: fileData.size,
              metadata: {
                ...metadata,
                gridfsId: file._id,
                gridfsBucket: environment.MASTER_BUCKET_NAME,
                uploadedAt: new Date()
              }
            });

            await unifiedFile.save();

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

  // Generate filename in old format: year_course.code_file.name
  generateFormattedFilename(metadata, originalName) {
    const parts = [];
    
    if (metadata.year) {
      parts.push(metadata.year);
    }
    
    if (metadata.courseCode) {
      parts.push(metadata.courseCode);
    }
    
    if (parts.length > 0) {
      parts.push('_');
    }
    
    const nameWithoutExt = originalName.replace(/\.[^/.]+$/, '');
    parts.push(nameWithoutExt);
    
    const extension = originalName.split('.').pop();
    if (extension && extension !== originalName) {
      parts.push('.');
      parts.push(extension);
    }
    
    return parts.join('');
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

  // Search files by new naming convention format
  async searchByFormattedFilename(searchPattern) {
    try {
      // Parse the search pattern (e.g., "2023_CS101" or "CS101_Course")
      const parts = searchPattern.split('_');
      const query = {};
      
      if (parts.length >= 2) {
        // First part could be year or course code
        const firstPart = parts[0];
        const secondPart = parts[1];
        
        // Check if first part is a year (4 digits)
        if (/^\d{4}$/.test(firstPart)) {
          query['metadata.year'] = firstPart;
          if (secondPart) {
            query['metadata.courseCode'] = secondPart;
          }
        } else {
          // First part is course code
          query['metadata.courseCode'] = firstPart;
          if (secondPart) {
            // Second part could be year or part of filename
            if (/^\d{4}$/.test(secondPart)) {
              query['metadata.year'] = secondPart;
            }
          }
        }
      } else if (parts.length === 1) {
        // Single part search - could be year, course code, or filename
        const part = parts[0];
        if (/^\d{4}$/.test(part)) {
          query['metadata.year'] = part;
        } else {
          // Search in course code or filename
          query['$or'] = [
            { 'metadata.courseCode': { $regex: part, $options: 'i' } },
            { filename: { $regex: part, $options: 'i' } }
          ];
        }
      }
      
      return await File.find(query)
        .sort({ 'metadata.uploadedAt': -1 })
        .populate('metadata.uploadedBy', 'firstName lastName email');
    } catch (error) {
      throw new Error(`Search by formatted filename failed: ${error.message}`);
    }
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
    const Task = require('../models/Task');
    await Task.findByIdAndUpdate(taskId, {
      fileId: fileId,
      status: 'file-uploaded',
      updatedAt: new Date()
    });
  }

  // Get file stream for download
  async getFileStream(fileId) {
    await this.initialize();
    
    // Try to find in Course model first (master database)
    const course = await Course.findOne({ 'documents.fileId': fileId });
    if (course) {
      return this.masterBucket.openDownloadStream(new mongoose.Types.ObjectId(fileId));
    }
    
    // Fallback to File model (legacy)
    const file = await File.findById(fileId);
    if (!file) {
      throw new Error('File not found');
    }

    if (!file.metadata.gridfsId) {
      throw new Error('File data not found in GridFS');
    }

    return this.masterBucket.openDownloadStream(file.metadata.gridfsId);
  }

  // Get file metadata
  async getFileMetadata(fileId) {
    await this.initialize();

    try {
      // Try Course model first
      const course = await Course.findOne({ 'documents.fileId': fileId });
      if (course) {
        const document = course.documents.find(doc => doc.fileId.toString() === fileId);
        if (document) {
          return {
            filename: document.filename,
            courseId: course.courseId,
            documentType: document.type,
            version: document.version,
            status: document.status,
            uploadedBy: document.uploadedBy,
            uploadedAt: document.uploadedAt
          };
        }
      }

      // Fallback to GridFS metadata
      const files = await this.masterBucket
        .find({ _id: new mongoose.Types.ObjectId(fileId) })
        .toArray();

      return files.length > 0 ? files[0] : null;
    } catch (error) {
      console.error('❌ Error getting file metadata:', error);
      throw error;
    }
  }

  // Migrate existing files to master database structure
  async migrateToMasterDatabase() {
    await this.initialize();
    
    console.log('🔄 Starting migration to master database structure...');
    
    try {
      // Get all existing assignments and their files
      const Task = require('../models/Task');
      const tasks = await Task.find({ fileId: { $exists: true } })
        .populate('fileId')
        .populate('assignedToInitiator')
        .populate('assignedToReviewer');

      console.log(`📦 Found ${tasks.length} tasks with files to migrate`);

      for (const task of tasks) {
        try {
          if (!task.fileId) continue;

          // Extract course information from task
          const courseCode = task.courseCode || 'MISC';
          const year = task.createdAt ? task.createdAt.getFullYear().toString() : '2024';
          const courseId = `${year}_${courseCode}`;

          // Create course if it doesn't exist
          let course = await Course.findOne({ courseId });
          if (!course) {
            course = await this.createMasterCourse({
              courseCode,
              courseName: task.courseName || `Course ${courseCode}`,
              year,
              department: 'General',
              semester: 1,
              credits: 3,
              ltp: { lecture: 3, tutorial: 0, practical: 0 },
              examPattern: '70_30'
            });
          }

          // Determine document type from task
          const documentType = this.mapTaskToDocumentType(task.category || 'course-document');

          // Add document to course if not already present
          const existingDoc = course.documents.find(doc => 
            doc.fileId && doc.fileId.toString() === task.fileId._id.toString()
          );

          if (!existingDoc) {
            const documentData = {
              type: documentType,
              fileId: task.fileId._id,
              filename: task.fileId.filename || 'document.pdf',
              version: 1,
              uploadedBy: task.assignedToInitiator,
              uploadedAt: task.submittedAt || task.createdAt,
              status: task.status === 'approved-by-admin' ? 'approved' : 
                     task.status === 'approved-by-reviewer' ? 'pending-admin-approval' : 'draft'
            };

            await course.addDocument(documentData);
            console.log(`✅ Migrated task file to course ${courseId}: ${task.fileId.filename}`);
          }

        } catch (error) {
          console.error(`❌ Failed to migrate task ${task._id}:`, error.message);
        }
      }

      console.log('✅ Migration to master database completed!');
      
      // Return summary
      const totalCourses = await Course.countDocuments();
      const totalDocuments = await Course.aggregate([
        { $unwind: '$documents' },
        { $count: 'total' }
      ]);

      return {
        migratedTasks: tasks.length,
        totalCourses,
        totalDocuments: totalDocuments[0]?.total || 0
      };

    } catch (error) {
      console.error('❌ Migration failed:', error);
      throw error;
    }
  }

  // Map task assignment type to document type
  mapTaskToDocumentType(assignmentType) {
    const mapping = {
      'syllabus': 'syllabus',
      'lesson_plan': 'lesson_plan',
      'course_document': 'course_file',
      'question_paper': 'question_paper',
      'answer_key': 'answer_key',
      'marks': 'cie_marks'
    };

    return mapping[assignmentType] || 'course_file';
  }
}

module.exports = new UnifiedFileService();
