const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { 
    type: String, 
    enum: [
      'task_assigned', 
      'file_submitted', 
      'file_approved', 
      'file_rejected', 
      'reviewer_approved',
      'assignment_changed',
      'assignment_assigned',
      'ready_for_final_approval'
    ], 
    required: true 
  },
  title: { type: String, required: true },
  message: { type: String, required: true },
  taskId: { type: mongoose.Schema.Types.ObjectId, ref: 'Task' },
  fileId: { type: mongoose.Schema.Types.ObjectId },
  isRead: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Notification', notificationSchema);
