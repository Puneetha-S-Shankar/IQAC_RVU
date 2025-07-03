const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const database = require('../utils/database');
const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../uploads'));
  },
  filename: (req, file, cb) => {
    // Generate unique filename with timestamp
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Allow common file types
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-powerpoint', // .ppt
      'application/vnd.openxmlformats-officedocument.presentationml.presentation', // .pptx
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

// Upload file
router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const fileData = {
      originalName: req.file.originalname,
      filename: req.file.filename,
      mimetype: req.file.mimetype,
      size: req.file.size,
      uploadedBy: req.body.uploadedBy || req.body.userId || 'anonymous',
      category: req.body.category || 'general',
      description: req.body.description || '',
      tags: req.body.tags ? req.body.tags.split(',').map(tag => tag.trim()) : [],
      programme: req.body.programme || '',
      docLevel: req.body.docLevel || '',
      year: req.body.year || '',
      batch: req.body.batch || '',
      semester: req.body.semester || '',
      docType: req.body.docType || ''
    };

    // Check for existing file with same metadata
    const existing = (await database.readDatabase()).files.find(f =>
      f.programme === fileData.programme &&
      f.docLevel === fileData.docLevel &&
      f.year === fileData.year &&
      f.batch === fileData.batch &&
      f.semester === fileData.semester &&
      f.docType === fileData.docType
    );
    if (existing) {
      return res.status(409).json({ error: 'A file for this selection already exists.' });
    }

    const savedFile = await database.saveFile(fileData);
    
    res.status(201).json({
      message: 'File uploaded successfully',
      file: {
        _id: savedFile._id,
        originalName: savedFile.originalName,
        filename: savedFile.filename,
        mimetype: savedFile.mimetype,
        size: savedFile.size,
        uploadedBy: savedFile.uploadedBy,
        category: savedFile.category,
        description: savedFile.description,
        tags: savedFile.tags,
        programme: savedFile.programme,
        docLevel: savedFile.docLevel,
        year: savedFile.year,
        batch: savedFile.batch,
        semester: savedFile.semester,
        docType: savedFile.docType,
        uploadedAt: savedFile.uploadedAt
      }
    });
  } catch (error) {
    console.error('File upload error:', error);
    res.status(500).json({ error: 'Server error during file upload' });
  }
});

// Get all files
router.get('/', async (req, res) => {
  try {
    // Build query from all possible metadata fields
    const query = {};
    const fields = ['category', 'uploadedBy', 'programme', 'docLevel', 'year', 'batch', 'semester', 'docType'];
    fields.forEach(field => {
      if (req.query[field]) query[field] = req.query[field];
    });

    let files = await database.findFile(query);

    // Search functionality
    if (req.query.search) {
      files = files.filter(file => 
        file.originalName.toLowerCase().includes(req.query.search.toLowerCase()) ||
        file.description.toLowerCase().includes(req.query.search.toLowerCase()) ||
        file.tags.some(tag => tag.toLowerCase().includes(req.query.search.toLowerCase()))
      );
    }

    // Remove filePath from response for security
    const safeFiles = files.map(file => ({
      _id: file._id,
      originalName: file.originalName,
      filename: file.filename,
      mimetype: file.mimetype,
      size: file.size,
      uploadedBy: file.uploadedBy,
      category: file.category,
      description: file.description,
      tags: file.tags,
      programme: file.programme,
      docLevel: file.docLevel,
      year: file.year,
      batch: file.batch,
      semester: file.semester,
      docType: file.docType,
      uploadedAt: file.uploadedAt
    }));

    res.json({ files: safeFiles });
  } catch (error) {
    console.error('Get files error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get file by ID
router.get('/:id', async (req, res) => {
  try {
    const file = await database.findFileById(req.params.id);
    if (!file) {
      return res.status(404).json({ error: 'File not found' });
    }
    
    res.json({
      file: {
        _id: file._id,
        originalName: file.originalName,
        filename: file.filename,
        mimetype: file.mimetype,
        size: file.size,
        uploadedBy: file.uploadedBy,
        category: file.category,
        description: file.description,
        tags: file.tags,
        uploadedAt: file.uploadedAt
      }
    });
  } catch (error) {
    console.error('Get file error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Download file
router.get('/:id/download', async (req, res) => {
  try {
    const file = await database.findFileById(req.params.id);
    if (!file) {
      return res.status(404).json({ error: 'File not found' });
    }
    
    const filePath = path.join(__dirname, '../uploads', file.filename);
    
    // Check if file exists
    try {
      await fs.access(filePath);
    } catch {
      return res.status(404).json({ error: 'File not found on disk' });
    }
    
    res.download(filePath, file.originalName);
  } catch (error) {
    console.error('Download error:', error);
    res.status(500).json({ error: 'Server error during download' });
  }
});

// Update file metadata
router.put('/:id', async (req, res) => {
  try {
    const { description, category, tags } = req.body;
    const updateData = {};
    
    if (description !== undefined) updateData.description = description;
    if (category !== undefined) updateData.category = category;
    if (tags !== undefined) updateData.tags = Array.isArray(tags) ? tags : tags.split(',').map(tag => tag.trim());
    
    const updatedFile = await database.updateFile(req.params.id, updateData);
    if (!updatedFile) {
      return res.status(404).json({ error: 'File not found' });
    }
    
    res.json({
      message: 'File updated successfully',
      file: {
        _id: updatedFile._id,
        originalName: updatedFile.originalName,
        filename: updatedFile.filename,
        mimetype: updatedFile.mimetype,
        size: updatedFile.size,
        uploadedBy: updatedFile.uploadedBy,
        category: updatedFile.category,
        description: updatedFile.description,
        tags: updatedFile.tags,
        uploadedAt: updatedFile.uploadedAt
      }
    });
  } catch (error) {
    console.error('Update file error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete file
router.delete('/:id', async (req, res) => {
  try {
    const success = await database.deleteFile(req.params.id);
    if (!success) {
      return res.status(404).json({ error: 'File not found' });
    }
    
    res.json({ message: 'File deleted successfully' });
  } catch (error) {
    console.error('Delete file error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get file categories
router.get('/categories/list', async (req, res) => {
  try {
    const files = await database.findFile();
    const categories = [...new Set(files.map(file => file.category))];
    res.json({ categories });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router; 