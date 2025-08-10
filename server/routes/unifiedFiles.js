const express = require('express');
const multer = require('multer');
const { ObjectId } = require('mongodb');
const router = express.Router();

// Import the unified file service
const unifiedFileService = require('../services/unifiedFileService');

// Multer configuration for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
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

// ===== FILE UPLOAD ENDPOINTS =====

// POST /api/unified-files/upload - Upload any type of file
router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Extract metadata from request body
    const metadata = {
      category: req.body.category || 'general',
      programme: req.body.programme || '',
      year: req.body.year || '',
      batch: req.body.batch || '',
      semester: req.body.semester || '',
      courseCode: req.body.courseCode || '',
      courseName: req.body.courseName || '',
      docLevel: req.body.docLevel || '',
      docType: req.body.docType || '',
      docNumber: req.body.docNumber ? parseInt(req.body.docNumber) : undefined,
      description: req.body.description || '',
      tags: req.body.tags ? req.body.tags.split(',').map(tag => tag.trim()) : [],
      assignmentId: req.body.assignmentId || null,
      uploaderEmail: req.body.uploaderEmail || '',
      reviewerEmail: req.body.reviewerEmail || '',
      uploadedBy: req.body.uploadedBy || req.body.userId || 'anonymous',
      status: req.body.status || 'pending'
    };

    // Upload file using unified service
    const uploadedFile = await unifiedFileService.uploadFile(
      req.file.buffer,
      req.file,
      metadata
    );

    res.status(201).json({
      message: 'File uploaded successfully to unified system',
      file: uploadedFile
    });

  } catch (error) {
    console.error('File upload error:', error);
    res.status(500).json({ 
      error: 'File upload failed', 
      details: error.message 
    });
  }
});

// ===== FILE RETRIEVAL ENDPOINTS =====

// GET /api/unified-files - Get all files with filtering and pagination
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    
    // Extract filters from query parameters
    const filters = {};
    const filterFields = [
      'category', 'programme', 'year', 'batch', 'semester', 
      'courseCode', 'courseName', 'docType', 'status'
    ];
    
    filterFields.forEach(field => {
      if (req.query[field] && req.query[field] !== '') {
        filters[field] = req.query[field];
      }
    });

    const result = await unifiedFileService.getAllFiles(filters, page, limit);
    res.json(result);

  } catch (error) {
    console.error('Get files error:', error);
    res.status(500).json({ 
      error: 'Failed to retrieve files', 
      details: error.message 
    });
  }
});

// GET /api/unified-files/search - Search files
router.get('/search', async (req, res) => {
  try {
    const searchTerm = req.query.q || '';
    const filters = {};
    
    // Extract additional filters
    const filterFields = ['category', 'programme', 'year', 'courseCode'];
    filterFields.forEach(field => {
      if (req.query[field] && req.query[field] !== '') {
        filters[field] = req.query[field];
      }
    });

    const files = await unifiedFileService.searchFiles(searchTerm, filters);
    res.json({ files, searchTerm, filters });

  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ 
      error: 'Search failed', 
      details: error.message 
    });
  }
});

// GET /api/unified-files/academic - Get files by academic criteria
router.get('/academic', async (req, res) => {
  try {
    const criteria = {
      programme: req.query.programme,
      year: req.query.year,
      batch: req.query.batch,
      semester: req.query.semester,
      courseCode: req.query.courseCode,
      docType: req.query.docType,
      category: req.query.category
    };

    const files = await unifiedFileService.getFilesByAcademicCriteria(criteria);
    res.json({ files, criteria });

  } catch (error) {
    console.error('Academic search error:', error);
    res.status(500).json({ 
      error: 'Academic search failed', 
      details: error.message 
    });
  }
});

// GET /api/unified-files/assignments/:assignmentId - Get assignment files
router.get('/assignments/:assignmentId', async (req, res) => {
  try {
    const { assignmentId } = req.params;
    
    if (!ObjectId.isValid(assignmentId)) {
      return res.status(400).json({ error: 'Invalid assignment ID' });
    }

    const files = await unifiedFileService.getAssignmentFiles(assignmentId);
    res.json({ files, assignmentId });

  } catch (error) {
    console.error('Get assignment files error:', error);
    res.status(500).json({ 
      error: 'Failed to get assignment files', 
      details: error.message 
    });
  }
});

// GET /api/unified-files/curriculum - Get curriculum files
router.get('/curriculum', async (req, res) => {
  try {
    const { programme, year, courseCode } = req.query;
    const files = await unifiedFileService.getCurriculumFiles(programme, year, courseCode);
    res.json({ files, filters: { programme, year, courseCode } });

  } catch (error) {
    console.error('Get curriculum files error:', error);
    res.status(500).json({ 
      error: 'Failed to get curriculum files', 
      details: error.message 
    });
  }
});

// GET /api/unified-files/:id - Get file by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid file ID' });
    }

    const file = await unifiedFileService.getFileById(id);
    
    if (!file) {
      return res.status(404).json({ error: 'File not found' });
    }

    res.json({ file });

  } catch (error) {
    console.error('Get file error:', error);
    res.status(500).json({ 
      error: 'Failed to get file', 
      details: error.message 
    });
  }
});

// ===== FILE DOWNLOAD ENDPOINT =====

// GET /api/unified-files/:id/download - Download file
router.get('/:id/download', async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid file ID' });
    }

    const file = await unifiedFileService.getFileById(id);
    
    if (!file) {
      return res.status(404).json({ error: 'File not found' });
    }

    // Set response headers
    res.set('Content-Type', file.contentType);
    res.set('Content-Disposition', `inline; filename="${file.originalName}"`);
    res.set('Content-Length', file.size);

    // Stream the file
    const fileStream = await unifiedFileService.getFileStream(id);
    fileStream.pipe(res);

    fileStream.on('error', (err) => {
      console.error('File stream error:', err);
      if (!res.headersSent) {
        res.status(500).json({ error: 'File download failed' });
      }
    });

  } catch (error) {
    console.error('Download error:', error);
    if (!res.headersSent) {
      res.status(500).json({ 
        error: 'Download failed', 
        details: error.message 
      });
    }
  }
});

// ===== FILE UPDATE ENDPOINTS =====

// PUT /api/unified-files/:id - Update file metadata
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid file ID' });
    }

    const updateData = req.body;
    const updatedFile = await unifiedFileService.updateFileMetadata(id, updateData);

    res.json({
      message: 'File metadata updated successfully',
      file: updatedFile
    });

  } catch (error) {
    console.error('Update error:', error);
    res.status(500).json({ 
      error: 'Update failed', 
      details: error.message 
    });
  }
});

// ===== FILE DELETE ENDPOINT =====

// DELETE /api/unified-files/:id - Delete file
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid file ID' });
    }

    await unifiedFileService.deleteFile(id);

    res.json({
      message: 'File deleted successfully',
      fileId: id
    });

  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({ 
      error: 'Delete failed', 
      details: error.message 
    });
  }
});

// ===== STATISTICS ENDPOINT =====

// GET /api/unified-files/stats/overview - Get file statistics
router.get('/stats/overview', async (req, res) => {
  try {
    const stats = await unifiedFileService.getFileStats();
    res.json(stats);

  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({ 
      error: 'Failed to get statistics', 
      details: error.message 
    });
  }
});

// ===== MIGRATION ENDPOINT =====

// POST /api/unified-files/migrate - Migrate existing files (Admin only)
router.post('/migrate', async (req, res) => {
  try {
    // TODO: Add admin authentication check here
    
    await unifiedFileService.migrateExistingFiles();
    
    res.json({
      message: 'Migration completed successfully',
      timestamp: new Date()
    });

  } catch (error) {
    console.error('Migration error:', error);
    res.status(500).json({ 
      error: 'Migration failed', 
      details: error.message 
    });
  }
});

module.exports = router;
