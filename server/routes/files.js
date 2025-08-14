const express = require('express');
const multer = require('multer');
const { ObjectId } = require('mongodb');
const mongoose = require('mongoose'); // Import Mongoose
const { authenticateToken } = require('./auth');
const router = express.Router();

// Apply authentication to all routes except preview
router.use((req, res, next) => {
  // Skip authentication for preview endpoint with token
  if (req.path.includes('/download') && req.query.token) {
    return next();
  }
  // Apply authentication for all other routes
  authenticateToken(req, res, next);
});

// Use multer memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit
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

    const { docNumber, category, assignmentId } = req.body;
    const uploaderEmail = req.user.email; // Get from authenticated user
    
    // Handle assignment-based uploads for teaching-and-learning
    if (category === 'teaching-and-learning' && assignmentId) {
      // Import Task model for assignment updates
      const Task = require('../models/Task');
      
      // Check if assignment exists and user is authorized
      const assignment = await Task.findById(assignmentId)
        .populate('assignedToInitiator')
        .populate('assignedToInitiators');
      
      if (!assignment) {
        return res.status(404).json({ error: 'Assignment not found' });
      }
      
      // Check authorization for both single and multiple initiators
      let isAuthorized = false;
      
      // Check new multiple initiators array
      if (assignment.assignedToInitiators && assignment.assignedToInitiators.length > 0) {
        isAuthorized = assignment.assignedToInitiators.some(initiator => 
          initiator.email === uploaderEmail
        );
      }
      
      // Fallback to legacy single initiator
      if (!isAuthorized && assignment.assignedToInitiator) {
        isAuthorized = assignment.assignedToInitiator.email === uploaderEmail;
      }
      
      if (!isAuthorized) {
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
      
      // Create upload stream with assignment metadata and fileID
      const assignmentMetadata = {
        category,
        assignmentId,
        uploaderEmail,
        courseCode: assignment.courseCode,
        courseName: assignment.courseName,
        year: new Date().getFullYear().toString(),
        docType: 'assignment-submission',
        uploadDate: new Date(),
        status: 'uploaded'
      };

      // Generate fileID for assignment
      const generateFileID = (metadata) => {
        if (!metadata || !metadata.year || !metadata.courseCode || !metadata.docType) {
          return null;
        }

        const cleanString = (str) => {
          return str.toString()
            .toLowerCase()
            .replace(/[^a-z0-9]/g, '')
            .trim();
        };

        const parts = [
          metadata.year,
          cleanString(metadata.courseCode),
          cleanString(metadata.docType)
        ].filter(part => part && part.length > 0);

        if (parts.length < 2) {
          return null;
        }

        return parts.join('_');
      };

      const fileID = generateFileID(assignmentMetadata);
      if (fileID) {
        assignmentMetadata.fileID = fileID;
      }

      const uploadStream = bucket.openUploadStream(req.file.originalname, {
        contentType: req.file.mimetype,
        fileID: fileID, // Store fileID at top level
        metadata: assignmentMetadata
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
            fileID: assignmentMetadata.fileID || null,
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

    // Generate fileID before upload
    const generateFileID = (metadata) => {
      console.log('Generating fileID for metadata:', {
        year: metadata.year,
        courseCode: metadata.courseCode,
        docType: metadata.docType,
        programme: metadata.programme
      });

      // Try with year, courseCode, docType first
      if (metadata.year && metadata.courseCode && metadata.docType) {
        const cleanString = (str) => {
          return str.toString()
            .toLowerCase()
            .replace(/[^a-z0-9]/g, '')
            .trim();
        };

        const parts = [
          metadata.year,
          cleanString(metadata.courseCode),
          cleanString(metadata.docType)
        ].filter(part => part && part.length > 0);

        if (parts.length >= 3) {
          const fileID = parts.join('_');
          console.log('Generated fileID:', fileID);
          return fileID;
        }
      }

      // Fallback: try with year, programme, docType if courseCode is missing
      if (metadata.year && metadata.programme && metadata.docType) {
        const cleanString = (str) => {
          return str.toString()
            .toLowerCase()
            .replace(/[^a-z0-9]/g, '')
            .trim();
        };

        const parts = [
          metadata.year,
          cleanString(metadata.programme),
          cleanString(metadata.docType)
        ].filter(part => part && part.length > 0);

        if (parts.length >= 3) {
          const fileID = parts.join('_');
          console.log('Generated fallback fileID:', fileID);
          return fileID;
        }
      }

      console.log('Could not generate fileID - insufficient metadata');
      return null;
    };

    // Prepare metadata for fileID generation
    const fileMetadata = {
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
      courseCode: req.body.courseCode || '',
      docType: req.body.docType || '',
      docNumber: req.body.docNumber ? parseInt(req.body.docNumber) : undefined,
      uploadedAt: new Date(),
      uploadDate: req.body.uploadDate || new Date().toISOString(),
      size: req.file.size,
      contentType: req.file.mimetype,
      status: req.body.status || 'pending',
      taskId: req.body.taskId || null
    };

    // Generate fileID
    const fileID = generateFileID(fileMetadata);
    if (fileID) {
      fileMetadata.fileID = fileID;
    }

    // Upload to GridFS
    const uploadStream = bucket.openUploadStream(req.file.originalname, {
      contentType: req.file.mimetype,
      fileID: fileID, // Store fileID at top level
      metadata: fileMetadata
    });
    
    uploadStream.end(req.file.buffer);
    
    uploadStream.on('finish', () => {
      res.status(201).json({
        message: 'File uploaded successfully',
        file: {
          _id: uploadStream.id,
          fileID: fileMetadata.fileID || null,
          filename: req.file.originalname,
          metadata: fileMetadata
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

// Get file by fileID (search at top level)
router.get('/by-fileid/:fileId', async (req, res) => {
  try {
    const db = mongoose.connection.db;
    const file = await db.collection('master-files.files').findOne({ 
      'fileID': req.params.fileId 
    });
    if (!file) {
      return res.status(404).json({ error: 'File not found' });
    }
    res.json({ file });
  } catch (error) {
    console.error('Get file by fileID error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get all files (metadata) - Enhanced with fileID from GridFS
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

    // Get files from GridFS (fileID is now in metadata)
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

// Download assignment file from uploads bucket (with token query parameter for iframe access)
router.get('/:id/download', async (req, res) => {
  try {
    // Check for authentication - either header or query parameter
    let isAuthenticated = false;
    let currentUser = null;
    
    console.log('Download request for file:', req.params.id);
    console.log('Auth header present:', !!req.headers.authorization);
    console.log('Query token present:', !!req.query.token);
    
    // First try header authentication (for API calls)
    if (req.user) {
      console.log('Using header authentication for user:', req.user.email);
      isAuthenticated = true;
      currentUser = req.user;
    } 
    // Then try query parameter authentication (for iframe/preview access)
    else if (req.query.token) {
      console.log('Attempting query token authentication');
      const jwt = require('jsonwebtoken');
      const User = require('../models/User');
      
      try {
        console.log('Verifying JWT token...');
        const decoded = jwt.verify(req.query.token, process.env.JWT_SECRET || 'your-secret-key');
        console.log('Token decoded successfully, userId:', decoded.userId);
        
        const user = await User.findById(decoded.userId);
        if (user) {
          console.log('User found for token:', user.email);
          currentUser = user;
          isAuthenticated = true;
        } else {
          console.log('User not found in database for ID:', decoded.userId);
        }
      } catch (tokenError) {
        console.log('Token validation error:', tokenError.message);
      }
    }
    
    if (!isAuthenticated) {
      console.log('Authentication failed - returning 401');
      return res.status(401).json({ error: 'Access token required' });
    }

    console.log('Authentication successful for user:', currentUser.email);

    const db = mongoose.connection.db;
    const fileId = req.params.id;
    
    // Use master-files collection only
    let file = await db.collection('master-files.files').findOne({ _id: new ObjectId(fileId) });
    let bucketName = 'master-files';
    
    if (!file) {
      console.log('File not found:', fileId);
      return res.status(404).json({ error: 'File not found' });
    }
    
    console.log('File found, serving:', file.filename);
    
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
    
    downloadStream.on('end', () => {
      console.log('File download completed for:', file.filename);
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