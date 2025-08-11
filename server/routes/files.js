const express = require('express');
const multer = require('multer');
const { ObjectId } = require('mongodb');
const mongoose = require('mongoose'); // Import Mongoose
const router = express.Router();

// Use multer memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'text/plain',
      'image/jpeg',
      'image/png',
      'image/gif'
    ];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type'), false);
    }
  }
});

// GET /api/files/category/:category - This is the missing endpoint!
router.get('/category/:category', async (req, res) => {
  try {
    const { category } = req.params;
    const db = mongoose.connection.db;
    
    // Get all files from master collection only
    const files = await db.collection('master-files.files').find({
      'metadata.category': category
    }).toArray();
    
    // Transform the files to match the expected format
    const transformedFiles = files.map(file => ({
      _id: file._id,
      filename: file.filename,
      metadata: file.metadata || {},
      uploadDate: file.uploadDate,
      length: file.length,
      contentType: file.contentType || file.metadata?.contentType
    }));
    
    res.json(transformedFiles);
  } catch (error) {
    console.error('Error fetching files by category:', error);
    res.status(500).json({ error: 'Failed to fetch files' });
  }
});

// Upload file to GridFS
router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
    }
    
    const db = mongoose.connection.db;
    const bucket = new mongoose.mongo.GridFSBucket(db, {
      bucketName: 'master-files'
    });

    const { docNumber, category, assignmentId, uploaderEmail } = req.body;
    
    // Handle assignment-based uploads for teaching-and-learning
    if (category === 'teaching-and-learning' && assignmentId) {
      // Import Task model for assignment updates
      const Task = require('../models/Task');
      
      // Check if assignment exists and user is authorized
      const assignment = await Task.findById(assignmentId).populate('assignedToInitiator');
      
      if (!assignment) {
        return res.status(404).json({ error: 'Assignment not found' });
      }
      
      if (!assignment.assignedToInitiator || assignment.assignedToInitiator.email !== uploaderEmail) {
        return res.status(403).json({ error: 'Not authorized to upload for this assignment' });
      }
      
      if (assignment.status !== 'assigned') {
        return res.status(400).json({ error: 'Assignment is not in a state that allows file upload' });
      }
      
      // Check for existing file for this assignment and delete it
      const existing = await db.collection('master-files.files').findOne({
        'metadata.category': category,
        'metadata.assignmentId': assignmentId
      });
      
      if (existing) {
        await bucket.delete(existing._id);
      }
      
      // Create upload stream with assignment metadata
      const uploadStream = bucket.openUploadStream(req.file.originalname, {
        contentType: req.file.mimetype,
        metadata: {
          category,
          assignmentId,
          uploaderEmail,
          courseCode: assignment.courseCode,
          courseName: assignment.courseName,
          uploadDate: new Date(),
          status: 'uploaded'
        }
      });

      uploadStream.end(req.file.buffer);
      
      uploadStream.on('finish', async () => {
        try {
          // Update assignment status to 'file-uploaded'
          await Task.findByIdAndUpdate(assignmentId, { 
            status: 'file-uploaded',
            fileId: uploadStream.id,
            fileUploadDate: new Date()
          });
          
          res.json({
            message: 'File uploaded successfully',
            fileId: uploadStream.id,
            assignmentId,
            status: 'file-uploaded'
          });
        } catch (error) {
          console.error('Error updating assignment status:', error);
          res.status(500).json({ error: 'File uploaded but failed to update assignment status' });
        }
      });
      
      uploadStream.on('error', (error) => {
        console.error('GridFS upload error:', error);
        res.status(500).json({ error: 'File upload failed' });
      });
      
      return; // Exit early for assignment-based uploads
    }
    
    // Original logic for document number based uploads (teaching-and-learning without assignment)
    if (category === 'teaching-and-learning' && docNumber) {
      const existing = await db.collection('master-files.files').findOne({
        'metadata.category': category,
        'metadata.docNumber': parseInt(docNumber)
      });
      
      if (existing) {
        // Delete the existing file from GridFS
        await bucket.delete(existing._id);
      }
    } else {
      // Original logic for other categories
      const metaQuery = {
        'metadata.programme': req.body.programme || '',
        'metadata.docLevel': req.body.docLevel || '',
        'metadata.year': req.body.year || '',
        'metadata.batch': req.body.batch || '',
        'metadata.semester': req.body.semester || '',
        'metadata.docType': req.body.docType || ''
      };
      const existing = await db.collection('master-files.files').findOne(metaQuery);
      if (existing) {
        await bucket.delete(existing._id);
      }
    }

    // Upload to GridFS
    const uploadStream = bucket.openUploadStream(req.file.originalname, {
      contentType: req.file.mimetype,
      metadata: {
        originalName: req.file.originalname,
        uploadedBy: req.body.uploadedBy || req.body.userId || 'anonymous',
        category: req.body.category || 'general',
        description: req.body.description || '',
        tags: req.body.tags ? req.body.tags.split(',').map(tag => tag.trim()) : [],
        programme: req.body.programme || '',
        docLevel: req.body.docLevel || '',
        year: req.body.year || '',
        batch: req.body.batch || '',
        semester: req.body.semester || '',
        docType: req.body.docType || '',
        docNumber: req.body.docNumber ? parseInt(req.body.docNumber) : undefined,
        uploadedAt: new Date(),
        uploadDate: req.body.uploadDate || new Date().toISOString(),
        size: req.file.size,
        contentType: req.file.mimetype,
        status: req.body.status || 'pending', // Add status field
        taskId: req.body.taskId || null // Add taskId field
      }
    });
    
    uploadStream.end(req.file.buffer);
    
    uploadStream.on('finish', () => {
      // Fix: Don't use the file parameter, use uploadStream.id instead
      res.status(201).json({
        message: 'File uploaded successfully',
        file: {
          _id: uploadStream.id,
          filename: req.file.originalname,
          metadata: {
            originalName: req.file.originalname,
            uploadedBy: req.body.uploadedBy || req.body.userId || 'anonymous',
            category: req.body.category || 'general',
            description: req.body.description || '',
            docNumber: req.body.docNumber ? parseInt(req.body.docNumber) : undefined,
            uploadDate: req.body.uploadDate || new Date().toISOString(),
            contentType: req.file.mimetype,
            size: req.file.size,
            status: req.body.status || 'pending',
            taskId: req.body.taskId || null
          }
        }
      });
    });
    
    uploadStream.on('error', (err) => {
      console.error('GridFS upload error:', err);
      res.status(500).json({ error: 'Server error during file upload' });
    });
  } catch (error) {
    console.error('File upload error:', error);
    res.status(500).json({ error: 'Server error during file upload' });
  }
});

// Get all files (metadata) - REFACTORED
router.get('/', async (req, res) => {
  try {
    const db = mongoose.connection.db;
    const query = {};
    const fields = ['category', 'uploadedBy', 'programme', 'docLevel', 'year', 'batch', 'semester', 'docType'];
    
    fields.forEach(field => {
      if (req.query[field] && req.query[field] !== '') {
        query[`metadata.${field}`] = req.query[field];
      }
    });

    const files = await db.collection('master-files.files').find(query).toArray();
    res.json({ files });
  } catch (error) {
    console.error('Get files error:', error);
    res.status(500).json({ error: 'Server error while fetching files' });
  }
});

// Get file by ID (metadata)
router.get('/:id', async (req, res) => {
  try {
    const db = mongoose.connection.db;
    const file = await db.collection('master-files.files').findOne({ _id: new ObjectId(req.params.id) });
    if (!file) {
      return res.status(404).json({ error: 'File not found' });
    }
    res.json({ file });
  } catch (error) {
    console.error('Get file error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Download assignment file from uploads bucket
router.get('/:id/download', async (req, res) => {
  try {
    const db = mongoose.connection.db;
    const fileId = req.params.id;
    
    // Use master-files collection only
    let file = await db.collection('master-files.files').findOne({ _id: new ObjectId(fileId) });
    let bucketName = 'master-files';
    
    // No fallback needed - everything is in master-files now
    if (!file) {
      return res.status(404).json({ error: 'File not found' });
    }
    
    const bucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db, {
      bucketName: bucketName
    });
    
    res.set('Content-Type', file.contentType || file.metadata?.contentType || 'application/pdf');
    res.set('Content-Disposition', `inline; filename="${file.filename}"`);
    const downloadStream = bucket.openDownloadStream(file._id);
    downloadStream.pipe(res);
    downloadStream.on('error', (err) => {
      console.error('GridFS download error:', err);
      if (!res.headersSent) {
        res.status(500).json({ error: 'Server error during file download' });
      }
    });
  } catch (error) {
    console.error('Download file error:', error);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Server error during file download' });
    }
  }
});

// DELETE /api/files/:id - Delete a file
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const db = mongoose.connection.db;
  const bucket = new mongoose.mongo.GridFSBucket(db, { bucketName: 'master-files' });
    
    // Check if file exists
    const file = await db.collection('master-files.files').findOne({ _id: new ObjectId(id) });
    if (!file) {
      return res.status(404).json({ error: 'File not found' });
    }
    
    // Delete from GridFS
    await bucket.delete(new ObjectId(id));
    res.json({ success: true, message: 'File deleted successfully' });
    
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({ error: 'Delete failed' });
  }
});

module.exports = router;