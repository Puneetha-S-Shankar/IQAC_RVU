const express = require('express');
const Notification = require('../models/Notification');
const { authenticateToken } = require('./auth');
const router = express.Router();

// Get notifications for current user with categories
router.get('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user._id;
    const { category, unread } = req.query;
    
    let query = { userId };
    
    // Filter by category (new/read)
    if (category === 'new') {
      query.isRead = false;
    } else if (category === 'read') {
      query.isRead = true;
    }
    
    // Legacy support for unread parameter
    if (unread === 'true') query.isRead = false;
    
    const notifications = await Notification.find(query)
      .populate('taskId', 'title category courseCode courseName _id')
      .sort({ createdAt: -1 })
      .limit(50);
    
    res.json(notifications);
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});

// Get notifications categorized (new vs read)
router.get('/categorized', authenticateToken, async (req, res) => {
  try {
    const userId = req.user._id;
    
    const [newNotifications, readNotifications] = await Promise.all([
      Notification.find({ userId, isRead: false })
        .populate('taskId', 'title category courseCode courseName _id')
        .sort({ createdAt: -1 })
        .limit(25),
      Notification.find({ userId, isRead: true })
        .populate('taskId', 'title category courseCode courseName _id')
        .sort({ createdAt: -1 })
        .limit(25)
    ]);
    
    res.json({
      new: newNotifications,
      read: readNotifications,
      counts: {
        new: newNotifications.length,
        read: readNotifications.length,
        total: newNotifications.length + readNotifications.length
      }
    });
  } catch (error) {
    console.error('Get categorized notifications error:', error);
    res.status(500).json({ error: 'Failed to fetch categorized notifications' });
  }
});

// Mark notification as read and get navigation info
router.put('/:notificationId/read', authenticateToken, async (req, res) => {
  try {
    const { notificationId } = req.params;
    
    const notification = await Notification.findByIdAndUpdate(
      notificationId,
      { isRead: true },
      { new: true }
    ).populate('taskId', 'title category courseCode courseName _id');
    
    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }
    
    // Provide navigation information based on notification type
    let navigationInfo = {};
    
    switch (notification.type) {
      case 'task_assigned':
      case 'assignment_assigned':
        navigationInfo = {
          page: '/roles',
          section: 'assignments',
          taskId: notification.taskId?._id
        };
        break;
      case 'file_submitted':
      case 'file_approved':
      case 'file_rejected':
      case 'reviewer_approved':
      case 'ready_for_final_approval':
        navigationInfo = {
          page: '/roles',
          section: 'assignments',
          taskId: notification.taskId?._id,
          action: 'review'
        };
        break;
      case 'assignment_changed':
        navigationInfo = {
          page: '/roles',
          section: 'assignments',
          taskId: notification.taskId?._id
        };
        break;
      default:
        navigationInfo = {
          page: '/roles',
          section: 'assignments'
        };
    }
    
    res.json({ 
      message: 'Notification marked as read',
      notification,
      navigation: navigationInfo
    });
  } catch (error) {
    console.error('Mark notification read error:', error);
    res.status(500).json({ error: 'Failed to mark notification as read' });
  }
});

// Get notification counts
router.get('/counts', authenticateToken, async (req, res) => {
  try {
    const userId = req.user._id;
    
    const [newCount, readCount, totalCount] = await Promise.all([
      Notification.countDocuments({ userId, isRead: false }),
      Notification.countDocuments({ userId, isRead: true }),
      Notification.countDocuments({ userId })
    ]);
    
    res.json({
      new: newCount,
      read: readCount,
      total: totalCount
    });
  } catch (error) {
    console.error('Get notification counts error:', error);
    res.status(500).json({ error: 'Failed to get notification counts' });
  }
});

// Click notification (mark as read and get navigation)
router.post('/:notificationId/click', authenticateToken, async (req, res) => {
  try {
    const { notificationId } = req.params;
    
    // Mark as read
    const notification = await Notification.findByIdAndUpdate(
      notificationId,
      { isRead: true },
      { new: true }
    ).populate('taskId', 'title category courseCode courseName _id');
    
    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }
    
    // Generate navigation URL based on notification type
    let navigationUrl = '/roles';
    let queryParams = {};
    
    if (notification.taskId) {
      queryParams.taskId = notification.taskId._id;
      
      switch (notification.type) {
        case 'file_submitted':
        case 'file_approved':
        case 'file_rejected':
        case 'reviewer_approved':
        case 'ready_for_final_approval':
          queryParams.action = 'review';
          break;
        case 'task_assigned':
        case 'assignment_assigned':
          queryParams.action = 'view';
          break;
      }
    }
    
    // Build query string
    const queryString = Object.keys(queryParams).length > 0 
      ? '?' + new URLSearchParams(queryParams).toString()
      : '';
    
    res.json({
      message: 'Notification clicked and marked as read',
      navigationUrl: navigationUrl + queryString,
      notification
    });
  } catch (error) {
    console.error('Click notification error:', error);
    res.status(500).json({ error: 'Failed to process notification click' });
  }
});

// Get notifications for a user
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { unread, category } = req.query;
    
    let query = { userId };
    
    if (category === 'new') {
      query.isRead = false;
    } else if (category === 'read') {
      query.isRead = true;
    } else if (unread === 'true') {
      query.isRead = false;
    }
    
    const notifications = await Notification.find(query)
      .populate('taskId', 'title category courseCode courseName _id')
      .sort({ createdAt: -1 })
      .limit(50);
    
    res.json(notifications);
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});

// Mark all notifications as read for current user
router.put('/read-all', authenticateToken, async (req, res) => {
  try {
    const userId = req.user._id;
    
    const result = await Notification.updateMany(
      { userId: userId, isRead: false },
      { isRead: true }
    );
    
    res.json({ 
      message: 'All notifications marked as read',
      modifiedCount: result.modifiedCount
    });
  } catch (error) {
    console.error('Mark all notifications read error:', error);
    res.status(500).json({ error: 'Failed to mark all notifications as read' });
  }
});

// Delete all notifications for current user
router.delete('/clear-all', authenticateToken, async (req, res) => {
  try {
    const userId = req.user._id;
    
    const result = await Notification.deleteMany({ userId: userId });
    
    res.json({ 
      message: 'All notifications cleared successfully',
      deletedCount: result.deletedCount
    });
  } catch (error) {
    console.error('Clear all notifications error:', error);
    res.status(500).json({ error: 'Failed to clear all notifications' });
  }
});

// Delete a notification
router.delete('/:notificationId', authenticateToken, async (req, res) => {
  try {
    const { notificationId } = req.params;
    
    const notification = await Notification.findByIdAndDelete(notificationId);
    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }
    
    res.json({ message: 'Notification deleted successfully' });
  } catch (error) {
    console.error('Delete notification error:', error);
    res.status(500).json({ error: 'Failed to delete notification' });
  }
});

module.exports = router;
