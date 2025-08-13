const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  
  // Course context (for organization, not access control)
  courseCode: { type: String, required: true }, // e.g., "CS101"
  courseName: { type: String, required: true }, // e.g., "DSCA"
  
  // DIRECT USER ASSIGNMENT (Support Multiple Users!)
  assignedToInitiators: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // Multiple initiators
  assignedToReviewers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // Multiple reviewers
  assignedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Admin who assigned
  
  // Backward compatibility fields (deprecated but maintained for existing data)
  assignedToInitiator: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  assignedToReviewer: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  
  category: { type: String, default: 'course-document' },
  docNumber: { type: Number, default: 1 }, // For organizing multiple documents
  deadline: { type: Date, required: true },
  status: { 
    type: String, 
    enum: [
      'assigned',           // Task assigned to initiator
      'file-uploaded',      // Initiator has uploaded file
      'in-review',          // File is being reviewed
      'partially-approved', // Some reviewers approved, waiting for others
      'rejected',           // Reviewer rejected the file
      'approved-by-reviewer', // All reviewers approved, waiting for admin
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
  // Track individual reviewer approvals
  reviewerApprovals: [{
    reviewerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    comment: String,
    reviewedAt: Date
  }],
  rejectionReason: { type: String }, // Latest rejection reason
  submittedAt: { type: Date },
  reviewedAt: { type: Date },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// ENHANCED ACCESS CONTROL METHOD (Support Multiple Users)
taskSchema.methods.canUserAccess = function(userId, userRole) {
  // Admin can see everything
  if (userRole === 'admin') return true;
  
  // Check new array-based assignments first
  if (this.assignedToInitiators && this.assignedToInitiators.length > 0) {
    const hasInitiatorAccess = this.assignedToInitiators.some(id => id.toString() === userId.toString());
    if (hasInitiatorAccess) return true;
  }
  
  if (this.assignedToReviewers && this.assignedToReviewers.length > 0) {
    const hasReviewerAccess = this.assignedToReviewers.some(id => id.toString() === userId.toString());
    if (hasReviewerAccess) return true;
  }
  
  // Backward compatibility check for existing single assignments
  const hasLegacyInitiatorAccess = this.assignedToInitiator && this.assignedToInitiator.toString() === userId.toString();
  const hasLegacyReviewerAccess = this.assignedToReviewer && this.assignedToReviewer.toString() === userId.toString();
  
  return hasLegacyInitiatorAccess || hasLegacyReviewerAccess;
};

// ENHANCED QUERY METHOD FOR USER'S TASKS (Support Multiple Users)
taskSchema.statics.findForUser = function(userId, userRole) {
  if (userRole === 'admin') {
    return this.find({}).populate('assignedToInitiators assignedToReviewers assignedToInitiator assignedToReviewer assignedBy'); // Admin sees all
  }
  
  // User sees tasks where they are assigned (either in arrays or legacy single assignments)
  return this.find({
    $or: [
      // New array-based assignments
      { assignedToInitiators: userId },
      { assignedToReviewers: userId },
      // Legacy single assignments (backward compatibility)
      { assignedToInitiator: userId },
      { assignedToReviewer: userId }
    ]
  }).populate('assignedToInitiators assignedToReviewers assignedToInitiator assignedToReviewer assignedBy');
};

// Method to check if user can perform specific action (Enhanced for Multiple Users)
taskSchema.methods.canUserPerformAction = function(userId, action, userRole) {
  // Admin can perform any action
  if (userRole === 'admin') return true;
  
  const userIdStr = userId.toString();
  
  switch (action) {
    case 'view':
      return this.canUserAccess(userId, userRole);
    
    case 'upload':
      // Check if user is in initiators array or legacy assignedToInitiator
      const canUploadNew = this.assignedToInitiators && this.assignedToInitiators.some(id => id.toString() === userIdStr);
      const canUploadLegacy = this.assignedToInitiator && this.assignedToInitiator.toString() === userIdStr;
      return canUploadNew || canUploadLegacy;
    
    case 'review':
      // Check if user is in reviewers array or legacy assignedToReviewer
      const canReviewNew = this.assignedToReviewers && this.assignedToReviewers.some(reviewer => {
        // Handle both populated and non-populated reviewer objects
        const reviewerId = reviewer._id ? reviewer._id.toString() : reviewer.toString();
        return reviewerId === userIdStr;
      });
      const canReviewLegacy = this.assignedToReviewer && this.assignedToReviewer.toString() === userIdStr;
      
      console.log('Review authorization check:', {
        userIdStr,
        assignedToReviewers: this.assignedToReviewers?.map(r => r._id ? r._id.toString() : r.toString()),
        assignedToReviewer: this.assignedToReviewer?.toString(),
        canReviewNew,
        canReviewLegacy,
        reviewerApprovals: this.reviewerApprovals
      });
      
      // Additional check: user shouldn't have already reviewed this task
      const hasAlreadyReviewed = this.hasReviewerApproved(userId) || this.hasReviewerRejected(userId);
      
      console.log('Already reviewed check:', {
        hasReviewerApproved: this.hasReviewerApproved(userId),
        hasReviewerRejected: this.hasReviewerRejected(userId),
        hasAlreadyReviewed
      });
      
      return (canReviewNew || canReviewLegacy) && !hasAlreadyReviewed;
    
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

// Static method to find tasks by course (for admin overview) - Enhanced
taskSchema.statics.findByCourse = function(courseCode) {
  return this.find({ courseCode }).populate('assignedToInitiators assignedToReviewers assignedToInitiator assignedToReviewer assignedBy');
};

// Helper methods for managing multiple assignments
taskSchema.methods.addInitiator = function(userId) {
  if (!this.assignedToInitiators) this.assignedToInitiators = [];
  if (!this.assignedToInitiators.some(id => id.toString() === userId.toString())) {
    this.assignedToInitiators.push(userId);
  }
};

taskSchema.methods.addReviewer = function(userId) {
  if (!this.assignedToReviewers) this.assignedToReviewers = [];
  if (!this.assignedToReviewers.some(id => id.toString() === userId.toString())) {
    this.assignedToReviewers.push(userId);
  }
};

taskSchema.methods.removeInitiator = function(userId) {
  if (this.assignedToInitiators) {
    this.assignedToInitiators = this.assignedToInitiators.filter(id => id.toString() !== userId.toString());
  }
};

taskSchema.methods.removeReviewer = function(userId) {
  if (this.assignedToReviewers) {
    this.assignedToReviewers = this.assignedToReviewers.filter(id => id.toString() !== userId.toString());
  }
};

// Helper method to get all initiators (including legacy)
taskSchema.methods.getAllInitiators = function() {
  let initiators = [];
  
  if (this.assignedToInitiators && this.assignedToInitiators.length > 0) {
    // Extract ObjectIds whether populated or not
    initiators = this.assignedToInitiators.map(initiator => {
      // If it's a populated object, get the _id; otherwise it's already an ObjectId
      return initiator._id || initiator;
    });
  }
  
  if (this.assignedToInitiator) {
    const initiatorId = this.assignedToInitiator._id || this.assignedToInitiator;
    if (!initiators.some(id => id.toString() === initiatorId.toString())) {
      initiators.push(initiatorId);
    }
  }
  
  return initiators;
};

// Helper method to get all reviewers (including legacy)
taskSchema.methods.getAllReviewers = function() {
  let reviewers = [];
  
  if (this.assignedToReviewers && this.assignedToReviewers.length > 0) {
    // Extract ObjectIds whether populated or not
    reviewers = this.assignedToReviewers.map(reviewer => {
      // If it's a populated object, get the _id; otherwise it's already an ObjectId
      return reviewer._id || reviewer;
    });
  }
  
  if (this.assignedToReviewer) {
    const reviewerId = this.assignedToReviewer._id || this.assignedToReviewer;
    if (!reviewers.some(id => id.toString() === reviewerId.toString())) {
      reviewers.push(reviewerId);
    }
  }
  
  return reviewers;
};

// Initialize reviewer approvals for tracking
taskSchema.methods.initializeReviewerApprovals = function() {
  const allReviewers = this.getAllReviewers();
  
  console.log('initializeReviewerApprovals called:', {
    allReviewers: allReviewers.map(r => r.toString()),
    existingApprovals: this.reviewerApprovals?.map(a => ({
      reviewerId: a.reviewerId?.toString(),
      status: a.status
    }))
  });
  
  if (!this.reviewerApprovals) {
    this.reviewerApprovals = [];
  }
  
  // Remove duplicates first
  const seen = new Set();
  this.reviewerApprovals = this.reviewerApprovals.filter(approval => {
    const id = approval.reviewerId.toString();
    if (seen.has(id)) {
      console.log('Removing duplicate approval for:', id);
      return false;
    }
    seen.add(id);
    return true;
  });
  
  // Add any missing reviewers to the approvals tracking
  allReviewers.forEach(reviewerId => {
    const exists = this.reviewerApprovals.some(approval => 
      approval.reviewerId.toString() === reviewerId.toString()
    );
    
    if (!exists) {
      console.log('Adding new approval entry for reviewer:', reviewerId.toString());
      this.reviewerApprovals.push({
        reviewerId: reviewerId,
        status: 'pending'
      });
    } else {
      console.log('Approval entry already exists for reviewer:', reviewerId.toString());
    }
  });
  
  console.log('After initialization:', {
    reviewerApprovals: this.reviewerApprovals.map(a => ({
      reviewerId: a.reviewerId?.toString(),
      status: a.status
    }))
  });
};

// Check if a specific reviewer has already reviewed
taskSchema.methods.hasReviewerApproved = function(reviewerId) {
  if (!this.reviewerApprovals || this.reviewerApprovals.length === 0) {
    console.log('hasReviewerApproved: No reviewer approvals found');
    return false;
  }
  
  console.log('hasReviewerApproved - reviewerApprovals details:', {
    reviewerApprovals: this.reviewerApprovals.map(approval => ({
      reviewerId: approval.reviewerId?.toString(),
      status: approval.status,
      _id: approval._id
    })),
    searchingFor: reviewerId.toString()
  });
  
  const approval = this.reviewerApprovals.find(approval => 
    approval.reviewerId.toString() === reviewerId.toString()
  );
  
  console.log('hasReviewerApproved check:', {
    reviewerId: reviewerId.toString(),
    approval,
    result: approval && approval.status === 'approved'
  });
  
  return approval && approval.status === 'approved';
};

// Check if a specific reviewer has rejected
taskSchema.methods.hasReviewerRejected = function(reviewerId) {
  if (!this.reviewerApprovals || this.reviewerApprovals.length === 0) {
    console.log('hasReviewerRejected: No reviewer approvals found');
    return false;
  }
  
  console.log('hasReviewerRejected - reviewerApprovals details:', {
    reviewerApprovals: this.reviewerApprovals.map(approval => ({
      reviewerId: approval.reviewerId?.toString(),
      status: approval.status,
      _id: approval._id
    })),
    searchingFor: reviewerId.toString()
  });
  
  const approval = this.reviewerApprovals.find(approval => 
    approval.reviewerId.toString() === reviewerId.toString()
  );
  
  console.log('hasReviewerRejected check:', {
    reviewerId: reviewerId.toString(),
    approval,
    result: approval && approval.status === 'rejected'
  });
  
  return approval && approval.status === 'rejected';
};

// Check if all reviewers have approved
taskSchema.methods.allReviewersApproved = function() {
  const allReviewers = this.getAllReviewers();
  
  console.log('allReviewersApproved check:', {
    allReviewers: allReviewers.map(r => r.toString()),
    allReviewersCount: allReviewers.length,
    reviewerApprovals: this.reviewerApprovals.map(a => ({
      reviewerId: a.reviewerId.toString(),
      status: a.status
    })),
    reviewerApprovalsCount: this.reviewerApprovals.length
  });
  
  if (allReviewers.length === 0) {
    console.log('allReviewersApproved: No reviewers assigned');
    return false;
  }
  if (!this.reviewerApprovals || this.reviewerApprovals.length === 0) {
    console.log('allReviewersApproved: No reviewer approvals found');
    return false;
  }
  
  const result = allReviewers.every(reviewerId => {
    const approval = this.reviewerApprovals.find(approval => 
      approval.reviewerId.toString() === reviewerId.toString()
    );
    const hasApproved = approval && approval.status === 'approved';
    console.log(`Reviewer ${reviewerId.toString()}: ${hasApproved ? 'approved' : 'not approved'}`);
    return hasApproved;
  });
  
  console.log('allReviewersApproved result:', result);
  return result;
};

// Check if any reviewer has rejected
taskSchema.methods.anyReviewerRejected = function() {
  if (!this.reviewerApprovals || this.reviewerApprovals.length === 0) return false;
  
  return this.reviewerApprovals.some(approval => approval.status === 'rejected');
};

// Record a reviewer's decision
taskSchema.methods.recordReviewerDecision = function(reviewerId, decision, comment) {
  if (!this.reviewerApprovals) {
    this.reviewerApprovals = [];
  }
  
  // Find existing approval record or create new one
  let approval = this.reviewerApprovals.find(approval => 
    approval.reviewerId.toString() === reviewerId.toString()
  );
  
  if (!approval) {
    approval = {
      reviewerId: reviewerId,
      status: 'pending'
    };
    this.reviewerApprovals.push(approval);
  }
  
  // Update the approval record
  approval.status = decision; // 'approved' or 'rejected'
  approval.comment = comment;
  approval.reviewedAt = new Date();
  
  // Update overall task status based on reviewer decisions
  console.log('Status update check:', {
    anyReviewerRejected: this.anyReviewerRejected(),
    allReviewersApproved: this.allReviewersApproved(),
    currentStatus: this.status,
    totalReviewers: this.getAllReviewers().length,
    approvedCount: this.reviewerApprovals.filter(a => a.status === 'approved').length
  });
  
  if (this.anyReviewerRejected()) {
    this.status = 'rejected';
    console.log('Status updated to: rejected');
  } else if (this.allReviewersApproved()) {
    this.status = 'approved-by-reviewer';
    console.log('Status updated to: approved-by-reviewer (all reviewers approved)');
  } else {
    // Some approved, some pending - keep status as partially-approved or in-review
    const hasAnyApproved = this.reviewerApprovals.some(approval => approval.status === 'approved');
    const allReviewers = this.getAllReviewers();
    
    if (hasAnyApproved) {
      this.status = 'partially-approved';
      console.log('Status updated to: partially-approved (some reviewers approved, others pending)');
    } else {
      this.status = 'in-review';
      console.log('Status updated to: in-review');
    }
  }
};

// Update the updatedAt field before saving
taskSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Task', taskSchema);
