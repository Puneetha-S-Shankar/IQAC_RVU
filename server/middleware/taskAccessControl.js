// Task Access Control Middleware
const Task = require('../models/TaskUpdated');
const User = require('../models/UserUpdated');

// Middleware to check if user can access task-related endpoints
const checkTaskAccess = (action = 'view') => {
  return async (req, res, next) => {
    try {
      const userId = req.user._id;
      const userRole = req.user.role;
      
      // Admin always has access
      if (userRole === 'admin') {
        return next();
      }
      
      // For specific task operations
      if (req.params.taskId) {
        const taskId = req.params.taskId;
        const task = await Task.findById(taskId);
        
        if (!task) {
          return res.status(404).json({ error: 'Task not found' });
        }
        
        const canPerformAction = await task.canUserPerformAction(userId, action);
        
        if (!canPerformAction) {
          return res.status(403).json({ 
            error: `Access denied. You don't have permission to ${action} this task.` 
          });
        }
        
        // Attach task to request for use in route handler
        req.task = task;
      }
      
      next();
    } catch (error) {
      console.error('Task access control error:', error);
      res.status(500).json({ error: 'Access control check failed' });
    }
  };
};

// Middleware to filter tasks based on user access
const filterTasksByAccess = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const userRole = req.user.role;
    
    // Get accessible tasks for this user
    const accessibleTasks = await Task.findAccessibleToUser(userId, userRole);
    
    // Attach filtered tasks to request
    req.accessibleTasks = accessibleTasks;
    
    next();
  } catch (error) {
    console.error('Task filtering error:', error);
    res.status(500).json({ error: 'Task filtering failed' });
  }
};

// Middleware to check if user can create task for specific batch course
const checkBatchCourseAccess = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const userRole = req.user.role;
    const { batchCourseId } = req.body;
    
    // Admin can create tasks for any batch course
    if (userRole === 'admin') {
      return next();
    }
    
    // Check if user is assigned to this batch course with appropriate role
    const user = await User.findById(userId);
    const hasAccess = user.assignedCourses.some(assignment => 
      assignment.batchCourseId === batchCourseId && 
      assignment.isActive &&
      ['coordinator', 'faculty'].includes(assignment.role)
    );
    
    if (!hasAccess) {
      return res.status(403).json({ 
        error: 'You can only create tasks for batch courses you are assigned to as coordinator or faculty.' 
      });
    }
    
    next();
  } catch (error) {
    console.error('Batch course access check error:', error);
    res.status(500).json({ error: 'Batch course access check failed' });
  }
};

module.exports = {
  checkTaskAccess,
  filterTasksByAccess,
  checkBatchCourseAccess
};
