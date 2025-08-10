const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  
  // Course context (for organization, not access control)
  courseCode: { type: String, required: true }, // e.g., "CS101"
  courseName: { type: String, required: true }, // e.g., "DSCA"
  
  // DIRECT USER ASSIGNMENT (Simple & Clear!)
  assignedToInitiator: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  assignedToReviewer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  assignedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Admin who assigned
  
  category: { type: String, default: 'course-document' },
  docNumber: { type: Number, default: 1 }, // For organizing multiple documents
  deadline: { type: Date, required: true },
  status: { 
    type: String, 
    enum: [
      'assigned',           // Task assigned to initiator
      'file-uploaded',      // Initiator has uploaded file
      'in-review',          // File is being reviewed
      'rejected',           // Reviewer rejected the file
      'approved-by-reviewer', // Reviewer approved, waiting for admin
      'approved-by-admin',  // Admin final approval
      'completed'           // Fully completed
    ], 
    default: 'assigned' 
  },
  fileId: { type: mongoose.Schema.Types.ObjectId }, // Associated file
  reviewComments: [{ 
    comment: String,
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    reviewedAt: { type: Date, default: Date.now },
    action: { type: String, enum: ['approved', 'rejected'] }
  }],
  rejectionReason: { type: String }, // Latest rejection reason
  submittedAt: { type: Date },
  reviewedAt: { type: Date },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// SIMPLE ACCESS CONTROL METHOD
taskSchema.methods.canUserAccess = function(userId, userRole) {
  // Admin can see everything
  if (userRole === 'admin') return true;
  
  // Direct assignment check (SIMPLE!)
  return this.assignedToInitiator.toString() === userId.toString() || 
         this.assignedToReviewer.toString() === userId.toString();
};

// SIMPLE QUERY METHOD FOR USER'S TASKS
taskSchema.statics.findForUser = function(userId, userRole) {
  if (userRole === 'admin') {
    return this.find({}).populate('assignedToInitiator assignedToReviewer assignedBy'); // Admin sees all
  }
  
  // User sees only their directly assigned tasks
  return this.find({
    $or: [
      { assignedToInitiator: userId },
      { assignedToReviewer: userId }
    ]
  }).populate('assignedToInitiator assignedToReviewer assignedBy');
};

// Method to check if user can perform specific action
taskSchema.methods.canUserPerformAction = function(userId, action, userRole) {
  // Admin can perform any action
  if (userRole === 'admin') return true;
  
  const userIdStr = userId.toString();
  
  switch (action) {
    case 'view':
      return this.canUserAccess(userId, userRole);
    
    case 'upload':
      // Only assigned initiator can upload
      return this.assignedToInitiator.toString() === userIdStr;
    
    case 'review':
      // Only assigned reviewer can review
      return this.assignedToReviewer.toString() === userIdStr;
    
    case 'approve':
      // Only admin can give final approval
      return userRole === 'admin';
    
    case 'assign':
      // Only admin can assign tasks
      return userRole === 'admin';
    
    default:
      return false;
  }
};

// Static method to find tasks by course (for admin overview)
taskSchema.statics.findByCourse = function(courseCode) {
  return this.find({ courseCode }).populate('assignedToInitiator assignedToReviewer assignedBy');
};

// Update the updatedAt field before saving
taskSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Task', taskSchema);
