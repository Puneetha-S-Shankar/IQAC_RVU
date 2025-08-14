const express = require('express');
const router = express.Router();
const reviewDocumentService = require('../services/reviewDocumentService');
const { authenticateToken } = require('./auth');

// Apply authentication to all routes
router.use(authenticateToken);

/**
 * Generate review document for a completed task
 * POST /api/review-documents/generate
 * Body: { taskId: string }
 */
router.post('/generate', async (req, res) => {
  try {
    const { taskId } = req.body;
    
    if (!taskId) {
      return res.status(400).json({ error: 'Task ID is required' });
    }

    // Check if user has permission (admin only for generating review documents)
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Only administrators can generate review documents' });
    }

    console.log(`Generating review document for task: ${taskId}`);
    
    // Generate the PDF
    const pdfBuffer = await reviewDocumentService.generateReviewDocument(taskId);
    
    // Set headers for PDF download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="review-document-${taskId}.pdf"`);
    res.setHeader('Content-Length', pdfBuffer.length);
    
    // Send the PDF
    res.send(pdfBuffer);
    
  } catch (error) {
    console.error('Error generating review document:', error);
    
    if (error.message === 'Task not found') {
      return res.status(404).json({ error: 'Task not found' });
    }
    
    if (error.message === 'Task must be completed to generate review document') {
      return res.status(400).json({ error: 'Task must be completed to generate review document' });
    }
    
    res.status(500).json({ error: 'Failed to generate review document' });
  }
});

/**
 * Get review document generation status
 * GET /api/review-documents/status/:taskId
 */
router.get('/status/:taskId', async (req, res) => {
  try {
    const { taskId } = req.params;
    const Task = require('../models/Task');
    
    const task = await Task.findById(taskId);
    
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }
    
    const canGenerate = task.status === 'approved-by-admin' || task.status === 'completed';
    
    res.json({
      taskId,
      status: task.status,
      canGenerateReview: canGenerate,
      completedAt: canGenerate ? task.updatedAt : null
    });
    
  } catch (error) {
    console.error('Error checking review document status:', error);
    res.status(500).json({ error: 'Failed to check status' });
  }
});

module.exports = router;
