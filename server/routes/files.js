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

// Upload file to GridFS
router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    const db = mongoose.connection.db; // Use the existing Mongoose connection
    const bucket = new mongoose.mongo.GridFSBucket(db, {
      bucketName: 'files'
    });

    // Check for existing file with same metadata
    const metaQuery = {
      'metadata.programme': req.body.programme || '',
      'metadata.docLevel': req.body.docLevel || '',
      'metadata.year': req.body.year || '',
      'metadata.batch': req.body.batch || '',
      'metadata.semester': req.body.semester || '',
      'metadata.docType': req.body.docType || ''
    };
    const existing = await db.collection('files.files').findOne(metaQuery);
    if (existing) {
      // Delete the existing file from GridFS (files and chunks)
      await bucket.delete(existing._id);
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
        uploadedAt: new Date(),
        size: req.file.size
      }
    });
    uploadStream.end(req.file.buffer);
    uploadStream.on('finish', (file) => {
      res.status(201).json({
        message: 'File uploaded successfully',
        file: file
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
    const db = mongoose.connection.db; // Use the existing Mongoose connection
    const query = {};
    const fields = ['category', 'uploadedBy', 'programme', 'docLevel', 'year', 'batch', 'semester', 'docType'];
    
    fields.forEach(field => {
      // Build query, ensuring empty strings from frontend don't limit results
      if (req.query[field] && req.query[field] !== '') {
        query[`metadata.${field}`] = req.query[field];
      }
    });

    const files = await db.collection('files.files').find(query).toArray();
    res.json({ files });
  } catch (error) {
    console.error('Get files error:', error);
    res.status(500).json({ error: 'Server error while fetching files' });
  }
});


// Get file by ID (metadata)
router.get('/:id', async (req, res) => {
  try {
    const db = mongoose.connection.db; // Use the existing Mongoose connection
    const file = await db.collection('files.files').findOne({ _id: new ObjectId(req.params.id) });
    if (!file) {
      return res.status(404).json({ error: 'File not found' });
    }
    res.json({ file });
  } catch (error) {
    console.error('Get file error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Download file from GridFS
router.get('/:id/download', async (req, res) => {
  try {
    const bucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db, {
      bucketName: 'files'
    });
    const db = mongoose.connection.db;
    const file = await db.collection('files.files').findOne({ _id: new ObjectId(req.params.id) });
    if (!file) {
      return res.status(404).json({ error: 'File not found' });
    }
    res.set('Content-Type', file.contentType || file.metadata.contentType);
    res.set('Content-Disposition', `inline; filename="${file.filename}"`);
    const downloadStream = bucket.openDownloadStream(file._id);
    downloadStream.pipe(res);
    downloadStream.on('error', (err) => {
      console.error('GridFS download error:', err);
      res.status(500).json({ error: 'Server error during file download' });
    });
  } catch (error) {
    console.error('Download file error:', error);
    res.status(500).json({ error: 'Server error during file download' });
  }
});

module.exports = router; 