const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  courseCode: { type: String, required: true }, // e.g., "CS101"
  courseName: { type: String, required: true }, // e.g., "DSCA"
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

// Update the updatedAt field before saving
taskSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Task', taskSchema);
