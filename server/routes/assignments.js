const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Task = require('../models/Task');
const Notification = require('../models/Notification');
const { authenticateToken } = require('./auth');

// Middleware to check if user is admin
const requireAdmin = async (req, res, next) => {
  try {
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }
    next();
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

// Get all assignments (Admin only for full list)
router.get('/assignments', authenticateToken, async (req, res) => {
  try {
    const assignments = await Task.find()
      .populate('assignedToInitiator', 'name email')
      .populate('assignedToReviewer', 'name email')
      .sort({ createdAt: -1 });
    
    res.json(assignments);
  } catch (error) {
    console.error('Error fetching assignments:', error);
    res.status(500).json({ error: 'Failed to fetch assignments' });
  }
});

// Get assignments for current user (initiator or reviewer)
router.get('/assignments/my-tasks', authenticateToken, async (req, res) => {
  try {
    const userId = req.user._id;
    
    const assignments = await Task.find({
      $or: [
        { assignedToInitiator: userId },
        { assignedToReviewer: userId }
      ]
    })
      .populate('assignedToInitiator', 'name email')
      .populate('assignedToReviewer', 'name email')
      .sort({ createdAt: -1 });
    
    res.json(assignments);
  } catch (error) {
    console.error('Error fetching user assignments:', error);
    res.status(500).json({ error: 'Failed to fetch assignments' });
  }
});

// Create new assignment
router.post('/assignments', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { 
      initiatorEmail, 
      reviewerEmail, 
      courseCode, 
      courseName, 
      assignmentType,
      description 
    } = req.body;

    // Validate required fields
    if (!initiatorEmail || !reviewerEmail || !assignmentType) {
      return res.status(400).json({ error: 'Initiator, reviewer, and assignment type are required' });
    }

    // Find initiator and reviewer users
    const initiator = await User.findOne({ email: initiatorEmail });
    const reviewer = await User.findOne({ email: reviewerEmail });

    if (!initiator) {
      return res.status(404).json({ error: `Initiator with email ${initiatorEmail} not found` });
    }

    if (!reviewer) {
      return res.status(404).json({ error: `Reviewer with email ${reviewerEmail} not found` });
    }

    // Check if initiator has appropriate role/subrole
    if (initiator.role === 'viewer' || initiator.role === 'admin') {
      return res.status(400).json({ error: 'Initiator must be a regular user (not viewer or admin)' });
    }

    // Check if reviewer has appropriate role/subrole
    if (reviewer.role === 'viewer' || reviewer.role === 'admin') {
      return res.status(400).json({ error: 'Reviewer must be a regular user (not viewer or admin)' });
    }

    // Update user course assignments (only if courseCode and courseName are provided)
    if (courseCode && courseName) {
      await User.findByIdAndUpdate(initiator._id, {
        subrole: 'initiator',
        courseCode,
        courseName
      });

      await User.findByIdAndUpdate(reviewer._id, {
        subrole: 'reviewer',
        courseCode,
        courseName
      });
    } else {
      // Just update subroles if course info isn't provided
      await User.findByIdAndUpdate(initiator._id, { subrole: 'initiator' });
      await User.findByIdAndUpdate(reviewer._id, { subrole: 'reviewer' });
    }

    // Create new task assignment
    const newTask = new Task({
      title: assignmentType,
      assignedToInitiator: initiator._id,
      assignedToReviewer: reviewer._id,
      assignedBy: req.user._id,
      courseCode: courseCode || initiator.courseCode,
      courseName: courseName || initiator.courseName,
      deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days default
      description: description || `${assignmentType} assignment`,
      status: 'assigned'
    });

    await newTask.save();

    // Create notification for the initiator
    const initiatorNotification = new Notification({
      userId: initiator._id,
      type: 'task_assigned',
      title: 'New Task Assigned',
      message: `You have been assigned as initiator for: ${assignmentType}`,
      taskId: newTask._id
    });
    await initiatorNotification.save();

    // Create notification for the reviewer
    const reviewerNotification = new Notification({
      userId: reviewer._id,
      type: 'task_assigned',
      title: 'New Review Assignment',
      message: `You have been assigned as reviewer for: ${assignmentType}`,
      taskId: newTask._id
    });
    await reviewerNotification.save();

    // Populate the created task for response
    const populatedTask = await Task.findById(newTask._id)
      .populate('assignedToInitiator', 'name email')
      .populate('assignedToReviewer', 'name email');

    res.status(201).json({
      message: 'Assignment created successfully',
      assignment: populatedTask
    });

  } catch (error) {
    console.error('Error creating assignment:', error);
    res.status(500).json({ error: 'Failed to create assignment' });
  }
});

// Update assignment status
router.patch('/assignments/:id/status', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = [
      'assigned', 
      'file-uploaded', 
      'in-review', 
      'approved-by-reviewer', 
      'approved-by-admin', 
      'completed'
    ];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const updatedTask = await Task.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    ).populate('assignedToInitiator', 'name email')
     .populate('assignedToReviewer', 'name email');

    if (!updatedTask) {
      return res.status(404).json({ error: 'Assignment not found' });
    }

    res.json({
      message: 'Assignment status updated successfully',
      assignment: updatedTask
    });

  } catch (error) {
    console.error('Error updating assignment status:', error);
    res.status(500).json({ error: 'Failed to update assignment status' });
  }
});

// Delete assignment
router.delete('/assignments/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const deletedTask = await Task.findByIdAndDelete(id);

    if (!deletedTask) {
      return res.status(404).json({ error: 'Assignment not found' });
    }

    res.json({ message: 'Assignment deleted successfully' });

  } catch (error) {
    console.error('Error deleting assignment:', error);
    res.status(500).json({ error: 'Failed to delete assignment' });
  }
});

// Get all users for role management
router.get('/users', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const users = await User.find({}, '-password').sort({ name: 1 });
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Update user role and course assignment
router.patch('/users/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { role, subrole, courseCode, courseName } = req.body;

    const validRoles = ['admin', 'user', 'viewer'];
    const validSubroles = ['initiator', 'reviewer', 'none'];

    if (role && !validRoles.includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }

    if (subrole && !validSubroles.includes(subrole)) {
      return res.status(400).json({ error: 'Invalid subrole' });
    }

    const updateData = {};
    if (role !== undefined) updateData.role = role;
    if (subrole !== undefined) updateData.subrole = subrole;
    if (courseCode !== undefined) updateData.courseCode = courseCode;
    if (courseName !== undefined) updateData.courseName = courseName;

    const updatedUser = await User.findByIdAndUpdate(
      id,
      updateData,
      { new: true, select: '-password' }
    );

    if (!updatedUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      message: 'User updated successfully',
      user: updatedUser
    });

  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ error: 'Failed to update user' });
  }
});

// File upload for assignment (Initiator only)
router.post('/assignments/:id/upload', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { fileId } = req.body;
    const userId = req.user._id;

    // Find the assignment and verify user is the initiator
    const assignment = await Task.findById(id)
      .populate('assignedToInitiator', 'name email')
      .populate('assignedToReviewer', 'name email');

    if (!assignment) {
      return res.status(404).json({ error: 'Assignment not found' });
    }

    // Check if user is the initiator
    if (assignment.assignedToInitiator._id.toString() !== userId.toString()) {
      return res.status(403).json({ error: 'Only the initiator can upload files for this assignment' });
    }

    // Check if assignment is in correct status
    if (assignment.status !== 'assigned') {
      return res.status(400).json({ error: 'File can only be uploaded when assignment is in assigned status' });
    }

    // Update assignment status and add file
    assignment.status = 'file-uploaded';
    assignment.fileId = fileId;
    assignment.submittedAt = new Date();
    await assignment.save();

    // Create notification for reviewer
    const notification = new Notification({
      userId: assignment.assignedToReviewer._id,
      type: 'file_submitted',
      title: 'File Submitted for Review',
      message: `${assignment.assignedToInitiator.name} has submitted a file for "${assignment.title}" - awaiting your review`,
      taskId: assignment._id
    });
    await notification.save();

    res.json({
      message: 'File uploaded successfully',
      assignment: assignment
    });
  } catch (error) {
    console.error('File upload error:', error);
    res.status(500).json({ error: 'Failed to upload file' });
  }
});

// Review assignment - approve or reject
router.post('/assignments/:id/review', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { action, comment } = req.body;
    const userId = req.user._id;

    if (!['approve', 'reject'].includes(action)) {
      return res.status(400).json({ error: 'Invalid action. Must be "approve" or "reject"' });
    }

    // Find the assignment and verify user is the reviewer
    const assignment = await Task.findById(id)
      .populate('assignedToInitiator', 'name email')
      .populate('assignedToReviewer', 'name email')
      .populate('assignedBy', 'name email');

    if (!assignment) {
      return res.status(404).json({ error: 'Assignment not found' });
    }

    // Check if user is the reviewer
    if (assignment.assignedToReviewer._id.toString() !== userId.toString()) {
      return res.status(403).json({ error: 'Only the assigned reviewer can review this assignment' });
    }

    // Check if assignment is in correct status for review
    if (assignment.status !== 'file-uploaded') {
      return res.status(400).json({ error: 'Assignment must have an uploaded file to be reviewed' });
    }

    // Update assignment status based on action
    if (action === 'approve') {
      assignment.status = 'approved-by-reviewer';
      
      // Notify admin for final approval
      const adminNotification = new Notification({
        userId: assignment.assignedBy._id,
        type: 'reviewer_approved',
        title: 'Document Approved by Reviewer',
        message: `"${assignment.title}" has been approved by ${assignment.assignedToReviewer.name} and needs admin approval`,
        taskId: assignment._id
      });
      await adminNotification.save();

      // Also notify initiator about approval
      const initiatorNotification = new Notification({
        userId: assignment.assignedToInitiator._id,
        type: 'file_approved',
        title: 'Your File Was Approved',
        message: `Your submission for "${assignment.title}" has been approved by the reviewer`,
        taskId: assignment._id
      });
      await initiatorNotification.save();

    } else { // reject
      assignment.status = 'rejected';
      assignment.rejectionReason = comment || 'No reason provided';
      
      // Notify initiator about rejection
      const initiatorNotification = new Notification({
        userId: assignment.assignedToInitiator._id,
        type: 'file_rejected',
        title: 'Your File Was Rejected',
        message: `Your submission for "${assignment.title}" was rejected. Reason: ${comment || 'No reason provided'}`,
        taskId: assignment._id
      });
      await initiatorNotification.save();
    }

    // Add review comment
    assignment.reviewComments.push({
      comment: comment || '',
      reviewedBy: userId,
      reviewedAt: new Date(),
      action: action === 'approve' ? 'approved' : 'rejected'
    });

    assignment.reviewedAt = new Date();
    await assignment.save();

    res.json({
      message: `Assignment ${action}d successfully`,
      assignment: assignment
    });

  } catch (error) {
    console.error('Review error:', error);
    res.status(500).json({ error: 'Failed to review assignment' });
  }
});

// Update assignment (Admin only)
router.patch('/assignments/:id/update', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { assignedToInitiator, assignedToReviewer, deadline, courseCode, courseName } = req.body;

    // Validate that initiator and reviewer are different
    if (assignedToInitiator === assignedToReviewer) {
      return res.status(400).json({ error: 'Initiator and reviewer cannot be the same person' });
    }

    // Find the assignment
    const assignment = await Task.findById(id)
      .populate('assignedToInitiator', 'name email')
      .populate('assignedToReviewer', 'name email');

    if (!assignment) {
      return res.status(404).json({ error: 'Assignment not found' });
    }

    // Store old assignments for notifications
    const oldInitiator = assignment.assignedToInitiator;
    const oldReviewer = assignment.assignedToReviewer;

    // Update the assignment
    const updatedAssignment = await Task.findByIdAndUpdate(
      id,
      {
        assignedToInitiator,
        assignedToReviewer,
        deadline: new Date(deadline),
        courseCode,
        courseName
      },
      { new: true }
    )
    .populate('assignedToInitiator', 'name email')
    .populate('assignedToReviewer', 'name email');

    // Send notifications to changed users
    const notifications = [];

    // Notify old initiator if changed
    if (oldInitiator._id.toString() !== assignedToInitiator) {
      notifications.push(new Notification({
        userId: oldInitiator._id,
        type: 'assignment_changed',
        title: 'Assignment Updated',
        message: `You have been removed as initiator from "${updatedAssignment.title}" assignment`,
        taskId: assignment._id
      }));
    }

    // Notify old reviewer if changed
    if (oldReviewer._id.toString() !== assignedToReviewer) {
      notifications.push(new Notification({
        userId: oldReviewer._id,
        type: 'assignment_changed',
        title: 'Assignment Updated',
        message: `You have been removed as reviewer from "${updatedAssignment.title}" assignment`,
        taskId: assignment._id
      }));
    }

    // Notify new initiator if changed
    if (oldInitiator._id.toString() !== assignedToInitiator) {
      notifications.push(new Notification({
        userId: assignedToInitiator,
        type: 'assignment_assigned',
        title: 'New Assignment',
        message: `You have been assigned as initiator for "${updatedAssignment.title}"`,
        taskId: assignment._id
      }));
    }

    // Notify new reviewer if changed
    if (oldReviewer._id.toString() !== assignedToReviewer) {
      notifications.push(new Notification({
        userId: assignedToReviewer,
        type: 'assignment_assigned',
        title: 'New Review Assignment',
        message: `You have been assigned as reviewer for "${updatedAssignment.title}"`,
        taskId: assignment._id
      }));
    }

    // Save all notifications
    await Promise.all(notifications.map(notification => notification.save()));

    res.json({
      message: 'Assignment updated successfully',
      assignment: updatedAssignment
    });

  } catch (error) {
    console.error('Error updating assignment:', error);
    res.status(500).json({ error: 'Failed to update assignment' });
  }
});

// Admin approval for reviewed assignments
router.post('/assignments/:id/admin-approve', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { comment } = req.body;

    const assignment = await Task.findById(id);

    if (!assignment) {
      return res.status(404).json({ error: 'Assignment not found' });
    }

    if (assignment.status !== 'approved-by-reviewer') {
      return res.status(400).json({ error: 'Assignment must be approved by reviewer first' });
    }

    const updatedAssignment = await Task.findByIdAndUpdate(
      id,
      { 
        status: 'completed',
        adminApprovalDate: new Date(),
        $push: { 
          reviewComments: {
            reviewerEmail: 'admin',
            action: 'admin-approve',
            comment: comment || 'Approved by admin',
            timestamp: new Date()
          }
        }
      },
      { new: true }
    ).populate('assignedToInitiator', 'name email')
     .populate('assignedToReviewer', 'name email');

    res.json({
      message: 'Assignment approved by admin and marked as completed',
      assignment: updatedAssignment
    });

  } catch (error) {
    console.error('Error approving assignment:', error);
    res.status(500).json({ error: 'Failed to approve assignment' });
  }
});

module.exports = router;
