const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Task = require('../models/Task');
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

// Get all assignments
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

// Review assignment - approve or reject
router.post('/assignments/:id/review', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { action, comment, reviewerEmail } = req.body;

    if (!['approve', 'reject'].includes(action)) {
      return res.status(400).json({ error: 'Invalid action. Must be "approve" or "reject"' });
    }

    const assignment = await Task.findById(id).populate('assignedToReviewer').populate('assignedToInitiator');

    if (!assignment) {
      return res.status(404).json({ error: 'Assignment not found' });
    }

    // Check if user is authorized to review
    if (!assignment.assignedToReviewer || assignment.assignedToReviewer.email !== reviewerEmail) {
      return res.status(403).json({ error: 'Not authorized to review this assignment' });
    }

    // Check if assignment is in reviewable state
    if (!['file-uploaded', 'in-review'].includes(assignment.status)) {
      return res.status(400).json({ error: 'Assignment is not in a reviewable state' });
    }

    // Update assignment based on action
    const updateData = {
      status: action === 'approve' ? 'approved-by-reviewer' : 'assigned', // Reset to assigned if rejected
      reviewDate: new Date()
    };

    // Add review comment
    const reviewComment = {
      reviewerEmail,
      action,
      comment: comment || '',
      timestamp: new Date()
    };

    // Add to review comments array
    const updatedAssignment = await Task.findByIdAndUpdate(
      id,
      { 
        ...updateData,
        $push: { reviewComments: reviewComment }
      },
      { new: true }
    ).populate('assignedToInitiator', 'name email')
     .populate('assignedToReviewer', 'name email');

    // Create notification for initiator
    const Notification = require('../models/Notification');
    
    if (assignment.assignedToInitiator) {
      await Notification.create({
        userId: assignment.assignedToInitiator._id,
        type: action === 'approve' ? 'approval' : 'rejection',
        title: `Assignment ${action === 'approve' ? 'Approved' : 'Rejected'}`,
        message: `Your document for ${assignment.courseCode} - ${assignment.courseName} has been ${action}d by the reviewer.${comment ? ` Comment: ${comment}` : ''}`,
        relatedId: assignment._id,
        relatedModel: 'Task'
      });
    }

    // Create notification for admin if approved
    if (action === 'approve') {
      const adminUsers = await User.find({ role: 'admin' });
      for (const admin of adminUsers) {
        await Notification.create({
          userId: admin._id,
          type: 'approval',
          title: 'Assignment Ready for Final Approval',
          message: `${assignment.courseCode} - ${assignment.courseName} has been approved by reviewer and needs admin approval.`,
          relatedId: assignment._id,
          relatedModel: 'Task'
        });
      }
    }

    res.json({
      message: `Assignment ${action}d successfully`,
      assignment: updatedAssignment
    });

  } catch (error) {
    console.error('Error reviewing assignment:', error);
    res.status(500).json({ error: 'Failed to review assignment' });
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
