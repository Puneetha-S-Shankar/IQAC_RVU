const express = require('express');
const Task = require('../models/Task');
const Notification = require('../models/Notification');
const User = require('../models/User');
const router = express.Router();

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

// Get tasks for a specific user
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const tasks = await Task.find({ assignedTo: userId })
      .populate('assignedBy', 'firstName lastName email')
      .sort({ createdAt: -1 });
    
    res.json(tasks);
  } catch (error) {
    console.error('Get user tasks error:', error);
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
});

// Get all tasks (Admin only)
router.get('/all', async (req, res) => {
  try {
    const tasks = await Task.find()
      .populate('assignedTo', 'firstName lastName email')
      .populate('assignedBy', 'firstName lastName email')
      .populate('reviewedBy', 'firstName lastName email')
      .sort({ createdAt: -1 });
    
    res.json(tasks);
  } catch (error) {
    console.error('Get all tasks error:', error);
    res.status(500).json({ error: 'Failed to fetch tasks' });
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
        status: 'submitted',
        submittedFile: fileId,
        submittedAt: new Date()
      },
      { new: true }
    ).populate('assignedBy', 'firstName lastName email');
    
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }
    
    // Create notification for admin/assigned by user
    const notification = new Notification({
      userId: task.assignedBy._id,
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
        status: 'approved',
        reviewedBy: reviewedBy,
        reviewedAt: new Date()
      },
      { new: true }
    ).populate('assignedTo', 'firstName lastName email');
    
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }
    
    // Create notification for the user
    const notification = new Notification({
      userId: task.assignedTo._id,
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
    ).populate('assignedTo', 'firstName lastName email');
    
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }
    
    // Create notification for the user
    const notification = new Notification({
      userId: task.assignedTo._id,
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

module.exports = router;
