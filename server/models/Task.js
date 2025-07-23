const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, required: true }, // e.g., 'teaching-and-learning'
  docNumber: { type: Number, required: true }, // Which document slot (1-10)
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  assignedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  deadline: { type: Date, required: true },
  status: { 
    type: String, 
    enum: ['pending', 'submitted', 'approved', 'rejected'], 
    default: 'pending' 
  },
  submittedFile: { type: mongoose.Schema.Types.ObjectId }, // Reference to GridFS file
  submittedAt: { type: Date },
  reviewedAt: { type: Date },
  reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  rejectionReason: { type: String },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Task', taskSchema);
