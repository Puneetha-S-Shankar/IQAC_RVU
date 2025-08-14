const mongoose = require('mongoose');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

class ReviewDocumentService {
  
  /**
   * Generate a professional review document for a completed task
   * @param {String} taskId - The ID of the completed task
   * @returns {Buffer} PDF buffer
   */
  async generateReviewDocument(taskId) {
    try {
      const Task = require('../models/Task');
      const User = require('../models/User');
      
      // Get task with all related data
      const task = await Task.findById(taskId)
        .populate('assignedToInitiator')
        .populate('assignedToInitiators')
        .populate('assignedToReviewer')
        .populate('assignedToReviewers')
        .populate('adminApprover');

      if (!task) {
        throw new Error('Task not found');
      }

      if (task.status !== 'approved-by-admin' && task.status !== 'completed') {
        throw new Error('Task must be completed (approved by admin) to generate review document');
      }

      // Create PDF document
      const doc = new PDFDocument({ margin: 50 });
      const chunks = [];
      
      doc.on('data', chunk => chunks.push(chunk));
      
      return new Promise((resolve, reject) => {
        doc.on('end', () => {
          const pdfBuffer = Buffer.concat(chunks);
          resolve(pdfBuffer);
        });

        doc.on('error', reject);

        this.buildReviewDocument(doc, task);
        doc.end();
      });

    } catch (error) {
      console.error('Error generating review document:', error);
      throw error;
    }
  }

  /**
   * Build the PDF content for the review document
   */
  buildReviewDocument(doc, task) {
    // Header
    this.addHeader(doc, task);
    
    // Task Details Section
    this.addTaskDetails(doc, task);
    
    // Participants Section
    this.addParticipants(doc, task);
    
    // Process Timeline Section
    this.addProcessTimeline(doc, task);
    
    // Review History Section
    this.addReviewHistory(doc, task);
    
    // Final Approval Section
    this.addFinalApproval(doc, task);
    
    // Footer
    this.addFooter(doc);
  }

  addHeader(doc, task) {
    // Title
    doc.fontSize(20)
       .font('Helvetica-Bold')
       .text('PROFESSIONAL REVIEW DOCUMENT', { align: 'center' });
    
    doc.moveDown(0.5);
    
    // Subtitle
    doc.fontSize(16)
       .font('Helvetica')
       .text('Internal Quality Assurance Cell (IQAC)', { align: 'center' });
    
    doc.moveDown(0.5);
    
    // Document ID and Date
    doc.fontSize(12)
       .text(`Document ID: PRD-${task._id.toString().slice(-8).toUpperCase()}`, { align: 'center' })
       .text(`Generated on: ${new Date().toLocaleDateString('en-US', { 
         year: 'numeric', 
         month: 'long', 
         day: 'numeric',
         hour: '2-digit',
         minute: '2-digit'
       })}`, { align: 'center' });
    
    doc.moveDown(1);
    
    // Add horizontal line
    doc.strokeColor('#000000')
       .lineWidth(1)
       .moveTo(50, doc.y)
       .lineTo(550, doc.y)
       .stroke();
    
    doc.moveDown(1);
  }

  addTaskDetails(doc, task) {
    doc.fontSize(14)
       .font('Helvetica-Bold')
       .text('TASK DETAILS', { underline: true });
    
    doc.moveDown(0.5);
    
    doc.fontSize(11)
       .font('Helvetica');
    
    const details = [
      ['Title:', task.title],
      ['Description:', task.description],
      ['Course Code:', task.courseCode],
      ['Course Name:', task.courseName],
      ['Category:', task.category],
      ['Document Type:', task.docType || 'Not specified'],
      ['Created Date:', new Date(task.createdAt).toLocaleDateString()],
      ['Due Date:', task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'Not specified'],
      ['Completion Date:', new Date(task.updatedAt).toLocaleDateString()],
    ];

    details.forEach(([label, value]) => {
      doc.text(`${label}`, { continued: true, width: 120 })
         .font('Helvetica')
         .text(value || 'Not specified');
      doc.moveDown(0.3);
    });
    
    doc.moveDown(0.5);
  }

  addParticipants(doc, task) {
    doc.fontSize(14)
       .font('Helvetica-Bold')
       .text('PARTICIPANTS', { underline: true });
    
    doc.moveDown(0.5);
    
    doc.fontSize(11)
       .font('Helvetica');

    // Initiators
    doc.font('Helvetica-Bold').text('Initiator(s):');
    if (task.assignedToInitiators && task.assignedToInitiators.length > 0) {
      task.assignedToInitiators.forEach(initiator => {
        doc.font('Helvetica')
           .text(`• ${initiator.name} (${initiator.email})`, { indent: 20 });
      });
    } else if (task.assignedToInitiator) {
      doc.font('Helvetica')
         .text(`• ${task.assignedToInitiator.name} (${task.assignedToInitiator.email})`, { indent: 20 });
    }
    
    doc.moveDown(0.3);

    // Reviewers
    doc.font('Helvetica-Bold').text('Reviewer(s):');
    if (task.assignedToReviewers && task.assignedToReviewers.length > 0) {
      task.assignedToReviewers.forEach(reviewer => {
        doc.font('Helvetica')
           .text(`• ${reviewer.name} (${reviewer.email})`, { indent: 20 });
      });
    } else if (task.assignedToReviewer) {
      doc.font('Helvetica')
         .text(`• ${task.assignedToReviewer.name} (${task.assignedToReviewer.email})`, { indent: 20 });
    }
    
    doc.moveDown(0.3);

    // Admin Approver
    if (task.adminApprover) {
      doc.font('Helvetica-Bold').text('Final Approver:');
      doc.font('Helvetica')
         .text(`• ${task.adminApprover.name} (${task.adminApprover.email})`, { indent: 20 });
    }
    
    doc.moveDown(0.5);
  }

  addProcessTimeline(doc, task) {
    doc.fontSize(14)
       .font('Helvetica-Bold')
       .text('PROCESS TIMELINE', { underline: true });
    
    doc.moveDown(0.5);
    
    doc.fontSize(11)
       .font('Helvetica');

    const timeline = [
      {
        event: 'Task Created',
        date: new Date(task.createdAt),
        description: `Task assigned to initiator(s)`
      },
      {
        event: 'File Uploaded',
        date: task.fileUploadDate ? new Date(task.fileUploadDate) : null,
        description: 'Document submitted by initiator'
      },
      {
        event: 'Review Process',
        date: task.reviewStartDate ? new Date(task.reviewStartDate) : null,
        description: 'Document under review by assigned reviewer(s)'
      },
      {
        event: 'Task Completed',
        date: new Date(task.updatedAt),
        description: 'Final approval and task completion'
      }
    ].filter(item => item.date); // Only show events that have dates

    timeline.forEach((item, index) => {
      doc.font('Helvetica-Bold')
         .text(`${index + 1}. ${item.event}:`, { continued: true })
         .font('Helvetica')
         .text(` ${item.date.toLocaleDateString()} ${item.date.toLocaleTimeString()}`);
      
      if (item.description) {
        doc.text(item.description, { indent: 20 });
      }
      
      doc.moveDown(0.3);
    });
    
    doc.moveDown(0.5);
  }

  addReviewHistory(doc, task) {
    doc.fontSize(14)
       .font('Helvetica-Bold')
       .text('REVIEW HISTORY', { underline: true });
    
    doc.moveDown(0.5);
    
    doc.fontSize(11)
       .font('Helvetica');

    if (task.reviewerApprovals && task.reviewerApprovals.length > 0) {
      task.reviewerApprovals.forEach((approval, index) => {
        doc.font('Helvetica-Bold')
           .text(`Review ${index + 1}:`);
        
        doc.font('Helvetica')
           .text(`Reviewer: ${approval.reviewerName || approval.reviewerEmail}`, { indent: 20 })
           .text(`Date: ${new Date(approval.timestamp).toLocaleDateString()} ${new Date(approval.timestamp).toLocaleTimeString()}`, { indent: 20 })
           .text(`Status: ${approval.status.toUpperCase()}`, { indent: 20 });
        
        if (approval.comment) {
          doc.text(`Comment: ${approval.comment}`, { indent: 20 });
        }
        
        doc.moveDown(0.3);
      });
    } else {
      doc.text('No review history available.');
    }
    
    doc.moveDown(0.5);
  }

  addFinalApproval(doc, task) {
    doc.fontSize(14)
       .font('Helvetica-Bold')
       .text('FINAL APPROVAL', { underline: true });
    
    doc.moveDown(0.5);
    
    doc.fontSize(11)
       .font('Helvetica');

    if (task.adminApprover) {
      doc.text(`Approved by: ${task.adminApprover.name}`);
      doc.text(`Email: ${task.adminApprover.email}`);
      doc.text(`Date: ${new Date(task.updatedAt).toLocaleDateString()} ${new Date(task.updatedAt).toLocaleTimeString()}`);
      doc.text(`Status: COMPLETED`);
    } else {
      doc.text('Admin approval information not available.');
    }
    
    doc.moveDown(0.5);
  }

  addFooter(doc) {
    // Add a new page if needed
    if (doc.y > 700) {
      doc.addPage();
    }
    
    // Move to bottom of page
    doc.y = 720;
    
    // Add horizontal line
    doc.strokeColor('#000000')
       .lineWidth(0.5)
       .moveTo(50, doc.y)
       .lineTo(550, doc.y)
       .stroke();
    
    doc.moveDown(0.5);
    
    doc.fontSize(9)
       .font('Helvetica')
       .text('This document is auto-generated by the IQAC Management System.', { align: 'center' })
       .text('For verification, please contact the IQAC office.', { align: 'center' });
  }
}

module.exports = new ReviewDocumentService();
