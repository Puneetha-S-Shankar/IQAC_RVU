const express = require('express');
const Task = require('../models/Task');
const Notification = require('../models/Notification');
const User = require('../models/User');
const { authenticateToken } = require('./auth');
const router = express.Router();

// Apply authentication to all routes
router.use(authenticateToken);

// Create a new task (Admin only)
router.post('/create', async (req, res) => {
  try {
    const { title, description, category, docNumber, assignedTo, deadline, assignedBy } = req.body;
    
    // Create the task
    const task = new Task({
      title,
      description,
      category,
      docNumber,
      assignedTo,
      assignedBy,
      deadline: new Date(deadline)
    });
    
    await task.save();
    
    // Create notification for the assigned user
    const notification = new Notification({
      userId: assignedTo,
      type: 'task_assigned',
      title: 'New Task Assigned',
      message: `You have been assigned a new task: ${title}`,
      taskId: task._id
    });
    
    await notification.save();
    
    res.status(201).json({ 
      message: 'Task created successfully',
      task: task
    });
  } catch (error) {
    console.error('Task creation error:', error);
    res.status(500).json({ error: 'Failed to create task' });
  }
});

// Get tasks for a specific user (SIMPLIFIED!)
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const requestingUser = req.user;
    
    // Users can only see their own tasks (unless admin)
    if (requestingUser.role !== 'admin' && requestingUser._id.toString() !== userId) {
      return res.status(403).json({ error: 'You can only view your own tasks' });
    }
    
    // Use the simple findForUser method
    const tasks = await Task.findForUser(userId, requestingUser.role);
    
    res.json(tasks);
  } catch (error) {
    console.error('Get user tasks error:', error);
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
});

// Get current user's tasks (SUPER SIMPLE!)
router.get('/my-tasks', async (req, res) => {
  try {
    const userId = req.user._id;
    const userRole = req.user.role;
    
    // ONE LINE - Get tasks directly assigned to user
    const tasks = await Task.findForUser(userId, userRole);
    
    res.json(tasks);
  } catch (error) {
    console.error('Get my tasks error:', error);
    res.status(500).json({ error: 'Failed to fetch my tasks' });
  }
});

// Get specific task with access control (SIMPLIFIED!)
router.get('/:taskId', async (req, res) => {
  try {
    const { taskId } = req.params;
    const userId = req.user._id;
    const userRole = req.user.role;
    
    const task = await Task.findById(taskId)
      .populate('assignedToInitiator assignedToReviewer assignedBy', 'firstName lastName email');
    
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }
    
    // SIMPLE ACCESS CHECK - One line!
    if (!task.canUserAccess(userId, userRole)) {
      return res.status(403).json({ error: 'You do not have access to this task' });
    }
    
    res.json(task);
  } catch (error) {
    console.error('Get task error:', error);
    res.status(500).json({ error: 'Failed to fetch task' });
  }
});

// Upload file for task (SIMPLE PERMISSION CHECK)
router.post('/:taskId/upload', async (req, res) => {
  try {
    const { taskId } = req.params;
    const { fileId } = req.body;
    const userId = req.user._id;
    const userRole = req.user.role;
    
    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }
    
    // Check if user can upload (only initiator or admin)
    if (!task.canUserPerformAction(userId, 'upload', userRole)) {
      return res.status(403).json({ error: 'Only the assigned initiator can upload files' });
    }
    
    // Update task
    task.fileId = fileId;
    task.status = 'file-uploaded';
    task.submittedAt = new Date();
    await task.save();
    
    res.json({ message: 'File uploaded successfully', task });
  } catch (error) {
    console.error('Upload file error:', error);
    res.status(500).json({ error: 'Failed to upload file' });
  }
});

// Submit a task (User uploads file)
router.put('/:taskId/submit', async (req, res) => {
  try {
    const { taskId } = req.params;
    const { fileId } = req.body;
    
    const task = await Task.findByIdAndUpdate(
      taskId,
      {
        status: 'file-uploaded',
        fileId: fileId,
        submittedAt: new Date()
      },
      { new: true }
    ).populate('assignedToReviewer', 'firstName lastName email');
    
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }
    
    // Create notification for the reviewer
    const notification = new Notification({
      userId: task.assignedToReviewer._id,
      type: 'file_submitted',
      title: 'File Submitted for Review',
      message: `${task.title} has been submitted and awaits your review`,
      taskId: task._id,
      fileId: fileId
    });
    
    await notification.save();
    
    res.json({ 
      message: 'Task submitted successfully',
      task: task
    });
  } catch (error) {
    console.error('Task submission error:', error);
    res.status(500).json({ error: 'Failed to submit task' });
  }
});

// Approve a task (Admin only)
router.put('/:taskId/approve', async (req, res) => {
  try {
    const { taskId } = req.params;
    const { reviewedBy } = req.body;
    
    const task = await Task.findByIdAndUpdate(
      taskId,
      {
        status: 'approved-by-reviewer',
        reviewedBy: reviewedBy,
        reviewedAt: new Date()
      },
      { new: true }
    ).populate('assignedToInitiator', 'firstName lastName email');
    
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }
    
    // Create notification for the initiator
    const notification = new Notification({
      userId: task.assignedToInitiator._id,
      type: 'file_approved',
      title: 'File Approved',
      message: `Your submission for "${task.title}" has been approved`,
      taskId: task._id
    });
    
    await notification.save();
    
    res.json({ 
      message: 'Task approved successfully',
      task: task
    });
  } catch (error) {
    console.error('Task approval error:', error);
    res.status(500).json({ error: 'Failed to approve task' });
  }
});

// Reject a task (Admin only)
router.put('/:taskId/reject', async (req, res) => {
  try {
    const { taskId } = req.params;
    const { reviewedBy, rejectionReason } = req.body;
    
    const task = await Task.findByIdAndUpdate(
      taskId,
      {
        status: 'rejected',
        reviewedBy: reviewedBy,
        reviewedAt: new Date(),
        rejectionReason: rejectionReason
      },
      { new: true }
    ).populate('assignedToInitiator', 'firstName lastName email');
    
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }
    
    // Create notification for the initiator
    const notification = new Notification({
      userId: task.assignedToInitiator._id,
      type: 'file_rejected',
      title: 'File Rejected',
      message: `Your submission for "${task.title}" has been rejected. Reason: ${rejectionReason}`,
      taskId: task._id
    });
    
    await notification.save();
    
    res.json({ 
      message: 'Task rejected successfully',
      task: task
    });
  } catch (error) {
    console.error('Task rejection error:', error);
    res.status(500).json({ error: 'Failed to reject task' });
  }
});

// Get tasks by category and status (for admin dashboard)
router.get('/category/:category', async (req, res) => {
  try {
    const { category } = req.params;
    const { status } = req.query;
    
    const query = { category };
    if (status) query.status = status;
    
    const tasks = await Task.find(query)
      .populate('assignedTo', 'firstName lastName email')
      .populate('assignedBy', 'firstName lastName email')
      .sort({ createdAt: -1 });
    
    res.json(tasks);
  } catch (error) {
    console.error('Get tasks by category error:', error);
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
});

// Delete a task (Admin only)
router.delete('/:taskId', async (req, res) => {
  try {
    const { taskId } = req.params;
    
    const task = await Task.findByIdAndDelete(taskId);
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }
    
    // Delete related notifications
    await Notification.deleteMany({ taskId: taskId });
    
    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error('Task deletion error:', error);
    res.status(500).json({ error: 'Failed to delete task' });
  }
});

// Get all tasks (Admin can see all, users see assigned tasks)
router.get('/', async (req, res) => {
  try {
    console.log('GET /api/tasks - User:', req.user);
    console.log('GET /api/tasks - Query params:', req.query);
    
    const requestingUser = req.user;
    const { status, user } = req.query; // Get query parameters
    let filter = {};
    
    // Add status filter if provided
    if (status) {
      filter.status = status;
    }
    
    // Add user filter if provided (for specific user's tasks)
    if (user) {
      filter.$or = [
        { assignedToInitiator: user },
        { assignedToReviewer: user }
      ];
    }
    
    let tasks;
    
    if (requestingUser.role === 'admin') {
      console.log('GET /api/tasks - Admin user, filter:', filter);
      // Admin sees all tasks (with optional filters)
      tasks = await Task.find(filter)
        .populate('assignedToInitiator', 'username email')
        .populate('assignedToReviewer', 'username email')
        .populate('assignedBy', 'username email')
        .sort({ createdAt: -1 });
    } else {
      // Users see only their assigned tasks (with optional filters)
      const userFilter = {
        $or: [
          { assignedToInitiator: requestingUser._id },
          { assignedToReviewer: requestingUser._id }
        ]
      };
      
      // Combine user filter with other filters
      const combinedFilter = { ...filter, ...userFilter };
      console.log('GET /api/tasks - Regular user, filter:', combinedFilter);
      
      tasks = await Task.find(combinedFilter)
        .populate('assignedToInitiator', 'username email')
        .populate('assignedToReviewer', 'username email')
        .populate('assignedBy', 'username email')
        .sort({ createdAt: -1 });
    }
    
    console.log('GET /api/tasks - Found tasks:', tasks.length);
    res.json(tasks);
  } catch (error) {
    console.error('Fetch tasks error:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ error: 'Failed to fetch tasks', details: error.message });
  }
});

// Create a new task (simplified API endpoint)
router.post('/', async (req, res) => {
  try {
    console.log('POST /api/tasks - Request body:', req.body);
    console.log('POST /api/tasks - User:', req.user);
    
    const {
      title,
      description,
      courseCode,
      courseName,
      assignedToInitiator,
      assignedToReviewer,
      category,
      assignmentType
    } = req.body;
    
    console.log('POST /api/tasks - Extracted data:', {
      title, description, courseCode, courseName, 
      assignedToInitiator, assignedToReviewer, category, assignmentType
    });
    
    // Create the task
    const task = new Task({
      title: title || `${courseCode} ${assignmentType || 'Assignment'}`,
      description,
      courseCode,
      courseName,
      assignedToInitiator,
      assignedToReviewer,
      assignedBy: req.user._id,
      category: assignmentType || category || 'course-material', // Map assignmentType to category
      deadline: new Date(req.body.deadline),
      status: 'assigned'
    });
    
    console.log('POST /api/tasks - Task to save:', task);
    
    await task.save();
    
    console.log('POST /api/tasks - Task saved successfully');
    
    // Create notifications for assigned users
    if (assignedToInitiator) {
      const initiatorNotification = new Notification({
        userId: assignedToInitiator,
        type: 'task_assigned',
        title: 'New Task Assigned',
        message: `You have been assigned as initiator for: ${task.title}`,
        taskId: task._id
      });
      await initiatorNotification.save();
    }
    
    if (assignedToReviewer && assignedToReviewer !== assignedToInitiator) {
      const reviewerNotification = new Notification({
        userId: assignedToReviewer,
        type: 'task_assigned',
        title: 'New Review Task Assigned',
        message: `You have been assigned as reviewer for: ${task.title}`,
        taskId: task._id
      });
      await reviewerNotification.save();
    }
    
    const populatedTask = await Task.findById(task._id)
      .populate('assignedToInitiator', 'username email')
      .populate('assignedToReviewer', 'username email')
      .populate('assignedBy', 'username email');
    
    res.status(201).json({ 
      message: 'Task created successfully',
      task: populatedTask
    });
  } catch (error) {
    console.error('Task creation error:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ error: 'Failed to create task', details: error.message });
  }
});

// Update a task
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    const task = await Task.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    )
      .populate('assignedToInitiator', 'username email')
      .populate('assignedToReviewer', 'username email')
      .populate('assignedBy', 'username email');
    
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }
    
    res.json({
      message: 'Task updated successfully',
      task
    });
  } catch (error) {
    console.error('Task update error:', error);
    res.status(500).json({ error: 'Failed to update task' });
  }
});

module.exports = router;
