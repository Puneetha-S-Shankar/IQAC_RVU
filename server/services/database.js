const { ObjectId } = require('mongodb');
const bcrypt = require('bcryptjs');
const mongoDB = require('../config/database');

class DatabaseService {
  constructor() {
    this.db = null;
    this.bucket = null;
  }

  async initialize() {
    if (!mongoDB.isConnected) {
      await mongoDB.connect();
    }
    this.db = mongoDB.getDatabase();
    this.bucket = mongoDB.getBucket();
  }

  // User operations
  async findUser(query) {
    await this.initialize();
    return await this.db.collection('users').findOne(query);
  }

  async findUserById(id) {
    await this.initialize();
    return await this.db.collection('users').findOne({ _id: new ObjectId(id) });
  }

  async createUser(userData) {
    await this.initialize();
    
    // Hash password if provided
    if (userData.password) {
      userData.password = await bcrypt.hash(userData.password, 12);
    }

    const newUser = {
      ...userData,
      createdAt: new Date(),
      lastLogin: new Date(),
      isActive: true
    };

    const result = await this.db.collection('users').insertOne(newUser);
    return { _id: result.insertedId, ...newUser };
  }

  async updateUser(id, updateData) {
    await this.initialize();
    
    // Hash password if it's being updated
    if (updateData.password) {
      updateData.password = await bcrypt.hash(updateData.password, 12);
    }

    const result = await this.db.collection('users').findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: updateData },
      { returnDocument: 'after' }
    );
    
    return result.value;
  }

  async deleteUser(id) {
    await this.initialize();
    const result = await this.db.collection('users').deleteOne({ _id: new ObjectId(id) });
    return result.deletedCount > 0;
  }

  // File operations with GridFS
  async saveFile(fileData, fileStream) {
    await this.initialize();
    
    const metadata = {
      originalName: fileData.originalName,
      uploadedBy: fileData.uploadedBy || 'anonymous',
      category: fileData.category || 'general',
      description: fileData.description || '',
      tags: fileData.tags || [],
      programme: fileData.programme || '',
      docLevel: fileData.docLevel || '',
      year: fileData.year || '',
      batch: fileData.batch || '',
      semester: fileData.semester || '',
      docType: fileData.docType || '',
      uploadedAt: new Date()
    };

    // Check for existing file with same metadata
    const existing = await this.db.collection('files.files').findOne({
      'metadata.programme': metadata.programme,
      'metadata.docLevel': metadata.docLevel,
      'metadata.year': metadata.year,
      'metadata.batch': metadata.batch,
      'metadata.semester': metadata.semester,
      'metadata.docType': metadata.docType
    });

    if (existing) {
      throw new Error('A file for this selection already exists.');
    }

    const uploadStream = this.bucket.openUploadStream(fileData.originalName, {
      metadata: metadata
    });

    return new Promise((resolve, reject) => {
      fileStream.pipe(uploadStream);
      
      uploadStream.on('error', (error) => {
        reject(error);
      });
      
      uploadStream.on('finish', (file) => {
        resolve({
          _id: file._id,
          originalName: file.filename,
          filename: file.filename,
          mimetype: file.metadata.mimetype,
          size: file.length,
          uploadedBy: file.metadata.uploadedBy,
          category: file.metadata.category,
          description: file.metadata.description,
          tags: file.metadata.tags,
          programme: file.metadata.programme,
          docLevel: file.metadata.docLevel,
          year: file.metadata.year,
          batch: file.metadata.batch,
          semester: file.metadata.semester,
          docType: file.metadata.docType,
          uploadedAt: file.metadata.uploadedAt
        });
      });
    });
  }

  async findFile(query = {}) {
    await this.initialize();
    
    // Convert query to GridFS metadata format
    const metadataQuery = {};
    Object.keys(query).forEach(key => {
      metadataQuery[`metadata.${key}`] = query[key];
    });

    const files = await this.db.collection('files.files').find(metadataQuery).toArray();
    
    return files.map(file => ({
      _id: file._id,
      originalName: file.filename,
      filename: file.filename,
      mimetype: file.metadata?.mimetype || 'application/octet-stream',
      size: file.length,
      uploadedBy: file.metadata?.uploadedBy || 'unknown',
      category: file.metadata?.category || 'general',
      description: file.metadata?.description || '',
      tags: file.metadata?.tags || [],
      programme: file.metadata?.programme || '',
      docLevel: file.metadata?.docLevel || '',
      year: file.metadata?.year || '',
      batch: file.metadata?.batch || '',
      semester: file.metadata?.semester || '',
      docType: file.metadata?.docType || '',
      uploadedAt: file.metadata?.uploadedAt || file.uploadDate
    }));
  }

  async findFileById(id) {
    await this.initialize();
    const file = await this.db.collection('files.files').findOne({ _id: new ObjectId(id) });
    
    if (!file) return null;
    
    return {
      _id: file._id,
      originalName: file.filename,
      filename: file.filename,
      mimetype: file.metadata?.mimetype || 'application/octet-stream',
      size: file.length,
      uploadedBy: file.metadata?.uploadedBy || 'unknown',
      category: file.metadata?.category || 'general',
      description: file.metadata?.description || '',
      tags: file.metadata?.tags || [],
      programme: file.metadata?.programme || '',
      docLevel: file.metadata?.docLevel || '',
      year: file.metadata?.year || '',
      batch: file.metadata?.batch || '',
      semester: file.metadata?.semester || '',
      docType: file.metadata?.docType || '',
      uploadedAt: file.metadata?.uploadedAt || file.uploadDate
    };
  }

  async updateFile(id, updateData) {
    await this.initialize();
    
    const metadataUpdate = {};
    Object.keys(updateData).forEach(key => {
      metadataUpdate[`metadata.${key}`] = updateData[key];
    });

    const result = await this.db.collection('files.files').findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: metadataUpdate },
      { returnDocument: 'after' }
    );
    
    if (!result.value) return null;
    
    const file = result.value;
    return {
      _id: file._id,
      originalName: file.filename,
      filename: file.filename,
      mimetype: file.metadata?.mimetype || 'application/octet-stream',
      size: file.length,
      uploadedBy: file.metadata?.uploadedBy || 'unknown',
      category: file.metadata?.category || 'general',
      description: file.metadata?.description || '',
      tags: file.metadata?.tags || [],
      programme: file.metadata?.programme || '',
      docLevel: file.metadata?.docLevel || '',
      year: file.metadata?.year || '',
      batch: file.metadata?.batch || '',
      semester: file.metadata?.semester || '',
      docType: file.metadata?.docType || '',
      uploadedAt: file.metadata?.uploadedAt || file.uploadDate
    };
  }

  async deleteFile(id) {
    await this.initialize();
    
    // Delete from GridFS
    await this.bucket.delete(new ObjectId(id));
    return true;
  }

  async getFileStream(id) {
    await this.initialize();
    return this.bucket.openDownloadStream(new ObjectId(id));
  }

  // Curriculum operations
  async saveCurriculum(curriculumData) {
    await this.initialize();
    
    const newCurriculum = {
      ...curriculumData,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await this.db.collection('curriculum').insertOne(newCurriculum);
    return { _id: result.insertedId, ...newCurriculum };
  }

  async findCurriculum(query = {}) {
    await this.initialize();
    return await this.db.collection('curriculum').find(query).toArray();
  }

  async findCurriculumById(id) {
    await this.initialize();
    return await this.db.collection('curriculum').findOne({ _id: new ObjectId(id) });
  }

  async updateCurriculum(id, updateData) {
    await this.initialize();
    
    const result = await this.db.collection('curriculum').findOneAndUpdate(
      { _id: new ObjectId(id) },
      { 
        $set: { 
          ...updateData,
          updatedAt: new Date()
        }
      },
      { returnDocument: 'after' }
    );
    
    return result.value;
  }

  async deleteCurriculum(id) {
    await this.initialize();
    const result = await this.db.collection('curriculum').deleteOne({ _id: new ObjectId(id) });
    return result.deletedCount > 0;
  }

  // Report operations
  async saveReport(reportData) {
    await this.initialize();
    
    const newReport = {
      ...reportData,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await this.db.collection('reports').insertOne(newReport);
    return { _id: result.insertedId, ...newReport };
  }

  async findReports(query = {}) {
    await this.initialize();
    return await this.db.collection('reports').find(query).toArray();
  }

  async findReportById(id) {
    await this.initialize();
    return await this.db.collection('reports').findOne({ _id: new ObjectId(id) });
  }

  async updateReport(id, updateData) {
    await this.initialize();
    
    const result = await this.db.collection('reports').findOneAndUpdate(
      { _id: new ObjectId(id) },
      { 
        $set: { 
          ...updateData,
          updatedAt: new Date()
        }
      },
      { returnDocument: 'after' }
    );
    
    return result.value;
  }

  async deleteReport(id) {
    await this.initialize();
    const result = await this.db.collection('reports').deleteOne({ _id: new ObjectId(id) });
    return result.deletedCount > 0;
  }

  // Statistics
  async getStats() {
    await this.initialize();
    
    const userCount = await this.db.collection('users').countDocuments();
    const fileCount = await this.db.collection('files.files').countDocuments();
    const curriculumCount = await this.db.collection('curriculum').countDocuments();
    const reportCount = await this.db.collection('reports').countDocuments();
    
    // Calculate total file size
    const fileStats = await this.db.collection('files.files').aggregate([
      {
        $group: {
          _id: null,
          totalSize: { $sum: '$length' },
          avgSize: { $avg: '$length' }
        }
      }
    ]).toArray();

    const totalSize = fileStats.length > 0 ? fileStats[0].totalSize : 0;
    const avgSize = fileStats.length > 0 ? fileStats[0].avgSize : 0;

    return {
      users: userCount,
      files: fileCount,
      curriculum: curriculumCount,
      reports: reportCount,
      totalFileSize: totalSize,
      averageFileSize: avgSize,
      database: 'MongoDB with GridFS',
      lastUpdated: new Date()
    };
  }

  // Migration helper
  async migrateFromJSON(jsonData) {
    await this.initialize();
    
    console.log('🔄 Starting migration from JSON to MongoDB...');
    
    // Migrate users
    if (jsonData.users && jsonData.users.length > 0) {
      console.log(`📦 Migrating ${jsonData.users.length} users...`);
      for (const user of jsonData.users) {
        // Hash existing passwords
        if (user.password) {
          user.password = await bcrypt.hash(user.password, 12);
        }
        await this.db.collection('users').insertOne(user);
      }
    }
    
    // Migrate curriculum
    if (jsonData.curriculum && jsonData.curriculum.length > 0) {
      console.log(`📦 Migrating ${jsonData.curriculum.length} curriculum items...`);
      await this.db.collection('curriculum').insertMany(jsonData.curriculum);
    }
    
    // Migrate reports
    if (jsonData.reports && jsonData.reports.length > 0) {
      console.log(`📦 Migrating ${jsonData.reports.length} reports...`);
      await this.db.collection('reports').insertMany(jsonData.reports);
    }
    
    console.log('✅ Migration completed successfully!');
  }
}

module.exports = new DatabaseService(); 